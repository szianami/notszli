import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import './index.css';
import Document from './components/document';
import Navbar from './components/navbar';
import { useUserAuth } from './context/userAuthContext';
import Logout from './components/logoutButton';
import Sidebar from './components/sidebar';
import { userAuthContext } from './context/userAuthContext';
import { db } from './utils/firebase';
import { withRouter } from './withRouter';
import { documentsContext } from './context/documentsContext';

// todo: egy spinnert mutatni, amíg be nem töltődik az userAuthContext, viszont nem feltétlen itt!

const SidebarWithRouter = withRouter(Sidebar);

class App extends React.Component {
  render() {
    return (
      <>
        <Navbar />
        <div className="app-container">
          <SidebarWithRouter documents={this.context.sidebarDocuments} />
          <div className="main">
            {this.props.router.params.documentId ? (
              <div className="document-container">
                <Outlet />
              </div>
            ) : (
              <div className="document-container">
                <p className="Intro">
                  hi there!{' '}
                  <span role="img" aria-label="greetings" className="Emoji">
                    👋
                  </span>{' '}
                  You can select a document to view its content or create a new one!
                </p>
                <Outlet />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}

App.contextType = documentsContext;

export default App;
