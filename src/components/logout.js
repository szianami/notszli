import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthContext';

const Logout = () => {
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
    <button onClick={handleLogout} className="btn btn-light">
      Logout
    </button>
  );
};

export default Logout;
