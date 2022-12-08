import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthContext';
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';
import { Fab } from '@mui/material';

const LogoutButton = () => {
  const { logOut } = useUserAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Fab
      onClick={handleLogout}
      size="small"
      color="primary"
      aria-label="logout"
      sx={{ marginRight: '2rem' }}
    >
      <LogoutSharpIcon />
    </Fab>
  );
};

export default LogoutButton;
