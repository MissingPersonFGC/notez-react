import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink
} from "react-router-dom";
import firebase from "firebase";

class Login extends React.Component {
    render() {
        return(
            <div className="user-header">
                <h1>NoteZ <span className="smaller-heading"> - Login</span></h1>
            </div>
        )
    }
}

export default Login;