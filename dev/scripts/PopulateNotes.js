import React from 'react';

const PopulateNotes = (props) => {
    return (
        <li className={props.noteClass, props.noteType}><span className="note-type">{props.noteLongform}:</span> {props.note}</li>
    )
}

export default PopulateNotes;