import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";
import firebase from 'firebase';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
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
        this.changeStateValue = this.changeStateValue.bind(this);
        this.quickAddNote = this.quickAddNote.bind(this);
        this.openNoteEditor = this.openNoteEditor.bind(this);
        this.postEdit = this.postEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.resetNotes = this.resetNotes.bind(this);
        this.deletionAlert = this.deletionAlert.bind(this);
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

    

    deletionAlert(item) {
        const MySwal = withReactContent(Swal)
        const itemKey = item;
        MySwal.fire({
            title: 'Are you sure you want to delete this note?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            preConfirm: (removeNote) => {
                this.removeNote(itemKey);
            },
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
            MySwal.fire({
                title: 'Deleted!',
                text: 'Your note has been deleted.',
                type: 'success',
            })
            } else if (
            // Read more about handling dismissals
            result.dismiss === Swal.DismissReason.cancel
            ) {
            MySwal.fire(
                'Cancelled',
                'Your note is still here.',
                'error'
            )
            }
        })
    }

    pullGames(e) {
        const chosenPlayer = e.target.value;
        const user = this.state.userName;
        this.dbRefGamesInNotes = firebase.database().ref(`userData/${user}/playerNotes/${chosenPlayer}/`);
        this.dbRefGamesInNotes.once('value', (snapshot) => {
            const gamesInPlayerNotes = [];
            const arr = snapshot.val();
            for (let game in arr) {
                gamesInPlayerNotes.push(game);
            }
            this.dbRefGamesList = firebase.database().ref(`gameData/`);
            this.dbRefGamesList.once('value', (snapshot) => {
                const availableGames = [];
                const games = snapshot.val();
                gamesInPlayerNotes.forEach((game) => {
                    for (let object in games) {
                        if (games[object].gameShorthand === game) {
                            availableGames.push(games[object]);
                        }
                    }
                });
                if (this.state.selectedGame !== '') {
                    this.setState({
                        gameData: availableGames,
                        opponent: chosenPlayer,
                        selectedGame: '',
                        playerNotes: []
                    });
                } else {
                    this.setState({
                        gameData: availableGames,
                        opponent: chosenPlayer
                    });
                }
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
        const wholeNotes = this.state.playerNotes;
        const reducedNotes = [];
        wholeNotes.forEach((note) => {
            if (note.noteType === filter) {
                reducedNotes.push(note);
            }
        })
        this.setState({
            chosenFilter: filter,
            playerNotes: reducedNotes
        });
    }

    changeStateValue(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
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
                    <div className="grid-container">
                        <div className="menu">                        
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
                                <select defaultValue="" onChange={this.pullNotes} value={this.state.selectedGame}>
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
                                {this.state.playerNotes.length > 0 ?
                                    <a href="" className="button show-all desktop" onClick={this.resetNotes}><i className="fas fa-sync-alt"></i> Show All</a>
                                :
                                    null
                                }
                            </section>
                            <section className="game-select">
                                <Link to="/add-player" className="add-notes-button-launch"><i className="fas fa-plus"></i> Add a New Player/Game</Link>
                            </section>
                        </div>
                        <div className="notes">                        
                            <section className="char-notes">
                                    {this.state.playerNotes !== null ? 
                                        this.state.playerNotes.map((note, index) => {
                                            return <PopulateNotes yourCharacter={this.state.userName} oppCharacter={this.state.opponent} noteShorthand={note.noteType} noteLong={note.noteLongform} note={note.note} key={this.state.playerNotes[index].key} 
                                            removeNote={this.deletionAlert} 
                                            openNoteEditor={this.openNoteEditor} 
                                            itemID={this.state.playerNotes[index].key} />
                                        })
                                    : null}
                                    {this.state.playerNotes.length !== 0 ? 
                                        <ul>
                                            <li className="note-qa-li">
                                                <div>
                                                    <span className="note-type quick-add">Quick Add:</span>
                                                    <select name="quickAddFilter" className="note-filter qa-note-filter" onChange={this.changeStateValue}>
                                                        <option value="">------</option>
                                                        {this.state.filterData.map((filter, index) => {
                                                            return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                                                        })}
                                                    </select>
                                                </div>
                                                <div>
                                                    <textarea name="quickAddNote" onChange={this.changeStateValue} placeholder="Write your note for this matchup here." value={this.state.quickAddNote} cols="2"></textarea>
                                                    <a href="#" onClick={this.quickAddNote} className="button"><i className="fas fa-pencil-alt"></i></a>
                                                </div>
                                            </li> 
                                        </ul> : null
                                    }
                            </section>
                        </div>
                    </div>
                :
                    <div>
                        <section className="no-notes">
                                <h2>It appears that you currently have no notes. Click "Add Notes" below to get started!</h2>
                        </section>
                        <section className="notes-add">
                            <Link to="/add-player" className="add-notes-button-launch"><i className="fas fa-plus"></i> Add Notes to New Player/Game</Link>
                        </section>
                    </div>
                }
                <Modal show={this.state.showEdit} onHide={this.cancelEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit existing note</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            <span className="note-type">Change Filter:</span> <select name="editFilter" onChange={this.changeStateValue} value={this.state.editFilter}>
                                {this.state.filterData.map((filter, index) => {
                                    return <PopulateFilters noteShorthand={filter.noteShorthand} noteType={filter.noteType} key={index}/>
                                })}
                            </select> 
                        </p>
                        <p><span className="note-type">Change Note:</span></p>
                        <textarea name="editNote" rows="2" cols="40" onChange={this.changeStateValue} value={this.state.editNote}></textarea>
                        <a className="button-edit-submit" href="#" onClick={this.postEdit}>Edit Note</a>
                        <a href="#" onClick={this.cancelEdit}>Cancel</a>
                    </Modal.Body>
                </Modal>
            </main>
        )
    }
}

export default PlayerNotes;