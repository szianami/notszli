import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { useUserAuth } from '../context/userAuthContext';
/*
const ProtectedRoute = ({ children }) => {
  const { user } = useUserAuth();

  console.log("Check user in Private: ", user);
  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
};
*/

class ProtectedRoute extends React.Component {
  render() {
    return (
      <>
        {!auth.currentUser && <Navigate to="/login" replace={true} />}
        {auth.currentUser && this.props.children}
      </>
    );
  }
}

export default ProtectedRoute;
