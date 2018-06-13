import React from 'react';

const PopulateGames = (props) => {
    return (
        <option key={props.gameShorthand} value={props.gameShorthand}>{props.gameName}</option>
    )
}

export default PopulateGames;