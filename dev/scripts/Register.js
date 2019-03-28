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
    constructor() {
        super();

        this.state = {
            registerUserName: '',
            registerPwd: '',
            registerPwdVerify: '',
            registerEmail: '',
            characterNotes: [],
            playerNotes: [],
            invalidUserName: false
        }

        this.doRegister = this.doRegister.bind(this);
        this.writeUsername = this.writeUsername.bind(this);
        this.changeStateValue = this.changeStateValue.bind(this);
    }

    doRegister(e) {
        e.preventDefault();
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        if (this.state.registerUserName !== '' && this.state.invalidUserName !== true) {
            const userName = this.state.registerUserName;

            const verifyEmail = re.test(String(this.state.registerEmail.toLowerCase()));

            if (this.state.registerEmail !== '' && verifyEmail === true) {
                const email = this.state.registerEmail;

                if (this.state.registerPwd === '') {
                    alert(`Please enter a password!`);
                } else if (this.state.registerPwd === this.state.registerPwdVerify) {
                    const pwd = this.state.registerPwd;

                    firebase.auth().createUserWithEmailAndPassword(email, pwd)
                        .then((res) => {
                            const user = {
                                uid: res.user.uid,
                                email: email
                            }

                            this.setState({
                                user
                            });
                            const dbRef = firebase.database().ref(`${this.state.registerUserName}`).push(user);
                        })
                        .catch((error) => console.log(error.code, error.message));

                        let dbRefUserId = '';

                        firebase.auth().set;

                        firebase.auth().onAuthStateChanged(user => {
                            dbRefUserId = user.uid;
                            
                            const dbRefUser = firebase.database().ref(`users/${dbRefUserId}`);

                            dbRefUser.set({userName: userName});

                            window.location.assign('/');
                        });

                        this.setState({
                            registerEmail: '',
                            registerUserName: '',
                            registerPwd: '',
                            registerPwdVerify: ''
                        })
                } else {
                    alert(`Your passwords do not match!`);
                }
            } else {
                alert(`Please enter a valid email address!`);
            }
        } else {
            alert(`Please enter a valid username!`);
        }
    }

    writeUsername(e) {
        const currentName = e.target.value;
        const dbRefUsers = firebase.database().ref(`users/`);
        let userNameInUse = false
        dbRefUsers.on('value', (snapshot) => {
            const users = snapshot.val();
            for (let user in users) {
                if (users[user].userName === currentName) {
                    userNameInUse = true;
                }
            }
            this.setState({
                registerUserName: currentName,
                invalidUserName: userNameInUse
            });
        });
    }

    changeStateValue(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    render() {
        return(
            <div>
                <div className="user-header">
                    <h1>NoteZ <span className="smaller-heading"> - User Registration</span></h1>
                </div>
                <div className="user-form">
                    <form className="user-register">
                        <div>
                            <input type="text" name="username" placeholder="Username" value={this.state.registerUserName} onChange={this.writeUsername} />
                            {this.state.invalidUserName ?
                                <p className="alert">This username is already taken.</p>
                            :
                                null
                            }
                        </div>                        
                        <div>
                            <input type="email" name="registerEmail" placeholder="Email Address" onChange={this.changeStateValue} value={this.state.registerEmail} />
                        </div>
                        <div>
                            <input type="password" name="registerPwd" placeholder="Password" onChange={this.changeStateValue} value={this.state.registerPwd} />
                        </div>
                        <div>
                            <input type="password" name="registerPwdVerify" placeholder="Verify Password" onChange={this.changeStateValue} value={this.state.registerPwdVerify} />
                        </div>
                        <div>
                            <input type="submit" value="Sign-up" onClick={this.doRegister} />
                        </div>
                        <div>
                            <Link to="/login">Sign-in</Link>
                            <Link to="/">Home</Link>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Register;
