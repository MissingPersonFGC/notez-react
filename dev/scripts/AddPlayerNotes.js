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
        this.setYourChar = this.setYourChar.bind(this);
        this.setOppChar = this.setOppChar.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.setNote = this.setNote.bind(this);
        this.addNote = this.addNote.bind(this);
        this.setNewPlayer = this.setNewPlayer.bind(this);
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
            

            this.dbRefUser.on("value", snapshot => {
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

    pullGames(e) {

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

        this.setState({
            noteContent: ''
        })
    }

    setNewPlayer(e) {
        const player = e.target.value;
        this.setState({
            newPlayer: player
        });
    }

    addPlayer(e) {
        e.preventDefault();
        const player = this.state.newPlayer;
        this.state.playerData.push(player);
        this.setState({
            opponent: player,
            newPlayer: ''
        });
    }

    render() {
        return(
            <div className="add-notes-popup">
                <div className="add-notes-game">
                    <h4>Opponent:</h4>
                    <select className="your-game" name="gameShorthand" value={this.state.opponent} onChange={this.pullGames}>
                        <option value="" disabled>------</option>
                        {this.state.playerData.map((player, index) => {
                            return <PopulatePlayers playerName={player} key={index} />
                        })}
                    </select>
                    <p>New player?</p>
                    <input type="text" onChange={this.setNewPlayer} value={this.state.newPlayer}></input> <a href="" className="notes-add-submit button" onClick={this.addPlayer}><i className="far fa-plus-square"></i> Add Player</a>
                </div>
                <div className="add-notes-matchup">
                    <h4>Game:</h4>
                    <select className="your-character" name="yourCharacter" onChange={this.setGame} value={this.state.yourGame}>
                        <option value="" disabled selected>------</option>
                        {this.state.gameData.map((game, index) => {
                            return <PopulateGames gameName={game.gameName} gameShorthand={game.gameShorthand} gameKey={index} key={index} />
                        })}
                    </select>
                </div>
                <div className="add-notes-type">
                    <h4>Type of Note:</h4>

                    <select className="note-type" name="noteType" onChange={this.setFilter}>
                        <option value="" disabled selected>--Note type--</option>
                        {this.state.filterData.map((filter, index) => {
                            return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                        })}
                    </select>
                </div>
                <div className="add-notes-note">
                    <h4>Note:</h4>
                    <textarea name="note" rows="2" cols="50" onChange={this.setNote} value={this.state.noteContent}></textarea>
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