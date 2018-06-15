import React from 'react';

const PopulateNotes = (props) => {
    return (
        <li><span className="note-type">{props.noteLong}:</span> {props.note}</li>
    )
}

export default PopulateNotes;