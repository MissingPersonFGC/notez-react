import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";

class App extends React.Component {
    render() {
      return (
        <div>
          Hello
        </div>
      )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));
