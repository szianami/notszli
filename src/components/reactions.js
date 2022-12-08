import React from 'react';

import '../index.css';

import { documentsContext } from '../context/documentsContext';

import SmsIcon from '@mui/icons-material/Sms';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FavoriteIcon from '@mui/icons-material/Favorite';

import {
  doc,
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

import { Paper, Grid, Fab, SvgIcon, Tooltip, Snackbar } from '@mui/material';
import EditVisibilityDialog from './editVisibilityDialog';
import Comment from './comment';
import AddCommentDialog from './addCommentDialog';

class Reactions extends React.Component {
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

    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.loadReactions = this.loadReactions.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.closeCopyAlert = this.closeCopyAlert.bind(this);
    this.openCopyAlert = this.openCopyAlert.bind(this);
    this.closeCommentDialog = this.closeCommentDialog.bind(this);
    this.openCommentDialog = this.openCommentDialog.bind(this);
    this.openVisibilityDialog = this.openVisibilityDialog.bind(this);
    this.updateVisibility = this.updateVisibility.bind(this);
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
    this.setState({ userLikeId: null });

    if (!this.props.document) return;

    if (this.unsubscribe) this.unsubscribe();

    const q = query(
      collection(db, 'reactions'),
      where('documentId', '==', this.props.document.id)
      // where('type', '==', 'comment')
    ); // TODO add limit

    this.unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const reactions = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const comments = [];
      for (let reaction of reactions) {
        if (
          reaction.authorId === auth.currentUser.uid &&
          reaction.type === 'like'
        )
          this.setState({ userLikeId: reaction.id });
        if (reaction.type === 'comment') {
          comments.push(reaction);
        }
      }

      for (let comment of comments) {
        const author = await this.getAuthorOfComment(comment.authorId);
        Object.assign(comment, author);
      }

      const authorOfDocument = await this.getAuthorOfComment(
        this.props.document.authorId
      );

      this.setState({ authorOfDocument });
      comments.sort((a, b) => {
        const timestampOfA = a.timestamp;
        const timestampOfB = b.timestamp;
        return timestampOfB - timestampOfA;
      });

      comments.forEach((comment) => {
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

  openCommentDialog() {
    this.setState({ isCommentOpen: true });
  }

  closeCommentDialog() {
    this.setState({ isCommentOpen: false });
  }

  handleContentChange = (event) => {
    this.setState({ content: event.target.value });
  };

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

  closeCopyAlert(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ isCopiedToClipboardOpen: false });
  }

  openCopyAlert() {
    this.setState({ isCopiedToClipboardOpen: true });
  }

  openVisibilityDialog() {
    this.setState({ isVisibilityDialogOpen: true });
  }

  updateVisibility(value) {
    // ha változás történt a visibiltyben, akkor küldje fel a firestoreba
    if (
      value !== this.props.document.visibility ||
      !this.props.document.visibility
    ) {
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
          onClose={this.closeCopyAlert}
          sx={{ width: '100%' }}
          message={
            'Link to ' + this.props.document.title + ' copied to clipboard.'
          }
        />

        <EditVisibilityDialog
          // jajjaj mi itt a visibility?
          visibility={this.props.document.visibility}
          isOpen={this.state.isVisibilityDialogOpen}
          onClose={this.updateVisibility}
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
                    <SvgIcon sx={{ fontSize: 'large' }}>
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
                      <VisibilityIcon
                        sx={{ color: 'white', fontSize: 'large' }}
                      />
                    ) : (
                      <VisibilityOffIcon
                        sx={{ color: 'white', fontSize: 'large' }}
                      />
                    )}
                  </Fab>
                </Tooltip>
              </Grid>

              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                <Tooltip title="Comment on document">
                  <Fab
                    onClick={this.openCommentDialog}
                    size="small"
                    color="primary"
                    aria-label="comment on document"
                  >
                    <SmsIcon sx={{ fontSize: 'large' }} />
                  </Fab>
                </Tooltip>
              </Grid>

              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                {!!this.state.userLikeId ? (
                  <Tooltip title="Unlike this document">
                    <Fab
                      onClick={this.handleLike}
                      size="small"
                      color="error"
                      aria-label="unlike document"
                    >
                      <FavoriteIcon
                        htmlColor="#fff"
                        sx={{ fontSize: 'large' }}
                      />
                    </Fab>
                  </Tooltip>
                ) : (
                  <Tooltip title="Like this document">
                    <Fab
                      onClick={this.handleLike}
                      size="small"
                      color="primary"
                      aria-label="like document"
                    >
                      <FavoriteIcon
                        htmlColor="#fff"
                        sx={{ fontSize: 'large' }}
                      />
                    </Fab>
                  </Tooltip>
                )}
              </Grid>
              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                {this.props.document.reactionCount.comments > 1 ? (
                  <h6 style={{ color: 'grey' }}>
                    {this.props.document.reactionCount.comments} comments
                  </h6>
                ) : (
                  <h6 style={{ color: 'grey' }}>
                    {this.props.document.reactionCount.comments} comment
                  </h6>
                )}
              </Grid>
              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                {this.props.document.reactionCount.likes > 1 ? (
                  <h6 style={{ color: 'grey' }}>
                    {this.props.document.reactionCount.likes} likes
                  </h6>
                ) : (
                  <h6 style={{ color: 'grey' }}>
                    {this.props.document.reactionCount.likes} like
                  </h6>
                )}
              </Grid>
              <Grid style={{ display: 'flex', alignItems: 'center' }} item>
                <h6 style={{ color: '#0f2e53' }}>
                  {' '}
                  {this.state.authorOfDocument.displayName}{' '}
                </h6>
              </Grid>
            </>
          ) : null}
        </Grid>

        {this.state.isCommentOpen ? (
          <AddCommentDialog
            document={this.props.document}
            closeCommentDialog={this.closeCommentDialog}
          />
        ) : null}

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
              <Comment comment={comment} />
            </Paper>
          );
        })}
      </>
    );
  }
}

Reactions.contextType = documentsContext;

export default Reactions;
