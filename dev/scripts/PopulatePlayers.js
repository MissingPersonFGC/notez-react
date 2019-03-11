import React from 'react';

const PopulatePlayers = (props) => {
    return <option value={props.playerName}>{props.playerName}</option>
}

export default PopulatePlayers;