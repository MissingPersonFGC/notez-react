import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames';
import PopulateCharacters from './PopulateCharacters';
import PopulateFilters from './PopulateFilters';

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
            userId: '',
            length: ''
        }

        this.pullCharactersAndFilters = this.pullCharactersAndFilters.bind(this);
        this.setYourChar = this.setYourChar.bind(this);
        this.setOppChar = this.setOppChar.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.setNote = this.setNote.bind(this);
        this.addNote = this.addNote.bind(this);
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            this.setState({
                userId: user.uid
            });
        });
        this.dbRefUser = firebase.database().ref(`users/${this.state.userId}`);

        this.dbRefUser.on("value", snapshot => {
            const value = snapshot.val();
            for (let user in value) {
                const getUserName = value[user];
                for (let userName in getUserName) {
                    this.setState({
                        userName: getUserName[userName]
                    });
                }
            }
        });

        this.dbRefGames = firebase.database().ref(`gameData/`);

        this.dbRefGames.on("value", snapshot => {
            this.setState({
                gameData: snapshot.val()
            });
        });
    }

    pullCharactersAndFilters(e) {
        const yourFilters = [];
        const selectedGame = e.target.value;
        let characterData = [];
        this.dbRefCharacters = firebase.database().ref(`characterData/${selectedGame}/`);
        this.dbRefCharacters.on("value", snapshot => {
            characterData = snapshot.val();
        });
        const yourGame = selectedGame;
        this.dbRefFilterGameSpecific = firebase.database().ref(`punishData/${yourGame}/`);
        this.dbRefFilterGlobal = firebase.database().ref(`punishData/global/`);
        this.dbRefFilterGlobal.on("value", snapshot => {
            const filters = snapshot.val();
            filters.forEach((filter) => {
                yourFilters.push(filter);
            });
        });
        this.dbRefFilterGameSpecific.on("value", snapshot => {
            const filters = snapshot.val();
            filters.forEach((filter) => {
                yourFilters.push(filter);
            });
            this.setState({
                filterData: yourFilters,
                yourGame: selectedGame,
                characterData: characterData
            });
        });
    }

    setYourChar(e) {
        const yourChar = e.target.value;
        this.setState({
            yourCharacter: yourChar
        });
    }

    setOppChar(e) {
        const oppChar = e.target.value;
        this.setState({
            oppCharacter: oppChar
        });
    }

    setFilter(e) {
        const selectedFilter = e.target.value;
        this.setState({
            noteType: selectedFilter
        });
    }

    setNote(e) {
        const note = e.target.value;
        this.setState({
            noteContent: note
        })
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
        let length
        this.state.filterData.forEach((theFilters) => {
            if (theFilters.noteShorthand === filter) {
                filterLong = theFilters.noteType;
            } 
        });
        const noteFormatted = {
            "note": note,
            "noteLongform": filterLong,
            "noteType": filter
        };
        this.dbRefNotesLocation = firebase.database().ref(`userData/${user}/gameNotes/${game}/${you}/${opponent}/`);
        
        this.dbRefNotesLocation.push(noteFormatted);
    }

    postActualNotes(user, game, you, opponent, noteFormatted) {
        this.dbRefNotePosition = firebase.database().ref(`userData/${user}/gameNotes/${game}/${you}/${opponent}/${this.state.length}`);
        
    }

    render() {
        return(
            <div>
                <div class="add-notes-game">
                    <h4>Game:</h4>
                    <select class="your-game" name="gameShorthand" defaultValue="" onChange={this.pullCharactersAndFilters}>
                        <option value="" disabled>--Select your game--</option>
                        {this.state.gameData.map((game, index) => {
                            return <PopulateGames gameName={game.gameName} gameShorthand={game.gameShorthand} gameKey={index} key={index} />
                        })}
                    </select>
                </div>
                <div class="add-notes-matchup">
                    <h4>Matchup:</h4>
                    <select class="your-character" name="yourCharacter" onChange={this.setYourChar}>
                        <option value="" disabled selected>--Your character--</option>
                        {this.state.characterData.map((character, index) => {
                            return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index}/>
                        })}
                    </select>

                    vs.

                    <select class="opp-character" name="opponentCharacter" onChange={this.setOppChar}>
                        <option value="" disabled selected>--Their character--</option>
                        {this.state.characterData.map((character, index) => {
                            return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index}/>
                        })}
                    </select>
                </div>
                <div class="add-notes-type">
                    <h4>Type of Note:</h4>

                    <select class="note-type" name="noteType" onChange={this.setFilter}>
                        <option value="" disabled selected>--Note type--</option>
                        {this.state.filterData.map((filter, index) => {
                            return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                        })}
                    </select>
                </div>
                <div class="add-notes-note">
                    <h4>Note:</h4>
                    <textarea name="note" rows="2" cols="50" onChange={this.setNote}></textarea>
                </div>
                <div class="add-notes-submit">
                    <a href="" className="notes-add-submit button" onClick={this.addNote}><i class="far fa-plus-square"></i> Add</a>
                </div>
            </div>
        )
    }
}

export default AddNotes;