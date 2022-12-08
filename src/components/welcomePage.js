import * as React from 'react';
import welcomeImg from '../images/welcome_computer_torso.png';
import introFunctions from '../images/intro_functions.mp4';
import documentExample from '../images/example.png';
import teamDiscussionImg from '../images/team_discussion.png';
import '../index.css';

export default class WelcomePage extends React.Component {
  render() {
    return (
      <>
        <div
          style={{
            marginTop: '3rem',
            display: 'flex',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
            }}
          >
            <div>
              <img
                src={welcomeImg}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignContent: 'center',
                  flexWrap: 'wrap',
                }}
                alt="a person sitting in front of a computer"
              />
            </div>
            <div
              style={{
                paddingTop: '2rem',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              <span
                style={{
                  fontFamily: 'ABeeZee, sans-serif',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: 'rgb(0 0 66)',
                }}
              >
                Hey, tired of heavy-weight text editors?
              </span>
              <div>
                <span
                  style={{
                    color: 'rgb(0 0 66)',
                    fontFamily: 'ABeeZee, sans-serif',
                    fontWeight: '700',
                    fontSize: '1.5rem',
                  }}
                >
                  Got you! Say hi to notszli!
                </span>
              </div>
              <div>
                <p
                  style={{
                    paddingTop: '1em',
                    color: 'rgb(0 0 66)',
                    fontFamily: 'Segoe UI',
                    fontWeight: '500',
                    fontSize: '16px',
                  }}
                >
                  Notszli is a web-based text editor that makes your writing
                  flow fun & fast.
                </p>
              </div>
            </div>
          </div>
          <div>
            <p
              style={{
                paddingTop: '1em',
                paddingLeft: '1em',
                color: 'rgb(0 0 66)',
                fontFamily: 'ABeeZee',
                fontWeight: '700',
                fontSize: '1.5em',
              }}
            >
              Create notes quicker than ever!
            </p>

            <img
              src={documentExample}
              style={{
                width: '100%',
                boxShadow: '0 3px 10px rgb(0 0 0 / 0.2)',
              }}
              alt="an example of a document"
            />

            <video
              src={introFunctions}
              loop="true"
              autoPlay="true"
              muted="true"
              style={{
                marginTop: '0.5em',
                width: '100%',
                boxShadow: '0 3px 10px rgb(0 0 0 / 0.2)',
              }}
              alt="a video on editing a block and its style"
            />
          </div>
          <div>
            <p
              style={{
                paddingTop: '1em',
                paddingLeft: '1em',
                color: 'rgb(0 0 66)',
                fontFamily: 'ABeeZee',
                fontWeight: '700',
                fontSize: '1.5em',
              }}
            >
              Publish your documents and see what others think!
            </p>
            <img
              src={teamDiscussionImg}
              style={{ width: '100%' }}
              alt="a team of two people discussing a project"
            />
          </div>
        </div>
      </>
    );
  }
}
