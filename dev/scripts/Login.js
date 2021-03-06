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
    constructor() {
        super();
        this.state = {
            loginEmail: '',
            loginPassword: '',
            loggedIn: false
        }
        this.doLogin = this.doLogin.bind(this);
        this.changeStateValue = this.changeStateValue.bind(this);
    }

    changeStateValue(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    doLogin(e) {
        e.preventDefault();
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const emailCheck = re.test(String(this.state.loginEmail.toLowerCase()));
        if (this.state.loginEmail !== '' && emailCheck === true && this.state.loginPassword !== '') {
            const email = this.state.loginEmail;
            const password = this.state.loginPassword;
            firebase.auth().signInWithEmailAndPassword(email, password).then((success) => {
                console.log(`Logged in as ${success.user.email}`);
                this.setState({
                    loginEmail: '',
                    loginPassword: '',
                    loggedIn: true
                });
                window.location.assign("/");
            }), (error) => {
                console.log(error);
            }            
        } else {
            alert(`Please enter valid login credentials.`);
        }
    }

    render() {
        return(
            <div>
                <div className="user-header">
                    <h1>NoteZ <span className="smaller-heading"> - Login</span></h1>
                </div>
                <div className="user-form">
                    <form className="login-form">
                        <div>
                            <input type="email" name="loginEmail" required placeholder="Email Address" onChange={this.changeStateValue}/>
                        </div>
                        <div>
                            <input type="password" name="loginPassword" required placeholder="Password" onChange={this.changeStateValue} />
                        </div>
                        <div>
                            <input type="submit" name="login" value="Sign-in" onClick={this.doLogin} />
                        </div>
                        <div>
                            <Link to="/register">Sign-up</Link>
                            <Link to="/">Home</Link>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;