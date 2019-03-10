import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import GameNotes from './GameNotes';

class FindNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            loggedIn: false,
            notesType: 'game',
        };
        this.doLogout = this.doLogout.bind(this);
    }

    componentDidMount() {

        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {

            this.setState({
                loggedIn: true
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

    }
    
    render() {
        return(
            <div>
                {
                    this.state.loggedIn === true ?                   
                        <div>
                            {this.state.notesType === 'game' ? 
                                <Route exact path="/" component={GameNotes} /> : null
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