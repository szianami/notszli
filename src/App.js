import logo from './logo.svg';
import './App.css';
import './index.css';
import Document from './components/document';
import React from 'react';
import { userAuthContext } from './context/userAuthContext';
import Logout from './components/logout';

// todo: egy spinnert mutatni, amíg be nem töltődik az userAuthContext, viszont nem feltétlen itt!
class App extends React.Component {
  render() {
    return (
      <>
        {this.context.user && (
          <div className="header flex">
            <Logout />
          </div>
        )}

        <h1 className="Logo">notszli</h1>
        <p className="Intro">
          hi there!{' '}
          <span role="img" aria-label="greetings" className="Emoji">
            👋
          </span>{' '}
          You can add content below.Type <span className="Code">/</span> for commands!
        </p>
        <Document />
      </>
    );
  }
}

App.contextType = userAuthContext;

export default App;
