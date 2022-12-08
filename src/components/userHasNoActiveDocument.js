import * as React from 'react';
import noDocumentsImg from '../images/no_active_document_torso.png';
import '../index.css';

export default class UserHasNoActiveDocument extends React.Component {
  render() {
    return (
      <div style={{ marginTop: '3rem', display: 'flex' }}>
        <div>
          <img src={noDocumentsImg} alt="a woman welcomingly waving" />
        </div>
        <div style={{ marginTop: '10rem' }}>
          <span
            style={{
              fontFamily: 'ABeeZee, sans-serif',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'rgb(0 0 66)',
            }}
          >
            Let's get into it!
          </span>
          <p
            style={{
              margin: '2rem 0',
              color: 'rgb(15, 46, 83)',
              fontFamily: 'Segoe UI',
              fontWeight: '500',
              fontSize: '16px',
            }}
          >
            <span>Select a document to start working with, or create a new one!</span>
          </p>
        </div>
      </div>
    );
  }
}
