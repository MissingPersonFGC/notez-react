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
            <div>
                <div className="user-header">
                    <h1>NoteZ <span className="smaller-heading"> - Login</span></h1>
                </div>
                <div className="user-form">
                    <form className="login-form">
                        <input type="email" name="email" required placeholder="Email Address" />
                        <input type="password" name="password" required placeholder="Password" />
                        <input type="submit" name="login" value="Sign-in" />
                        <Link to="/register">Sign-up</Link>
                        <Link to="/">Home</Link>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;