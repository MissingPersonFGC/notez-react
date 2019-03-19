import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames';
import PopulateCharacters from './PopulateCharacters';
import PopulateNotes from './PopulateNotes';
import PopulateFilters from './PopulateFilters';
import Modal from 'react-bootstrap/Modal';

class GameNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            loggedIn: false,
            userName: '',
            userId: '',
            gameData: [],
            characterData: [],
            gameNotes: [],
            punishData: [],
            selectedGame: '',
            yourCharacter: '',
            oppCharacter: '',
            chosenFilter: '',
            quickAddFilter: '',
            quickAddNote: '',
            showEdit: false,
            editKey: '',
            editFilter: '',
            editNote: ''
        };
        this.doLogout = this.doLogout.bind(this);
        this.pullCharacters = this.pullCharacters.bind(this);
        this.setYourChar = this.setYourChar.bind(this);
        this.setOppChar = this.setOppChar.bind(this);
        this.getGameNotes = this.getGameNotes.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
        this.switchBetweenNotes = this.switchBetweenNotes.bind(this);
        this.removeNote = this.removeNote.bind(this);
        this.openNoteEditor = this.openNoteEditor.bind(this);
        this.changeQuickAddNote = this.changeQuickAddNote.bind(this);
        this.changeQuickAddFilter = this.changeQuickAddFilter.bind(this);
        this.quickAddNote = this.quickAddNote.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.changeEditFilter = this.changeEditFilter.bind(this);
        this.changeEditNote = this.changeEditNote.bind(this);
        this.postEdit = this.postEdit.bind(this);
    }

    componentDidMount() {

        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {

            this.setState({
                userId: user.uid,
                loggedIn: true
            });

            this.dbRefUser = firebase.database().ref(`users/${user.uid}`);

            this.dbRefUser.once("value", snapshot => {
                const value = snapshot.val();
                for (let user in value) {
                    const getUserName = value[user];
                    this.setState({
                        userName: getUserName
                    });
    
                    this.dbRefAvailableGames = firebase.database().ref(`userData/${getUserName}/gameNotes/`);
    
                    this.dbRefAvailableGames.once("value", snapshot => {
                        const availableGamesInNotes = [];
                        const availableGames = [];
                        const games = snapshot.val();
    
                        for (let value in games) {
                            availableGamesInNotes.push(value);
                        }
    
                        availableGamesInNotes.forEach((game1) => {
                            allGames.forEach((game2) => {
                                if (game1 === game2.gameShorthand) {
                                    availableGames.push(game2);
                                }
                            })
                        })
    
                        this.setState({
                            gameData: availableGames
                        });
                    });
                }
            });
        });
    
        const allGames = [];
    
        this.dbRefGames = firebase.database().ref(`gameData/`);
    
        this.dbRefGames.on("value", snapshot => {
            const games = snapshot.val();
    
            for (let value in games) {
                allGames.push(games[value]);
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    quickAddNote(e) {
        e.preventDefault();
        const game = this.state.selectedGame;
        const you = this.state.yourCharacter;
        const opponent = this.state.oppCharacter;
        const filterShort = this.state.quickAddFilter;
        const newNote = this.state.quickAddNote;
        const user = this.state.userName;
        let filterLong = '';
        this.state.punishData.forEach((filter) => {
            if (filter.noteShorthand === filterShort) {
                filterLong = filter.noteType;
            }
        });
        const noteFormatted = {
            "note": newNote,
            "noteType": filterShort,
            "noteLongform": filterLong
        }
        this.dbRefNotesLocation = firebase.database().ref(`userData/${user}/gameNotes/${game}/${you}/${opponent}/`);
        this.dbRefNotesLocation.push(noteFormatted);
        this.setState({
            quickAddNote: ''
        });
    }

    changeQuickAddFilter(e) {
        const quickAddFilter = e.target.value;
        this.setState({
            quickAddFilter: quickAddFilter
        });
    }

    changeQuickAddNote(e) {
        const newNote = e.target.value;
        this.setState({
            quickAddNote: newNote
        });
    }

    doLogout(e) {
        e.preventDefault();
        firebase.auth().signOut().then(() => {

        });

        this.setState({
            loggedIn: false,
            userName: "",
            userId: "",
            gameData: [],
            characterData: [],
            gameNotes: [],
            punishData: [],
            selectedGame: "",
            yourCharacter: "",
            oppCharacter: "",
            chosenFilter: ""
        });
    }

    switchBetweenNotes(e) {

    }

    pullCharacters(e) {
        const filterData = []
        const selectedGame = e.target.value;
        this.dbRefCharacters = firebase.database().ref(`characterData/${selectedGame}/`);
        this.dbRefCharacters.on("value", snapshot => {
            this.setState({
                selectedGame: selectedGame,
                characterData: snapshot.val()
            });
        });
        this.dbRefFilterGameSpecific = firebase.database().ref(`punishData/${selectedGame}`);
        this.dbRefFilterGlobal = firebase.database().ref(`punishData/global/`);
        this.dbRefFilterGlobal.on("value", snapshot => {
            snapshot.val().forEach((filter) => {
                filterData.push(filter);
            });
            this.dbRefFilterGameSpecific.on("value", snapshot2 => {
                snapshot2.val().forEach((filter) => {
                    filterData.push(filter);
                })
                this.setState({
                    punishData: filterData
                })
            });
        });
    }

    cancelEdit() {
        this.setState({
            editFilter: '',
            editKey: '',
            editNote: '',
            showEdit: false
        });
    }

    setYourChar(e) {
        const yourChar = e.target.value;
        const oppChar = this.state.oppCharacter;
        if (yourChar !== '' && oppChar !== '') {
            const you = this.state.userName;
            const yourGame = this.state.selectedGame;
            this.dbRefGameNotes = firebase.database().ref(`userData/${you}/gameNotes/${yourGame}/${yourChar}/${oppChar}/`);
            this.dbRefGameNotes.on("value", snapshot => {
                const unparsedNotes = snapshot.val();
                const parsedNotes = [];

                if (snapshot.val()) {
                    for (let item in unparsedNotes) {
                        unparsedNotes[item].key = item;
                        parsedNotes.push(unparsedNotes[item]);
                    }
                    this.setState({
                        gameNotes: parsedNotes,
                        yourCharacter: yourChar
                    });
                } else {
                    parsedNotes.push({
                        noteLongform: 'Alert',
                        note: 'You have no notes for this match.'
                    });
                    this.setState({
                        gameNotes: parsedNotes,
                        yourCharacter: yourChar
                    });
                }
            });
        } else {
            this.setState({
                yourCharacter: yourChar
            });
        }
    }

    setOppChar(e) {
        const oppChar = e.target.value;
        const yourChar = this.state.yourCharacter;
        if (oppChar !== '' && yourChar !== '') {
            const you = this.state.userName;
            const yourGame = this.state.selectedGame;
            this.dbRefGameNotes = firebase.database().ref(`userData/${you}/gameNotes/${yourGame}/${yourChar}/${oppChar}/`);
            this.dbRefGameNotes.on("value", snapshot => {
                const unparsedNotes = snapshot.val();
                const parsedNotes = [];

                if (snapshot.val()) {
                    for (let item in unparsedNotes) {
                        unparsedNotes[item].key = item;
                        parsedNotes.push(unparsedNotes[item]);
                    }
                    this.setState({
                        gameNotes: parsedNotes,
                        oppCharacter: oppChar
                    });
                } else {
                    parsedNotes.push({
                        noteLongform: 'Alert',
                        note: 'You have no notes for this match.'
                    });
                    this.setState({
                        gameNotes: parsedNotes,
                        oppCharacter: oppChar
                    });
                }
            });
        } else {
            this.setState({
                oppCharacter: oppChar
            });
        }
    }

    getGameNotes(e) {
        e.preventDefault();
        const yourGame = this.state.selectedGame;
        const yourChar = this.state.yourCharacter;
        const oppChar = this.state.oppCharacter;
        const you = this.state.userName;

        console.log(yourChar, oppChar, yourGame, you);

        this.dbRefGameNotes = firebase.database().ref(`userData/${you}/gameNotes/${yourGame}/${yourChar}/${oppChar}/`);
        this.dbRefGameNotes.on("value", snapshot => {
            const unparsedNotes = snapshot.val();
            const parsedNotes = [];

            if (snapshot.val()) {
                for (let item in unparsedNotes) {
                    unparsedNotes[item].key = item;
                    parsedNotes.push(unparsedNotes[item]);
                }
                this.setState({
                    gameNotes: parsedNotes,
                    chosenFilter: ''
                });
            } else {
                parsedNotes.push({
                    noteLongform: 'Alert',
                    note: 'You have no notes for this match.'
                });
                this.setState({
                    gameNotes: parsedNotes,
                    chosenFilter: ''
                });
            }
        });
    }

    removeNote(itemToRemove) {
        const yourGame = this.state.selectedGame;
        const yourChar = this.state.yourCharacter;
        const oppChar = this.state.oppCharacter;
        const you = this.state.userName;
        this.dbRefGameNotes = firebase.database().ref(`userData/${you}/gameNotes/${yourGame}/${yourChar}/${oppChar}/`);
        this.dbRefGameNotes.child(itemToRemove).once('value', (snapshot) => {
            this.dbRefGameNotes.child(itemToRemove).remove();
        })
    }

    changeFilter(e) {
        const selectedFilter = e.target.value;
        const wholeNotes = this.state.gameNotes;
        const reducedNotes = [];
        wholeNotes.forEach((note) => {
            if (note.noteType === selectedFilter) {
                reducedNotes.push(note);
            }
        });
        this.setState({
            gameNotes: reducedNotes,
            chosenFilter: selectedFilter
        });
    }

    openNoteEditor(key) {
        const editKey = key;
        const user = this.state.userName;
        const you = this.state.yourCharacter;
        const game = this.state.selectedGame;
        const opponent = this.state.oppCharacter;
        let noteEdited = '';
        this.dbRefEditNote = firebase.database().ref(`userData/${user}/gameNotes/${game}/${you}/${opponent}/${editKey}`);
        this.dbRefEditNote.on('value', (snapshot) => {
            noteEdited = snapshot.val();
            this.setState({
                editKey: editKey,
                editFilter: noteEdited.noteType,
                editNote: noteEdited.note,
                showEdit: true
            });
        });
    }

    changeEditFilter(e) {
        const newFilter = e.target.value;
        this.setState({
            editFilter: newFilter
        });
    }

    changeEditNote(e) {
        const newNote = e.target.value;
        this.setState({
            editNote: newNote
        });
    }

    postEdit(e) {
        e.preventDefault();
        const editKey = this.state.editKey;
        const user = this.state.userName;
        const you = this.state.yourCharacter;
        const game = this.state.selectedGame;
        const opponent = this.state.oppCharacter;
        const filterShort = this.state.editFilter;
        const newNote = this.state.editNote;
        let filterLong = '';
        this.state.punishData.forEach((filter) => {
            if (filter.noteShorthand === filterShort) {
                filterLong = filter.noteType;
            }
        });
        const noteFormatted = {
            "note": newNote,
            "noteType": filterShort,
            "noteLongform": filterLong
        }
        this.dbRefEditNote = firebase.database().ref(`userData/${user}/gameNotes/${game}/${you}/${opponent}/${editKey}`);
        this.dbRefEditNote.set(noteFormatted);
        this.setState({
            editFilter: '',
            editKey: '',
            editNote: '',
            showEdit: false
        });
    }
    
    render() {
        return(
            <main>
                {
                    this.state.gameData.length !== 0 ?
                        <div className="grid-container">
                            <div className="menu">
                                <section className="selection-head">
                                    <h2>Select your game:</h2>
                                </section>
                                <section className="game-select">
                                    <select name="your-game" id="your-game" className="your-game" defaultValue="" onChange={this.pullCharacters}>
                                        <option key="empty" value="" disabled>------</option>
                                        {this.state.gameData.map((game, index) => {
                                            return <PopulateGames gameName={game.gameName} gameShorthand={game.gameShorthand} gameKey={index} key={index} />
                                        })}
                                    </select>
                                </section>
                                <section className="selection-head">
                                    <h2>Select your character:</h2>
                                </section>
                                <section className="game-select">
                                    <select name="your-character" defaultValue="" onChange={this.setYourChar}>
                                        <option value="" disabled>------</option>
                                        {this.state.characterData.map((character, index) => {
                                            return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index} />
                                        })}
                                    </select>
                                </section>
                                <section className="selection-head">
                                    <h2>Select your opponent:</h2>
                                </section>
                                <section className="game-select">
                                    <select name="opp-character" defaultValue="" onChange={this.setOppChar}>
                                        <option value="" disabled>------</option>
                                        {this.state.characterData.map((character, index) => {
                                            return <PopulateCharacters characterName={character.characterName} characterShorthand={character.characterShorthand} key={index}/>
                                        })}
                                    </select>
                                </section>
                                <section className="selection-head">
                                    <h2>Filter notes by:</h2>
                                </section>
                                <section className="game-select">
                                    <select className="note-filter" name="note-filter" onChange={this.changeFilter} value={this.state.chosenFilter} defaultValue=''>
                                        <option value="" disabled>------</option>
                                        {this.state.punishData.map((filter, index) => {
                                            return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                                        })}
                                    </select>
                                    {this.state.gameNotes.length > 0 ? 
                                        <a href="" className="button show-all desktop" onClick={this.getGameNotes}><i className="fas fa-sync-alt"></i> Show All</a>
                                    :
                                        null
                                    }
                                </section>
                                <section className="notes-add">
                                    <Link to="/add" className="add-notes-button-launch"><i className="fas fa-plus"></i> Add Notes to New Game</Link>
                                </section>
                            </div>
                            <div className="notes">
                                <section className="char-notes">
                                    <ul>
                                        {this.state.gameNotes !== null ? 
                                            this.state.gameNotes.map((note, index) => {
                                                return <PopulateNotes yourCharacter={this.state.yourCharacter} oppCharacter={this.state.oppCharacter} noteShorthand={note.noteType} noteLong={note.noteLongform} note={note.note} key={this.state.gameNotes[index].key} removeNote={this.removeNote} openNoteEditor={this.openNoteEditor} itemID={this.state.gameNotes[index].key} />
                                            })
                                        : null}
                                        {this.state.gameNotes.length !== 0 ? 
                                            <li className="note-qa-li">
                                                <div>
                                                    <span className="note-type quick-add">Quick Add:</span>
                                                    <select name="note-filter" className="note-filter qa-note-filter" onChange={this.changeQuickAddFilter}>
                                                        <option value="">--Add Filter--</option>
                                                        {this.state.punishData.map((filter, index) => {
                                                            return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                                                        })}
                                                    </select>
                                                </div>
                                                <div>
                                                    <textarea name="quick-add-note-text" onChange={this.changeQuickAddNote} placeholder="Write your note for this matchup here." value={this.state.quickAddNote} cols="2"></textarea>
                                                    <a href="#" onClick={this.quickAddNote} className="button"><i className="fas fa-pencil-alt"></i></a>
                                                </div>
                                            </li> 
                                            : 
                                            null
                                        }
                                    </ul>
                                </section>
                            </div>
                        </div>
                    :
                    <div>
                        <section className="no-notes">
                            <h2>It appears that you currently have no notes. Click "Add Notes" below to get started!</h2>
                        </section>
                        <section className="notes-add">
                        <Link to="/add" className="add-notes-button-launch"><i className="fas fa-plus"></i> Add Notes to New Game</Link>
                        </section>
                    </div>
                }
                <Modal show={this.state.showEdit} onHide={this.cancelEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit existing note</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            <span className="note-type">Change Filter:</span> <select name="change-filter" onChange={this.changeEditFilter} value={this.state.editFilter}>
                                {this.state.punishData.map((filter, index) => {
                                    return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                                })}
                            </select> 
                        </p>
                        <p><span className="note-type">Change Note:</span></p>
                        <textarea rows="2" cols="40" onChange={this.changeEditNote} value={this.state.editNote}></textarea>
                        <a className="button-edit-submit" href="#" onClick={this.postEdit}>Edit Note</a>
                        <a href="#" onClick={this.cancelEdit}>Cancel</a>
                    </Modal.Body>
                </Modal>
            </main>
        )
    }
}

export default GameNotes;