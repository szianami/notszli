import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Document from './document';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <h1 className="Logo">notszli</h1><p className="Intro">
              hi there!{" "}
              <span role="img" aria-label="greetings" className="Emoji">
                👋
              </span>{" "}
              You can add content below. Type <span className="Code">/</span> for commands!
            </p>
    <Document />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
