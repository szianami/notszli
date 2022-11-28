import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginSharpIcon from '@mui/icons-material/LoginSharp';
import { Button } from '@mui/material';

const LoginButton = () => {
  const navigate = useNavigate();
  const login = async () => {
    navigate('/login');
  };

  return (
    <>
      <Button
        onClick={login}
        variant="text"
        color="primary"
        sx={{
          marginRight: '1em',
          textTransform: 'none',
          fontSize: 'inherit',
          ':hover': {
            bgcolor: 'primary.vlight',
            color: 'primary.main',
          },
        }}
      >
        Login
      </Button>
      <Button
        onClick={login}
        variant="contained"
        color="primary"
        sx={{
          marginRight: '2rem',
          textTransform: 'none',
          fontSize: 'inherit',
          color: 'secondary.light',
          ':hover': {
            bgcolor: 'primary.light',
            color: 'secondary.light',
          },
        }}
      >
        Register
      </Button>
    </>
  );
};

export default LoginButton;
