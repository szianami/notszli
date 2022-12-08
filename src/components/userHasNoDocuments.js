import * as React from 'react';
import noDocumentsImg from '../images/no_documents_torso.png';
import '../index.css';

export default class UserHasNoDocuments extends React.Component {
  render() {
    return (
      <div style={{ marginTop: '3rem', display: 'flex' }}>
        <div>
          <img
            src={noDocumentsImg}
            style={{ width: '380px' }}
            alt="a woman thinking while sitting in front of a computer"
          />
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
            Hi, new here?
          </span>
          <div>
            <span
              style={{
                color: 'rgb(15, 46, 83)',
                fontFamily: 'Segoe UI',
                fontWeight: '500',
                fontSize: '16px',
              }}
            >
              Nice to see you!
            </span>
          </div>
          <div>
            <p
              style={{
                marginTop: '2rem',
                marginBottom: '2px',
                color: 'rgb(15, 46, 83)',
                fontFamily: 'Segoe UI',
                fontWeight: '500',
                fontSize: '16px',
              }}
            >
              You seem to have no documents yet.
            </p>
            <p
              style={{
                color: 'rgb(15, 46, 83)',
                fontFamily: 'Segoe UI',
                fontWeight: '500',
                fontSize: '16px',
              }}
            >
              Let's create a new one!
            </p>
          </div>
        </div>
      </div>
    );
  }
}
