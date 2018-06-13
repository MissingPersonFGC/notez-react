import React from 'react';

const PopulateCharacters = (props) => {
    return (
        <option value={props.characterShorthand}>{props.characterName}</option>
    )
}

export default PopulateCharacters;