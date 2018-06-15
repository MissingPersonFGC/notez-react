import React from 'react';

const PopulateFilters = (props) => {
    return (
        <option value={props.noteShorthand}>{props.noteType}</option>
    )
}

export default PopulateFilters;