import React from 'react';

import '../index.css';

import { documentsContext } from '../context/documentsContext';

import { db } from '../utils/firebase';
import { serverTimestamp, collection, doc, updateDoc, addDoc } from 'firebase/firestore';
import { getAvatar } from '../utils/avatar';

import { Paper, Grid, TextField, Fab } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseIcon from '@mui/icons-material/Close';

class AddCommentDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
    };
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleContentChange = (event) => {
    this.setState({ content: event.target.value });
  };

  handleSubmit = async (event) => {
    if (!this.props) return;

    console.log(this.props.document.id);
    await addDoc(collection(db, 'reactions'), {
      type: 'comment',
      timestamp: serverTimestamp(),
      authorId: this.context.user.uid,
      documentId: this.props.document.id,
      text: this.state.content,
    });

    await updateDoc(doc(db, 'documents', this.props.document.id), {
      reactionCount: {
        comments: this.props.document.reactionCount.comments + 1 || 1,
        likes: this.props.document.reactionCount.likes || 0,
      },
    });

    this.props.closeCommentDialog();
  };

  render() {
    return (
      <Paper
        elevation={0}
        style={{
          backgroundColor: 'rgb(251, 251, 250)',
          marginTop: '2em',
          padding: '10px 15px',
        }}
      >
        <Grid container wrap="nowrap" spacing={2}>
          <Grid item>
            <div className="avatar" style={{ backgroundColor: getAvatar(this.context.user.displayName).color }}>
              {getAvatar(this.context.user.displayName).letters}
            </div>
          </Grid>
          <Grid justifyContent="left" item xs zeroMinWidth>
            <Grid container direction="row" alignItems="center">
              <div style={{ fontSize: '1em', fontWeight: '600', paddingRight: '10px' }}>
                {this.context.user.displayName}
              </div>
              <div style={{ color: 'gray' }}>{this.context.user.email}</div>
            </Grid>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              name="title"
              label="Type your comment here"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              onChange={this.handleContentChange}
            />
          </Grid>
        </Grid>
        <Grid style={{ marginTop: '5px' }} container direction="row-reverse" spacing={2}>
          <Grid item>
            <Fab onClick={this.handleSubmit} size="small" color="primary" aria-label="like">
              <SendRoundedIcon />
            </Fab>
          </Grid>
          <Grid item>
            <Fab onClick={this.props.closeCommentDialog} size="small" color="primary" aria-label="like">
              <CloseIcon />
            </Fab>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

AddCommentDialog.contextType = documentsContext;

export default AddCommentDialog;
