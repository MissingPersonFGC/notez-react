import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames';
import PopulateCharacters from './PopulateCharacters';

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
            oppCharacter: ''
        };
        this.doLogout = this.doLogout.bind(this);
        this.pullCharacters = this.pullCharacters.bind(this);
        this.setYourChar = this.setYourChar.bind(this);
        this.setOppChar = this.setOppChar.bind(this);
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
        this.dbRefPunish = firebase.database().ref(`punishData/`);
        this.dbRefGameNotes = firebase.database().ref(`userData/${this.state.userName}/gameNotes/`);

        this.dbRefGames.on("value", snapshot => {
            console.log(snapshot.val());
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
                    <section class="selection-head">
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
                    <section class="selection-head">
                        <h2>Select your matchup:</h2>
                    </section>
                    <section class="char-select clearfix">
                        <select class="your-character" name="your-character" defaultValue="" onChange={this.setYourChar}>
                            <option value="" disabled>--Your character--</option>
                            {this.state.characterData.map((character, index) => {
                                return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index}/>
                            })}
                        </select>
                        vs.
                        <select class="opp-character" name="opp-character" defaultValue="" onChange={this.setOppChar}>
                            <option value="" disabled>--Their character--</option>
                            {this.state.characterData.map((character, index) => {
                                return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index}/>
                            })}
                        </select>

                        <a href="#stick" class="button show-notes desktop"><i class="fas fa-eye"></i> Show Notes</a>

                        {/* Create separate button that will display on mobile devices. */}
                        <div class="button-break">
                            <a href="#stick" class="button show-notes mobile"><i class="fas fa-eye"></i> Show Notes</a>
                        </div>
                    </section>
                </main>
            </div>
        )
    }
}

export default FindNotes;