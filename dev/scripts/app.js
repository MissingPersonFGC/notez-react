import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import Header from './Header';
import Footer from './Footer';
import Register from './Register';
import Login from './Login';
import FindNotes from './FindNotes';

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

    this.state = {
      user: null,
      userName: '',
      registerUserName: '',
      registerPwd: '',
      registerPwdVerify: '',
      registerEmail: '',
      loginEmail: '',
      loginPwd: ''
    };
  }
  render() {
    return (
      <Router>
        <div>
          {this.state.user === null ? <Route exact path="/" component={Header} /> : <Route exact path ="/" component="FindNotes" />}
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Footer />
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
