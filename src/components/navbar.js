import React, { useState, useEffect } from 'react';
import LogoutButton from './logoutButton';
import { Link } from 'react-router-dom';
import { debounce } from '../utils/debounce';
import { auth } from '../utils/firebase';
import { getAvatar } from '../utils/avatar';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../index.css';
import '../App.css';
import LoginButton from './loginButton';

const Navbar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  const handleScroll = debounce(() => {
    const currentScrollPos = window.pageYOffset;
    setVisible(
      (prevScrollPos > currentScrollPos &&
        prevScrollPos - currentScrollPos > 70) ||
        currentScrollPos < 10
    );
    setPrevScrollPos(currentScrollPos);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, visible, handleScroll]);

  const navbarStyles = {
    position: 'relative',
    height: '60px',
    width: '100%',
    transition: 'top 0.6s',
    display: 'flex',
    flexWrap: 'inherit',
    zIndex: '2',
  };

  return (
    <div
      className="navbar navbar-expand-lg navbar-light bg-light"
      style={{ ...navbarStyles, top: visible ? '0' : '-60px' }}
    >
      <Link
        className="Logo"
        to={`/`}
        style={{ textDecoration: 'none', color: '#000042' }}
      >
        notszli
      </Link>
      {auth.currentUser !== null && (
        <>
          <div className="user-navbar-container">
            <div
              className="avatar avatar-smol"
              style={{
                backgroundColor: getAvatar(auth.currentUser.displayName).color,
              }}
            >
              {getAvatar(auth.currentUser.displayName).letters}
            </div>
            <div
              className="sidebar-document-title"
              style={{ width: 'fit-content', color: '#0f2e53' }}
            >
              {auth.currentUser.displayName}
            </div>
          </div>
          <div className="header flex">
            <LogoutButton />
          </div>
        </>
      )}
      {auth.currentUser === null && <LoginButton />}
    </div>
  );
};

// Navbar.contextType = userAuthContext;

export default Navbar;
