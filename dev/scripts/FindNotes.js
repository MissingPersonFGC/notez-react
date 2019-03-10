import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import GameNotes from './GameNotes';
import PlayerNotes from './PlayerNotes';

class FindNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            loggedIn: false,
            userName: '',
            userId: '',
            notesType: 'game',
        };
        this.doLogout = this.doLogout.bind(this);
        this.switchBetweenNotes = this.switchBetweenNotes.bind(this);
    }

    componentDidMount() {

        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {

            this.setState({
                userId: user.uid,
                loggedIn: true
            });

            this.dbRefUser = firebase.database().ref(`users/${user.uid}`);

            this.dbRefUser.on("value", snapshot => {
                const value = snapshot.val();
                for (let user in value) {
                    const getUserName = value[user];
                    this.setState({
                        userName: getUserName
                    });
                }
            });
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    doLogout(e) {
        e.preventDefault();
        firebase.auth().signOut().then(() => {

        });

        this.setState({
            loggedIn: false,
            userName: "",
            userId: "",
            gameData: [],
            characterData: [],
            gameNotes: [],
            punishData: [],
            selectedGame: "",
            yourCharacter: "",
            oppCharacter: "",
            chosenFilter: ""
        });
    }

    switchBetweenNotes(e) {
        const checked = this.refs.notesCheck.checked;
        if (checked === true) {
            this.setState({
                notesType: 'player'
            });
        }

        if (checked === false) {
            this.setState({
                notesType: 'game'
            })
        }
    }
    
    render() {
        return(
            <div>
                {
                    this.state.loggedIn === true ?                   
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
                            <label className="switch">
                                <input type="checkbox" name="note-type-toggle" onChange={this.switchBetweenNotes}  ref="notesCheck" />
                                Game Notes <span className="slider"></span> Player Notes
                            </label>
                            {this.state.notesType === 'game' ? 
                                <Route exact path="/" component={GameNotes} /> : <Route exact path="/" component={PlayerNotes} />
                            }
                        </div>
                    :
                        <header className="main-page-head head">
                            <div className="header-container">
                                <div className="wrapper">
                                    <div className="main-title">
                                        <h1>NoteZ</h1>
                                    </div>
                                    <div className="main-description">
                                        <h2>
                                            Join the world's greatest situational note-app,
                                            specifically tailored for competitive gaming! Take
                                            your notes anywhere and add them anytime! Start
                                            leveling up your game today!
                                        </h2>
                                    </div>
                                </div>
                                <div className="login-container">
                                    <div className="login-button">
                                        <Link to="/login">
                                            <i className="fas fa-sign-in-alt" /> Sign-in
                                        </Link>
                                    </div>
                                    <div className="register-button">
                                        <Link to="/register">
                                            <i className="fas fa-user-plus"></i> Sign-up
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </header>
                }
            </div>
        )
    }
}

export default FindNotes;