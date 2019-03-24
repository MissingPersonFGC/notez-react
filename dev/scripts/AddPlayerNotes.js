import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames';
import PopulatePlayers from './PopulatePlayers';
import PopulateFilters from './PopulateFilters';

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
                userId: user.uid,
                loggedIn: true
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
                            playerList.push(name);
                        }

                        this.dbRefFilters.on('value', (snapshot) => {
                            const filters = snapshot.val();
                            this.setState({
                                filterData: filters,
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

    changeStateValue(e) {
        const { name, value } = e.target.name;
        this.setState({
            [name]: value
        });
    }

    pullGames(e) {
        const opponent = e.target.value;
        const you = this.state.userName;
        this.dbRefAllGames = firebase.database().ref('gameData/');
        this.dbRefAllGames.once('value', (snapshot) => {
            const unusedGames = snapshot.val();

            this.dbRefPlayersGames = firebase.database().ref(`userData/${you}/playerNotes/${opponent}`);
            this.dbRefPlayersGames.once('value', (snapshot) => {
                const rawGames = snapshot.val();
                for (let item in rawGames) {
                    const index = unusedGames.findIndex(g => g.gameShorthand == item);
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
            if (theFilters.noteShorthand === filter) {
                filterLong = theFilters.noteType;
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
                    <select className="your-game" name="opponent" value={this.state.opponent} onChange={this.pullGames}>
                        <option value="" disabled>------</option>
                        {this.state.playerData.map((player, index) => {
                            return <PopulatePlayers playerName={player} key={index} />
                        })}
                    </select>
                    <h4>New opponent?</h4>
                    <input type="text" name="newPlayer" onChange={this.changeStateValue} value={this.state.newPlayer}></input> <a href="" className="notes-add-submit button" onClick={this.addPlayer}><i className="far fa-plus-square"></i> Add Player</a>
                </div>
                <div className="add-notes-matchup">
                    <h4>Game:</h4>
                    <select className="your-character" name="yourGame" onChange={this.changeStateValue} value={this.state.yourGame}>
                        <option value="" disabled selected>------</option>
                        {this.state.gameData.map((game, index) => {
                            return <PopulateGames gameName={game.gameName} gameShorthand={game.gameShorthand} gameKey={index} key={index} />
                        })}
                    </select>
                </div>
                <div className="add-notes-type">
                    <h4>Type of Note:</h4>

                    <select className="note-type"  value={this.state.noteType} name="noteType" onChange={this.changeStateValue}>
                        <option value="" disabled selected>------</option>
                        {this.state.filterData.map((filter, index) => {
                            return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                        })}
                    </select>
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