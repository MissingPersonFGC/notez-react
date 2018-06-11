import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyD7ZNBrn7hRM2lifehzWb2TcbwW8W8BzDs",
  authDomain: "notez-app.firebaseapp.com",
  databaseURL: "https://notez-app.firebaseio.com",
  projectId: "notez-app",
  storageBucket: "notez-app.appspot.com",
  messagingSenderId: "22579431071"
};
firebase.initializeApp(config);


class App extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <header class="main-page-head head">
          <h3 data-i18n="title">NoteZ</h3>
          <div class="mobile-menu">
            <a href="" class="icon"><i class="fas fa-bars"></i></a>
          </div>

          {/* Login Prompt */}
          <div className="login">
            <div className="exit-button">
              <a href="" class="icon"><i className="far fa-window-close"></i></a>
            </div>
            <div className="username">
              <input type="text" name="user" id="user" placeholder="username" />
            </div>
            <div className="password">
              <input type="password" name="pass" id="pass" placeholder="password" type="text" />
            </div>
            <div class="login-button">
              <a href="#" className="button"><i className="fas fa-sign-in-alt"></i> Login</a>
            </div>
            <div class="register-button">
              <a href="#" className="button"><i className="fas fa-user-plus"></i> Sign-up</a>
            </div>
          </div>

          {/* Heading */}
          <div class="wrapper">
            <h1>NoteZ</h1>
          </div>
        </header>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
