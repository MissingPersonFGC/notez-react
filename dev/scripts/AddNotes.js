import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames';
import PopulateCharacters from './PopulateCharacters';
import PopulateFilters from './PopulateFilters';
import Select from 'react-select';

class AddNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            gameData: [],
            characterData: [],
            filterData: [],
            yourGame: '',
            yourCharacter: '',
            oppCharacter: '',
            noteType: '',
            noteContent: '',
            userName: '',
            userId: ''
        }

        this.pullCharactersAndFilters = this.pullCharactersAndFilters.bind(this);
        this.changeStateValue = this.changeStateValue.bind(this);
        this.addNote = this.addNote.bind(this);
    }

    componentDidMount() {
        let getUserName = '';
        firebase.auth().onAuthStateChanged(user => {
            this.setState({
                userId: user.uid
            });

            this.dbRefUser = firebase.database().ref(`users/${user.uid}`);

            this.dbRefUser.once("value", snapshot => {
                const value = snapshot.val();
                for (let user in value) {
                    getUserName = value[user];
                    this.dbRefGames = firebase.database().ref(`gameData/`);
                    this.dbRefGames.once('value', (snapshot2) => {
                        const unusedGames = []
                        snapshot2.val().map(game => {
                            unusedGames.push({
                                value: game.gameShorthand,
                                label: game.gameName
                            })
                        });                    

                        this.dbRefYourGames = firebase.database().ref(`userData/${getUserName}/gameNotes`)
                        this.dbRefYourGames.once('value', (snapshot3) => {
                            const yourGames = snapshot3.val();
                            for (let game in yourGames) {
                                const index = unusedGames.findIndex(g => 
                                    g.value == game
                                );
                                unusedGames.splice(index, 1);
                            }

                            this.setState({
                                userName: getUserName,
                                gameData: unusedGames
                            });
                        });
                    });
                }
            });
        });
    }

    pullCharactersAndFilters(e) {
        const yourFilters = [];
        const selectedGame = e.value;
        const characterData = [];
        this.dbRefCharacters = firebase.database().ref(`characterData/${selectedGame}/`);
        this.dbRefCharacters.on("value", snapshot => {
            const characters = snapshot.val()
            characters.map(character => {
                characterData.push({
                    label: character.characterName,
                    value: character.characterShorthand
                })
            })
        });
        const yourGame = selectedGame;
        this.dbRefFilterGameSpecific = firebase.database().ref(`punishData/${yourGame}/`);
        this.dbRefFilterGlobal = firebase.database().ref(`punishData/global/`);
        this.dbRefFilterGlobal.on("value", snapshot => {
            const filters = snapshot.val();
            filters.forEach((filter) => {
                yourFilters.push({
                    label: filter.noteType,
                    value: filter.noteShorthand
                })
            });
        });
        this.dbRefFilterGameSpecific.on("value", snapshot => {
            const filters = snapshot.val();
            if (filters !== null) {
                filters.forEach((filter) => {
                    yourFilters.push({
                        label: filter.noteType,
                        value: filter.noteShorthand
                    })
                });
            }
            this.setState({
                filterData: yourFilters,
                yourGame: selectedGame,
                characterData: characterData
            });
        });
    }

    changeStateValue(e, a) {
        const value = e.value || e.target.value;
        const { name } = a || e.target;
        this.setState({
            [name]: value
        });
    }

    addNote(e) {
        e.preventDefault();
        const game = this.state.yourGame;
        const you = this.state.yourCharacter;
        const opponent = this.state.oppCharacter;
        const filter = this.state.noteType;
        const note = this.state.noteContent;
        const user = this.state.userName;
        let filterLong = '';
        this.state.filterData.forEach((theFilters) => {
            if (theFilters.value === filter) {
                filterLong = theFilters.label;
            } 
        });
        const noteFormatted = {
            "note": note,
            "noteLongform": filterLong,
            "noteType": filter
        };
        this.dbRefNotesLocation = firebase.database().ref(`userData/${user}/gameNotes/${game}/${you}/${opponent}/`);
        
        this.dbRefNotesLocation.push(noteFormatted);

        this.setState({
            noteContent: ''
        })
    }

    render() {
        return(
            <div className="add-notes-popup">
                <div className="add-notes-game">
                    <h4>Game:</h4>
                    <Select options={this.state.gameData} onChange={this.pullCharactersAndFilters}></Select>
                </div>
                <div className="add-notes-matchup">
                    <h4>Your character:</h4>
                    <Select options={this.state.characterData} name="yourCharacter" onChange={this.changeStateValue} />
                </div>
                <div className="add-notes-matchup">
                    <h4>Opponent's character:</h4>
                    <Select options={this.state.characterData} name="oppCharacter" onChange={this.changeStateValue} />
                </div>
                <div className="add-notes-type">
                    <h4>Type of Note:</h4>
                    <Select options={this.state.filterData} name="noteType" onChange={this.changeStateValue} />
                </div>
                <div className="add-notes-note">
                    <h4>Note:</h4>
                    <textarea name="noteContent" rows="2" cols="50" onChange={this.changeStateValue} value={this.state.noteContent}></textarea>
                </div>
                <div className="add-notes-submit">
                    <a href="" className="notes-add-submit button" onClick={this.addNote}><i className="far fa-plus-square"></i> Add</a>
                    <Link to="/">Back</Link>
                </div>
            </div>
        )
    }
}

export default AddNotes;