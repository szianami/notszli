import React from 'react';

import '../index.css';

import { getAvatar } from '../utils/avatar';

import TimeAgo from 'javascript-time-ago';
import ReactTimeAgo from 'react-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import { Grid } from '@mui/material';

TimeAgo.addDefaultLocale(en);

class Comment extends React.Component {
  render() {
    return (
      <Grid container wrap="nowrap" spacing={2}>
        <Grid item>
          <div
            className="avatar"
            style={{
              backgroundColor: getAvatar(this.props.comment.displayName).color,
            }}
          >
            {getAvatar(this.props.comment.displayName).letters}
          </div>
        </Grid>
        <Grid justifyContent="left" item xs zeroMinWidth>
          <Grid container direction="row" alignItems="center">
            <div
              style={{
                fontSize: '1em',
                fontWeight: '600',
                paddingRight: '10px',
              }}
            >
              {this.props.comment.displayName}
            </div>
            <div style={{ color: 'gray' }}>{this.props.comment.email}</div>
          </Grid>
          <p
            data-testid="comment-text"
            style={{
              marginTop: '10px',
              paddingLeft: '10px',
              textAlign: 'left',
            }}
          >
            {this.props.comment.text}
          </p>
          <div
            style={{ textAlign: 'right', paddingRight: '5px', color: 'gray' }}
          >
            {this.props.comment.timestamp ? (
              <ReactTimeAgo
                date={this.props.comment.timestamp}
                locale="en-US"
                timeStyle="round-minute"
              />
            ) : null}
          </div>
        </Grid>
      </Grid>
    );
  }
}
export default Comment;
