import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink
} from "react-router-dom";
import firebase from "firebase";

class Register extends React.Component {
    render() {
        return(
            <div>
                <div className="user-header">
                    <h1>NoteZ <span className="smaller-heading"> - User Registration</span></h1>
                </div>
                <div className="user-form">
                    <form className="user-register">
                        <input type="text" name="username" placeholder="Username"/>
                        <input type="email" name="email" placeholder="Email Address"/>
                        <input type="password" name="password" placeholder="Password"/>
                        <input type="password" name="password-verify" placeholder="Verify Password"/>
                        <input type="submit" value="Sign-up"/>
                        <Link to="/login">Sign-in</Link>
                        <Link to="/">Home</Link>
                    </form>
                </div>
            </div>
        )
    }
}

export default Register;
