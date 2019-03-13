import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import PopulateGames from './PopulateGames'
import PopulateNotes from './PopulateNotes';
import PopulateFilters from './PopulateFilters';
import Modal from 'react-bootstrap/Modal';
import PopulatePlayers from './PopulatePlayers';

class PlayerNotes extends React.Component {
    constructor() {
        super();
        this.state = {
            userName: '',
            userId: '',
            gameData: [],
            characterData: [],
            playerNotes: [],
            playerData: [],
            filterData: [],
            gameData: [],
            opponent: '',
            selectedGame: '',
            chosenFilter: '',
            quickAddFilter: '',
            quickAddNote: '',
            showEdit: false,
            editFilter: '',
            editKey: '',
            editNote: ''
        }
        this.pullGames = this.pullGames.bind(this);
        this.pullNotes = this.pullNotes.bind(this);
        this.removeNote = this.removeNote.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.changeQuickAddFilter = this.changeQuickAddFilter.bind(this);
        this.changeQuickAddNote = this.changeQuickAddNote.bind(this);
        this.quickAddNote = this.quickAddNote.bind(this);
        this.openNoteEditor = this.openNoteEditor.bind(this);
        this.changeEditFilter = this.changeEditFilter.bind(this);
        this.changeEditNote = this.changeEditNote.bind(this);
        this.postEdit = this.postEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.filterNotes = this.filterNotes.bind(this);
        this.resetNotes = this.resetNotes.bind(this);
    }
    
    componentDidMount() {
        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {

            this.setState({
                userId: user.uid,
                loggedIn: true
            });

            this.dbRefUser = firebase.database().ref(`users/${user.uid}`);

            this.dbRefFilters = firebase.database().ref(`playerFilters/`);
            

            this.dbRefUser.on("value", snapshot => {
                const value = snapshot.val();
                for (let user in value) {
                    const getUserName = value[user];
                    this.setState({
                        userName: getUserName
                    });

                    this.dbRefAvailablePlayers = firebase.database().ref(`userData/${getUserName}/playerNotes/`);

                    this.dbRefAvailablePlayers.on('value', (snapshot) => {
                        const playersDb = snapshot.val();
                        const playerList = []

                        for (let name in playersDb) {
                            playerList.push(name);
                        }

                        this.dbRefFilters.on('value', (snapshot) => {
                            const filters = snapshot.val();
                            this.setState({
                                filterData: filters,
                                playerData: playerList
                            });
                        }); 
                    });
                }
            });
        });
    }

    pullGames(e) {
        const chosenPlayer = e.target.value;
        const user = this.state.userName;
        this.dbRefGamesInNotes = firebase.database().ref(`userData/${user}/playerNotes/${chosenPlayer}/`);
        const gamesInPlayerNotes = [];
        const availableGames = [];
        this.dbRefGamesInNotes.on('value', (snapshot) => {
            const arr = snapshot.val();
            for (let game in arr) {
                gamesInPlayerNotes.push(game);
            }
            this.dbRefGamesList = firebase.database().ref(`gameData/`);
            this.dbRefGamesList.on('value', (snapshot) => {
                const games = snapshot.val();
                gamesInPlayerNotes.forEach((game) => {
                    for (let object in games) {
                        if (games[object].gameShorthand === game) {
                            availableGames.push(games[object]);
                        }
                    }
                });
                this.setState({
                    gameData: availableGames,
                    opponent: chosenPlayer
                });
            });
        });
    }

    pullNotes(e) {
        const game = e.target.value;
        const opponent = this.state.opponent;
        const you = this.state.userName;

        if (game !== '' && opponent !== '') {
            this.dbRefNotes = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/`);
            this.dbRefNotes.on('value', (snapshot) => {
                const unparsedNotes = snapshot.val();
                const parsedNotes = [];
                for (let item in unparsedNotes) {
                    unparsedNotes[item].key = item;
                    parsedNotes.push(unparsedNotes[item]);
                }
                this.setState({
                    selectedGame: game,
                    playerNotes: parsedNotes
                });
            });
        }
    }

    filterNotes(e) {
        e.preventDefault();
        const wholeNotes = this.state.playerNotes;
        const selectedFilter = this.state.chosenFilter;
        const reducedNotes = [];
        wholeNotes.forEach((note) => {
            if (note.noteType === selectedFilter) {
                reducedNotes.push(note);
            }
        });
        this.setState({
            playerNotes: reducedNotes
        });
    }

    removeNote(itemToRemove) {
        const game = this.state.selectedGame;
        const opponent = this.state.opponent;
        const you = this.state.userName;
        this.dbRefGameNotes = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/`);
        this.dbRefGameNotes.child(itemToRemove).once('value', (snapshot) => {
            this.dbRefGameNotes.child(itemToRemove).remove();
        })
    }

    setFilter(e) {
        const filter = e.target.value;
        this.setState({
            chosenFilter: filter
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

    quickAddNote(e) {
        e.preventDefault();
        const game = this.state.selectedGame;
        const you = this.state.userName;
        const opponent = this.state.opponent;
        const filterShort = this.state.quickAddFilter;
        const newNote = this.state.quickAddNote;
        let filterLong = '';
        this.state.filterData.forEach((filter) => {
            if (filter.noteShorthand === filterShort) {
                filterLong = filter.noteType;
            }
        });
        const noteFormatted = {
            "note": newNote,
            "noteType": filterShort,
            "noteLongform": filterLong
        }
        this.dbRefNotesLocation = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/`);
        this.dbRefNotesLocation.push(noteFormatted);
        this.setState({
            quickAddNote: ''
        });
    }

    resetNotes(e) {
        e.preventDefault();
        const you = this.state.userName;
        const opponent = this.state.opponent;
        const game = this.state.selectedGame;
        this.dbRefNotes = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/`);
        this.dbRefNotes.on('value', (snapshot) => {
            const unparsedNotes = snapshot.val();
            const parsedNotes = [];
            for (let item in unparsedNotes) {
                unparsedNotes[item].key = item;
                parsedNotes.push(unparsedNotes[item]);
            }
            this.setState({
                selectedGame: game,
                playerNotes: parsedNotes
            });
        });
    }

    openNoteEditor(key) {
        const editKey = key;
        const you = this.state.userName;
        const game = this.state.selectedGame;
        const opponent = this.state.opponent;
        let noteEdited = '';
        this.dbRefEditNote = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/${editKey}`);
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
        const you = this.state.userName;
        const game = this.state.selectedGame;
        const opponent = this.state.opponent;
        const filterShort = this.state.editFilter;
        const newNote = this.state.editNote;
        let filterLong = '';
        this.state.filterData.forEach((filter) => {
            if (filter.noteShorthand === filterShort) {
                filterLong = filter.noteType;
            }
        });
        const noteFormatted = {
            "note": newNote,
            "noteType": filterShort,
            "noteLongform": filterLong
        }
        this.dbRefEditNote = firebase.database().ref(`userData/${you}/playerNotes/${opponent}/${game}/${editKey}`);
        this.dbRefEditNote.set(noteFormatted);
        this.setState({
            editFilter: '',
            editKey: '',
            editNote: '',
            showEdit: false
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

    render() {
        return(
            <main>
                {this.state.playerData.length > 0 ?
                    <div>
                        <section className="selection-head">
                            <h2>Select your opponent:</h2>
                        </section>
                        <section className="game-select">
                            <select defaultValue="" onChange={this.pullGames}>
                                <option key="empty" value="" disabled>------</option>
                                {this.state.playerData.map((player, index) => {
                                    return <PopulatePlayers playerName={player} key={index} />
                                })}
                            </select>
                        </section>
                        <section className="selection-head">
                            <h2>Select your game:</h2>
                        </section>
                        <section className="game-select">
                            <select defaultValue="" onChange={this.pullNotes}>
                                <option key="empty" value="" disabled>------</option>
                                {this.state.gameData.map((game, index) => {
                                    return <PopulateGames gameName={game.gameName} gameShorthand={game.gameShorthand} gameKey={index} key={index} />
                                })}
                            </select>
                        </section>
                        <section className="selection-head">
                            <h2>Filter notes by:</h2>
                        </section>
                        <section className="game-select">
                            <select defaultValue="" onChange={this.setFilter}>
                                <option key="empty" value="" disabled>------</option>
                                {this.state.filterData.map((filter, index) => {
                                    return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                                })}
                            </select>
                            <a href="" className="button filter desktop" onClick={this.filterNotes}><i className="fas fa-filter"></i> Filter</a> <a href="" className="button show-all desktop" onClick={this.resetNotes}><i className="fas fa-sync-alt"></i> Show All</a>
                        </section>
                        <section className="char-notes">
                            <ul>
                                {this.state.playerNotes !== null ? 
                                    this.state.playerNotes.map((note, index) => {
                                        return <PopulateNotes yourCharacter={this.state.userName} oppCharacter={this.state.opponent} noteShorthand={note.noteType} noteLong={note.noteLongform} note={note.note} key={this.state.playerNotes[index].key} 
                                        removeNote={this.removeNote} 
                                        openNoteEditor={this.openNoteEditor} 
                                        itemID={this.state.playerNotes[index].key} />
                                    })
                                : null}
                                {this.state.playerNotes.length !== 0 ? 
                                    <li className="note-qa-li">
                                        <span className="note-type quick-add">Quick Add:</span>
                                        <select name="note-filter" className="note-filter qa-note-filter" onChange={this.changeQuickAddFilter}>
                                            <option value="">------</option>
                                            {this.state.filterData.map((filter, index) => {
                                                return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                                            })}
                                        </select>
                                        <input type="text" name="quick-add-note-text" onChange={this.changeQuickAddNote} placeholder="Write your note for this player here." value={this.state.quickAddNote}></input>
                                        <a href="#" onClick={this.quickAddNote} className="button">Add Note</a>
                                    </li> : null
                                }
                            </ul>
                        </section>
                        <section className="notes-add">
                            <Link to="/add-player" className="add-notes-button-launch"><i className="fas fa-plus"></i> Add Notes to New Player/Game</Link>
                        </section>
                        <Modal show={this.state.showEdit} onHide={this.cancelEdit}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit existing note</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>
                                    <span className="note-type">Change Filter:</span> <select name="change-filter" onChange={this.changeEditFilter} value={this.state.editFilter}>
                                        {this.state.filterData.map((filter, index) => {
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
                    </div>
                :
                    <section className="no-notes">
                            <h2>It appears that you currently have no notes. Click "Add Notes" below to get started!</h2>
                    </section>
                }
                <section className="notes-add">
                    <Link to="/add-player" className="add-notes-button-launch"><i className="fas fa-plus"></i> Add Notes to New Player/Game</Link>
                </section>
            </main>
        )
    }
}

export default PlayerNotes;