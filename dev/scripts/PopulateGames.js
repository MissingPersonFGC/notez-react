import React from 'react';

const PopulateGames = (props) => {
    return (
        <option value={props.gameShorthand}>{props.gameName}</option>
    )
}

export default PopulateGames;