import * as React from 'react';
import { useContext } from 'react';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { documentsContext } from '../context/documentsContext';

export default function AddNewDocument(id) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');

  const context = useContext(documentsContext);

  const isNewDocument = id ? true : false;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await context.addNewDocument(title);
    setOpen(false);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  return (
    <div>
      <Button
        type="submit"
        variant="text"
        sx={{ textTransform: 'none' }}
        onClick={handleClickOpen}
      >
        <AddIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
        <div
          className="sidebar-document-title"
          style={{
            width: 'fit-content',
            color: '#0f2e53',
            fontFamily: 'Segoe UI',
            fontSize: '16px',
          }}
        >
          {isNewDocument ? 'Add new document' : 'Edit document title'}
        </div>
      </Button>
      <Dialog
        component="form"
        onSubmit={handleSubmit}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          {isNewDocument ? 'Add new document' : 'Edit document title'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isNewDocument
              ? 'To start creating a document, give it a title.'
              : 'You can give your document a new title.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Document title"
            fullWidth
            variant="standard"
            onChange={handleTitleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add document</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
