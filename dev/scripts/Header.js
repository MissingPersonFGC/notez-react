import React from 'react';
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink
} from "react-router-dom";
import firebase from "firebase";

class Header extends React.Component {
    render() {
        return(
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
        )
    }
}

export default Header;