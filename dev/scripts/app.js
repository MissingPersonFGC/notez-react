import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import Footer from './Footer';
import Register from './Register';
import Login from './Login';
import FindNotes from './FindNotes';
import AddNotes from './AddNotes';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyD7ZNBrn7hRM2lifehzWb2TcbwW8W8BzDs",
  authDomain: "notez-beta.coreylanier.com",
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
      loginPwd: '',
      loggedIn: false
    };
  }

  componentDidMount() {
    // Checks to see if the user has already logged in
    firebase
      .auth()
      .onAuthStateChanged(user => {
        if (user) {
          this.setState({
            loggedIn: true
          });
        } else {
          this.setState({
            loggedIn: false
          });
        }
      });
  }

  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={FindNotes} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/add" component={AddNotes} />
          <Footer />
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
