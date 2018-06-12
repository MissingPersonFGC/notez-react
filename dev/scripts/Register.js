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
        }

        this.doRegister = this.doRegister.bind(this);
        this.writeUsername = this.writeUsername.bind(this);
        this.writeEmail = this.writeEmail.bind(this);
        this.writePwd = this.writePwd.bind(this);
        this.writePwdVerify = this.writePwdVerify.bind(this);
    }

    doRegister(e) {
        e.preventDefault();
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        if (this.state.registerUserName !== '') {
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
                            const dbRef = firebase.database().ref(`users/${this.state.registerUserName}`).push(user);;
                        })
                        .catch((error) => console.log(error.code, error.message));

                        firebase.auth().set;

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
        this.setState({
            registerUserName: e.target.value
        });
    }

    writeEmail(e) {
        this.setState({
            registerEmail: e.target.value
        });
    }

    writePwd(e) {
        this.setState({
            registerPwd: e.target.value
        });
    }

    writePwdVerify(e) {
        this.setState({
            registerPwdVerify: e.target.value
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
                        <input type="text" name="username" placeholder="Username" value={this.state.registerUserName} onChange={this.writeUsername} />
                        <input type="email" name="email" placeholder="Email Address" onChange={this.writeEmail} value={this.state.registerEmail} />
                        <input type="password" name="password" placeholder="Password" onChange={this.writePwd} value={this.state.registerPwd} />
                        <input type="password" name="password-verify" placeholder="Verify Password" onChange={this.writePwdVerify} value={this.state.registerPwdVerify} />
                        <input type="submit" value="Sign-up" onClick={this.doRegister} />
                        <Link to="/login">Sign-in</Link>
                        <Link to="/">Home</Link>
                    </form>
                </div>
            </div>
        )
    }
}

export default Register;
