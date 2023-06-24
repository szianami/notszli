import * as React from 'react';
import Grid from '@mui/material/Grid';
import welcomeImg from '../images/welcome_computer_torso.png';
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
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Grid container spacing={0}>
            <Grid item xs={12} sm={6}>
              <img
                src={welcomeImg}
                style={{
                  width: '100%',
                }}
                alt="a person sitting in front of a computer"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                      fontSize: '16px',
                    }}
                  >
                    Notszli is a web-based text editor that makes your writing
                    flow fun & fast.
                  </p>
                </div>
              </div>
            </Grid>
          </Grid>
          <div>
            <p
              style={{
                paddingTop: '1.5em',
                paddingBottom: '0.3em',
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
          </div>
          <div>
            <p
              style={{
                paddingTop: '1.8em',
                paddingBottom: '0.5em',
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
