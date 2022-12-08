import * as React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import './index.css';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import { withRouter } from './withRouter';
import { documentsContext } from './context/documentsContext';

import UserHasNoDocuments from './components/userHasNoDocuments';
import UserHasNoActiveDocument from './components/userHasNoActiveDocument';
import WelcomePage from './components/welcomePage';

// todo: egy spinnert mutatni, amíg be nem töltődik az userAuthContext, viszont nem feltétlen itt!

const SidebarWithRouter = withRouter(Sidebar);

class App extends React.Component {
  render() {
    return (
      <>
        <Navbar />
        <div className="app-container">
          {this.context.user === null ? (
            <div className="document-container">
              <WelcomePage />
            </div>
          ) : (
            <>
              <SidebarWithRouter documents={this.context.sidebarDocuments} />
              <div className="main">
                {this.props.router.params.documentId ? (
                  <div className="document-container">
                    <Outlet />
                  </div>
                ) : (
                  <div className="document-container">
                    {this.context.documents !== null &&
                    Object.keys(this.context.documents).length === 0 ? (
                      <UserHasNoDocuments />
                    ) : (
                      <UserHasNoActiveDocument />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </>
    );
  }
}

App.contextType = documentsContext;

export default App;
