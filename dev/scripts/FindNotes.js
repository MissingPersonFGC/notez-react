import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames';
import PopulateCharacters from './PopulateCharacters';
import PopulateNotes from './PopulateNotes';

class FindNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            loggedIn: true,
            userName: '',
            userId: '',
            gameData: [],
            characterData: [],
            gameNotes: [],
            punishData: [],
            selectedGame: '',
            yourCharacter: '',
            oppCharacter: '',
            noteClass: ''
        };
        this.doLogout = this.doLogout.bind(this);
        this.pullCharacters = this.pullCharacters.bind(this);
        this.setYourChar = this.setYourChar.bind(this);
        this.setOppChar = this.setOppChar.bind(this);
        this.getGameNotes = this.getGameNotes.bind(this);
    }

    componentDidMount() {
        let userIdFromDB = '';
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

    doLogout(e) {
        firebase.auth().signOut().then((res) => {
            this.setState({
                loggedIn: false
            });
        });
    }

    pullCharacters(e) {
        const selectedGame = e.target.value;
        this.dbRefCharacters = firebase.database().ref(`characterData/${selectedGame}/`);
        this.dbRefCharacters.on("value", snapshot => {
            this.setState({
                selectedGame: selectedGame,
                characterData: snapshot.val()
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

    getGameNotes(e) {
        e.preventDefault();
        const yourGame = this.state.selectedGame;
        const yourChar = this.state.yourCharacter;
        const oppChar = this.state.oppCharacter;
        const you = this.state.userName;

        this.dbRefGameNotes = firebase.database().ref(`userData/${you}/gameNotes/${yourGame}/${yourChar}/${oppChar}/`);
        this.dbRefGameNotes.on("value", snapshot => {
            this.setState({
                gameNotes: snapshot.val(),
                noteClass: `${yourChar}-v-${oppChar}`
            })
        });

        console.log(this.state.noteClass);
    }
    
    render() {
        return(
            <div>
                <div className="notes-header">
                    <div className="container">
                        <div className="notes-header__heading">
                            <h1>NoteZ</h1>
                        </div>
                        <div className="notes-header__user">
                            <p>Welcome, {this.state.userName}!</p>
                            <div className="notes-header__user__button">
                                <button onClick={this.doLogout}>Sign-out</button>
                            </div>
                        </div>
                    </div>
                </div>
                <main>
                    <section className="selection-head">
                        <h2>Select your game:</h2>
                    </section>
                    <section className="game-select">
                        <select name="your-game" id="your-game" className="your-game" defaultValue="" onChange={this.pullCharacters}>
                            <option key="empty" value="" disabled>--Select your game--</option>
                            {this.state.gameData.map((game, index) => {
                                return <PopulateGames gameName={game.gameName} gameShorthand={game.gameShorthand} gameKey={index} key={index} />
                            })}
                        </select>
                    </section>
                    <section className="selection-head">
                        <h2>Select your matchup:</h2>
                    </section>
                    <section className="char-select clearfix">
                        <select className="your-character" name="your-character" defaultValue="" onChange={this.setYourChar}>
                            <option value="" disabled>--Your character--</option>
                            {this.state.characterData.map((character, index) => {
                                return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index}/>
                            })}
                        </select>
                        vs.
                        <select className="opp-character" name="opp-character" defaultValue="" onChange={this.setOppChar}>
                            <option value="" disabled>--Their character--</option>
                            {this.state.characterData.map((character, index) => {
                                return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index}/>
                            })}
                        </select>

                        <a href="#stick" className="button show-notes desktop" onClick={this.getGameNotes}><i className="fas fa-eye"></i> Show Notes</a>

                        {/* Create separate button that will display on mobile devices. */}
                        <div className="button-break">
                            <a href="#stick" className="button show-notes mobile"><i className="fas fa-eye"></i> Show Notes</a>
                        </div>
                    </section>
                    <section className="char-notes">
                        <div className="wrapper">
                        Filter by:
                        <select className="note-filter" name="note-filter">
                            <option value="" disabled selected>--Filter by--</option>
                        </select>
                        <a href="#stick" className="button filter desktop"><i class="fas fa-filter"></i> Filter</a>
                        <a href="#stick" className="button show-all desktop"><i class="fas fa-sync-alt"></i> Show All</a>

                        {/* Create separate buttons that will display on mobile devices. */}
                        <div className="button-break">
                            <a href="#stick" className="button filter mobile"><i class="fas fa-filter"></i> Filter</a>
                            <a href="#stick" className="button show-all mobile"><i class="fas fa-sync-alt"></i> Show All</a>
                        </div>
                        </div>
                        <div className="notes" id="stick">
                        <ul>
                            {this.state.gameNotes.map((note, index) => {
                                return <PopulateNotes yourCharacter={this.state.yourCharacter} oppCharacter={this.state.oppCharacter} noteShorthand={note.noteType} noteLong={note.noteLongform} note={note.note} noteClass={this.state.noteClass} key={index} />
                            })}
                        </ul>
                        </div>
                    </section>
                </main>
            </div>
        )
    }
}

export default FindNotes;