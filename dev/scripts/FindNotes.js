import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';

class FindNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            loggedIn: true
        };
        this.doLogout = this.doLogout.bind(this);
    }

    doLogout(e) {
        firebase.auth().signOut().then((res) => {
            this.setState({
                loggedIn: false
            });
        });
    }
    
    render() {
        return(
            <div className="notes-header">
                <div className="container">
                    <div className="notes-header__heading">
                        <h1>NoteZ</h1>
                    </div>
                    <div className="notes-header__user">
                        <p>Welcome, username!</p>
                        <div className="notes-header__user__button">
                            <button onClick={this.doLogout}>Sign-out</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default FindNotes;