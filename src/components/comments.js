import React from 'react';

import '../index.css';

import { userAuthContext } from '../context/userAuthContext';
import { documentsContext } from '../context/documentsContext';

import TimeAgo from 'javascript-time-ago';
import ReactTimeAgo from 'react-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import SmsIcon from '@mui/icons-material/Sms';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SendSharpIcon from '@mui/icons-material/SendSharp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db, auth } from '../utils/firebase';

import { Paper, Grid, Fab, SvgIcon, Tooltip, Snackbar, TextField } from '@mui/material';
import stc from 'string-to-color';
import { getAvatar } from '../utils/avatar';
import EditVisibilityDialog from './editVisibilityDialog';

TimeAgo.addDefaultLocale(en);

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCommentOpen: false,
      comments: [],
      content: '',
      authorOfDocument: '',
      isCopiedToClipboardOpen: false,
      isVisibilityDialogOpen: false,
      userLikeId: null,
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.loadReactions = this.loadReactions.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.closeAlert = this.closeAlert.bind(this);
    this.openAlert = this.openAlert.bind(this);
    this.openVisibilityDialog = this.openVisibilityDialog.bind(this);
    this.handleCloseVisibilityDialog = this.handleCloseVisibilityDialog.bind(this);
  }

  componentDidMount() {
    this.loadReactions();
  }

  componentDidUpdate(prevProps, prevState) {
    const { id: prevId } = prevProps.document || {};
    if (!this.props.document) return;
    if (this.props.document.id !== prevId) {
      this.setState({ isCommentOpen: false });
      this.loadReactions();
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  loadReactions() {
    // TODO !!! miez?
    //if (!uid || this.uid === uid) return;
    //this.uid = uid;

    this.setState({ userLikeId: null });

    if (!this.props.document) return;
    console.log(this.props.document.id);

    if (this.unsubscribe) this.unsubscribe();

    const q = query(
      collection(db, 'reactions'),
      where('documentId', '==', this.props.document.id)
      // where('type', '==', 'comment')
    ); // TODO add limit

    this.unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // console.log(querySnapshot.docs);
      const reactions = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      const comments = reactions.filter((reaction) => {
        if (reaction.authorId === auth.currentUser.uid && reaction.type === 'like')
          this.setState({ userLikeId: reaction.id });
        if (reaction.type === 'comment') {
          return reaction;
        }
      });

      console.log('comments:', comments);

      for (let comment of comments) {
        const author = await this.getAuthorOfComment(comment.authorId);
        console.log(author);
        Object.assign(comment, author);
        console.log(comment);
      }

      const authorOfDocument = await this.getAuthorOfComment(this.props.document.authorId);

      this.setState({ authorOfDocument });
      comments.sort((a, b) => {
        const timestampOfA = a.timestamp;
        const timestampOfB = b.timestamp;
        return timestampOfB - timestampOfA;
      });

      comments.map((comment) => {
        if (comment.timestamp) {
          comment.timestamp = comment.timestamp.toDate();
        }
      });

      this.setState({ comments });
    });
  }

  async handleLike() {
    if (!this.props) return;

    if (!this.state.userLikeId) {
      const reactionsRef = collection(db, 'reactions'); // collectionRef
      const reactionRef = doc(reactionsRef); // docRef
      const likeId = reactionRef.id; // a docRef has an id property

      await setDoc(reactionRef, {
        type: 'like',
        timestamp: serverTimestamp(),
        authorId: auth.currentUser.uid,
        documentId: this.props.document.id,
      });

      await updateDoc(doc(db, 'documents', this.props.document.id), {
        reactionCount: {
          comments: this.props.document.reactionCount.comments || 0,
          likes: this.props.document.reactionCount.likes + 1,
        },
      });

      this.setState({ userLikeId: likeId });
    } else {
      deleteDoc(doc(db, 'reactions', this.state.userLikeId));

      await updateDoc(doc(db, 'documents', this.props.document.id), {
        reactionCount: {
          comments: this.props.document.reactionCount.comments || 0,
          likes: this.props.document.reactionCount.likes - 1,
        },
      });
      this.setState({ userLikeId: null });
    }
  }

  handleClickOpen = () => {
    this.setState({ isCommentOpen: true });
  };

  handleClose = () => {
    this.setState({ isCommentOpen: false });
  };

  handleSubmit = async (event) => {
    if (!this.props) return;

    console.log(this.props.document.id);
    await addDoc(collection(db, 'reactions'), {
      type: 'comment',
      timestamp: serverTimestamp(),
      authorId: auth.currentUser.uid,
      documentId: this.props.document.id,
      text: this.state.content,
    });
    this.setState({ isCommentOpen: false });

    /*
    const docSnap = await getDoc(doc(db, 'documents', document.id));
    const document = docSnap.data();
    */
    await updateDoc(doc(db, 'documents', this.props.document.id), {
      reactionCount: {
        comments: this.props.document.reactionCount.comments + 1 || 1,
        likes: this.props.document.reactionCount.likes || 0,
      },
    });
    this.setState({ isCommentOpen: false });
  };

  handleContentChange = (event) => {
    this.setState({ content: event.target.value });
  };

  getDisplayNameLetters(name) {
    if (!name) return;
    return name
      .split(' ')
      .map((item) => {
        return item[0];
      })
      .join('');
  }

  async getAuthorOfComment(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log('user already exists, no need to add to doc');
      console.log('comment author - ', docSnap.data());
      return docSnap.data();
    } else {
    }
  }

  closeAlert(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ isCopiedToClipboardOpen: false });
  }

  openAlert() {
    this.setState({ isCopiedToClipboardOpen: true });
  }

  openVisibilityDialog() {
    this.setState({ isVisibilityDialogOpen: true });
  }

  handleCloseVisibilityDialog(value) {
    // ha változás történt a visibiltyben, akkor küldje fel a firestoreba
    console.log('doc id miafene ', this.props.document);
    if (value !== this.props.document.visibility || !this.props.document.visibility) {
      this.context.setVisibility(this.props.document.id, value);
    }
    this.setState({ isVisibilityDialogOpen: false });
  }

  render() {
    return (
      <>
        <Snackbar
          open={this.state.isCopiedToClipboardOpen}
          autoHideDuration={3000}
          onClose={this.closeAlert}
          sx={{ width: '100%' }}
          message={'Link to ' + this.props.document.title + ' copied to clipboard.'}
        />

        <EditVisibilityDialog
          // jajjaj mi itt a visibility?
          visibility={this.props.document.visibility}
          isOpen={this.state.isVisibilityDialogOpen}
          onClose={this.handleCloseVisibilityDialog}
        />

        <Grid
          style={{ marginTop: '2rem', paddingBottom: '1rem' }}
          direction="row-reverse"
          container
          wrap="nowrap"
          spacing={2}
        >
          {this.props.document ? (
            <>
              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                <Tooltip title="Copy document URL to clipboard">
                  <Fab
                    onClick={() => {
                      this.openAlert();
                      navigator.clipboard.writeText(this.props.route);
                    }}
                    size="small"
                    color="primary"
                    aria-label="copy to clipboard"
                  >
                    <SvgIcon>
                      <svg
                        aria-hidden="true"
                        data-prefix="fab"
                        data-icon="github-alt"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                      >
                        <path
                          fill="fff"
                          d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"
                        />
                      </svg>{' '}
                    </SvgIcon>
                  </Fab>
                </Tooltip>
              </Grid>

              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                <Tooltip title="Edit visibility settings">
                  <Fab
                    onClick={() => {
                      this.openVisibilityDialog();
                    }}
                    size="small"
                    color="primary"
                    aria-label="open visibility dialog"
                  >
                    {this.props.document.visibility === 'public' ? (
                      <VisibilityIcon sx={{ color: 'white' }} />
                    ) : (
                      <VisibilityOffIcon sx={{ color: 'white' }} />
                    )}
                  </Fab>
                </Tooltip>
              </Grid>

              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                <Tooltip title="Comment on document">
                  <Fab onClick={this.handleClickOpen} size="small" color="primary" aria-label="comment on document">
                    <SmsIcon />
                  </Fab>
                </Tooltip>
              </Grid>

              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                {!!this.state.userLikeId ? (
                  <Tooltip title="Unlike this document">
                    <Fab onClick={this.handleLike} size="small" color="error" aria-label="unlike document">
                      <FavoriteIcon htmlColor="#fff" />
                    </Fab>
                  </Tooltip>
                ) : (
                  <Tooltip title="Like this document">
                    <Fab onClick={this.handleLike} size="small" color="primary" aria-label="like document">
                      <FavoriteIcon htmlColor="#fff" />
                    </Fab>
                  </Tooltip>
                )}
              </Grid>
              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                {this.props.document.reactionCount.comments > 1 ? (
                  <h6 style={{ color: 'grey' }}>{this.props.document.reactionCount.comments} comments</h6>
                ) : (
                  <h6 style={{ color: 'grey' }}>{this.props.document.reactionCount.comments} comment</h6>
                )}
              </Grid>
              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                {this.props.document.reactionCount.likes > 1 ? (
                  <h6 style={{ color: 'grey' }}>{this.props.document.reactionCount.likes} likes</h6>
                ) : (
                  <h6 style={{ color: 'grey' }}>{this.props.document.reactionCount.likes} like</h6>
                )}
              </Grid>
              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                <h6 style={{ color: '#0f2e53' }}> {this.state.authorOfDocument.displayName} </h6>
              </Grid>
            </>
          ) : null}
        </Grid>

        {this.state.isCommentOpen ? (
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
                <div className="avatar" style={{ backgroundColor: stc(auth.currentUser.displayName) }}>
                  {this.getDisplayNameLetters(auth.currentUser.displayName)}
                </div>
              </Grid>
              <Grid justifyContent="left" item xs zeroMinWidth>
                <h6 style={{ marginTop: '5px', textAlign: 'left' }}>{auth.currentUser.displayName}</h6>
                <p style={{ textAlign: 'left', color: 'gray' }}>{auth.currentUser.email}</p>
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
                <Fab onClick={this.handleClose} size="small" color="primary" aria-label="like">
                  <CloseIcon />
                </Fab>
              </Grid>
            </Grid>
          </Paper>
        ) : null}

        <>
          {this.state.comments.map((comment, index) => {
            return (
              <Paper
                key={index}
                elevation={0}
                style={{
                  backgroundColor: 'rgb(251, 251, 250)',
                  marginTop: '2em',
                  padding: '10px 15px',
                }}
              >
                <Grid container wrap="nowrap" spacing={2}>
                  <Grid item>
                    <div className="avatar" style={{ backgroundColor: getAvatar(comment.displayName).color }}>
                      {getAvatar(comment.displayName).letters}
                    </div>
                  </Grid>
                  <Grid justifyContent="left" item xs zeroMinWidth>
                    <Grid container direction="row" alignItems="center">
                      <div style={{ fontSize: '1em', fontWeight: '600', paddingRight: '10px' }}>
                        {comment.displayName}
                      </div>
                      <div style={{ color: 'gray' }}>{comment.email}</div>
                    </Grid>
                    <p style={{ marginTop: '10px', paddingLeft: '10px', textAlign: 'left' }}>{comment.text}</p>
                    <div style={{ textAlign: 'right', paddingRight: '5px', color: 'gray' }}>
                      {comment.timestamp ? (
                        <ReactTimeAgo date={comment.timestamp} locale="en-US" timeStyle="round-minute" />
                      ) : null}
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </>
      </>
    );
  }
}

Comments.contextType = documentsContext;

export default Comments;
