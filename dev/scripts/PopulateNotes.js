import React from 'react';

const PopulateNotes = (props) => {
    return (
        <li><span className="note-type">{props.noteLong}:</span> {props.note} <a href="#" onClick={() => props.openNoteEditor(props.itemID)}><i className="fas fa-edit"></i></a> <a href="#" onClick={() => props.removeNote(props.itemID)} ><i className="fas fa-trash"></i></a></li>
    )
}

export default PopulateNotes;