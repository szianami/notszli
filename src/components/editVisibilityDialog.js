import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Divider, FormControlLabel, Switch } from '@mui/material';

const options = [
  {
    id: 'private',
    primary: 'Private',
    secondary: 'Only you can view and react to this document.',
    avatar: <VisibilityOffIcon />,
  },
  {
    id: 'public',
    primary: 'Public',
    secondary: 'Everybody with the link can view and react to this document.',
    avatar: <VisibilityIcon />,
  },
  /*
  {
    id: 'reactions-disabled',
    primary: 'Public & reactions disabled',
    secondary: 'The document is public, but reactions are disabled.',
    avatar: <CommentsDisabledIcon />,
  },
  */
];

export default function EditVisibilityDialog(props) {
  const { onClose, isOpen, visibility } = props;

  const handleClose = () => {
    onClose(visibility);
  };

  const handleListItemClick = (value) => {
    // TODO: mások által való szerkeszthetőség biztosítása
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <DialogTitle>Who would you like to share this document with?</DialogTitle>
      <List sx={{ pt: 0 }}>
        {options.map((option) => (
          <div key={option.id}>
            <ListItem
              autoFocus
              button
              onClick={() => handleListItemClick(option.id)}
              selected={visibility === option.id}
            >
              <ListItemAvatar>
                <Avatar>{option.avatar}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={option.primary}
                secondary={option.secondary}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </div>
        ))}

        <ListItem>
          <FormControlLabel
            disabled
            control={<Switch />}
            label="Allow others to edit this document"
          />
        </ListItem>
      </List>
    </Dialog>
  );
}
