import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';

class AddPlayerNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            gameData: [],
            playerData: [],
            filterData: [],
            yourGame: '',
            opponent: '',
            noteType: '',
            noteContent: '',
            userName: '',
            userId: '',
            newPlayer: ''
        }

        this.pullGames = this.pullGames.bind(this);
        this.changeStateValue = this.changeStateValue.bind(this);
        this.addNote = this.addNote.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {

            this.setState({
                userId: user.uid
            });

            this.dbRefUser = firebase.database().ref(`users/${user.uid}`);

            this.dbRefFilters = firebase.database().ref(`playerFilters/`);
            

            this.dbRefUser.once("value", snapshot => {
                const value = snapshot.val();
                for (let user in value) {
                    const getUserName = value[user];
                    this.setState({
                        userName: getUserName
                    });

                    this.dbRefAvailablePlayers = firebase.database().ref(`userData/${getUserName}/playerNotes/`);

                    this.dbRefAvailablePlayers.on('value', (snapshot) => {
                        const playersDb = snapshot.val();
                        const playerList = []

                        for (let name in playersDb) {
                            playerList.push({
                                label: name,
                                value: name
                            });
                        }

                        this.dbRefFilters.on('value', (snapshot) => {
                            const filters = snapshot.val();
                            const mutatedFilters = [];
                            filters.map(filter => {
                                mutatedFilters.push({
                                    label: filter.noteType,
                                    value: filter.noteShorthand
                                });
                            });
                            this.setState({
                                filterData: mutatedFilters,
                                playerData: playerList
                            });
                        }); 
                    });
                }
            });
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    changeStateValue(e, a) {
        const value = e.value || e.target.value;
        const { name } = a || e.target;
        this.setState({
            [name]: value
        });
    }

    pullGames(e) {
        const opponent = e.value;
        const you = this.state.userName;
        this.dbRefAllGames = firebase.database().ref('gameData/');
        this.dbRefAllGames.once('value', (snapshot) => {
            const unusedGames = []
            const allGames = snapshot.val();
            allGames.map(game => {
                unusedGames.push({
                    label: game.gameName,
                    value: game.gameShorthand
                })
            })
            this.dbRefPlayersGames = firebase.database().ref(`userData/${you}/playerNotes/${opponent}`);
            this.dbRefPlayersGames.once('value', (snapshot) => {
                const rawGames = snapshot.val();
                for (let item in rawGames) {
                    const index = unusedGames.findIndex(g => g.value == item);
                    unusedGames.splice(index, 1);
                }
                this.setState({
                    opponent: opponent,
                    gameData: unusedGames
                });
            });
        });
    }

    addNote(e) {
        e.preventDefault();
        const game = this.state.yourGame;
        const you = this.state.userName;
        const opponent = this.state.opponent;
        const filter = this.state.noteType;
        const note = this.state.noteContent;
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
        this.dbRefNotesLocation = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/`);
        
        this.dbRefNotesLocation.push(noteFormatted);

        this.setState({
            noteContent: ''
        })
    }

    addPlayer(e) {
        e.preventDefault();
        const player = this.state.newPlayer;
        this.state.playerData.push(player);
        this.dbRefAllGames = firebase.database().ref('gameData/');
        this.dbRefAllGames.on('value', (snapshot) => {
            const games = snapshot.val();
            this.setState({
                opponent: player,
                newPlayer: '',
                gameData: games
            });
        });
    }

    render() {
        return(
            <div className="add-notes-popup">
                <div className="add-notes-game">
                    <h4>Opponent:</h4>
                    <CreatableSelect options={this.state.playerData} onChange={this.pullGames} onInputChange="this.pullGames" />
                </div>
                <div className="add-notes-matchup">
                    <h4>Game:</h4>
                    <Select name="yourGame" onChange={this.changeStateValue} options={this.state.gameData} />
                </div>
                <div className="add-notes-type">
                    <h4>Type of Note:</h4>
                    <Select name="noteType" onChange={this.changeStateValue} options={this.state.filterData} />
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

export default AddPlayerNotes;