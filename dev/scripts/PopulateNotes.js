import React from 'react';

const PopulateNotes = (props) => {
    return (
        <div className="notes-grid">
            <div>
                <span className="note-type">{props.noteLong}: </span>
            </div>
            <div>
                {props.note}
            </div>
            <div>
                {props.noteLong !== 'Alert' ? <a href="#" onClick={() => props.openNoteEditor(props.itemID)}><i className="fas fa-edit"></i></a> : null} {props.noteLong !== 'Alert' ? <a href="#" onClick={() => props.removeNote(props.itemID)} ><i className="fas fa-trash"></i></a> : null}
            </div>
        </div>
    )
}

export default PopulateNotes;