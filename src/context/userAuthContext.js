import React, { createContext, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from '../utils/firebase';

export const userAuthContext = createContext();

class UserAuthContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
    };
  }

  logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password).then((user) => {
      console.log(user);
      if (user && user.user.emailVerified === false) {
        sendEmailVerification(auth.currentUser).then(function() {
          console.log('email verification sent to user');
        });
      }
    });
  }

  logOut() {
    return signOut(auth);
  }

  googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  componentDidMount() {
    // After 4.0.0, the observer is only triggered on sign-in or sign-out
    this.unsubscribeAuth = onAuthStateChanged(auth, (currentuser) => {
      console.log('Auth', currentuser);
      this.setState({
        user: currentuser,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
  }

  render() {
    return (
      <userAuthContext.Provider
        value={{
          user: this.state.user,
          logIn: this.logIn,
          signUp: this.signUp,
          logOut: this.logOut,
          googleSignIn: this.googleSignIn,
        }}
      >
        {this.props.children}
      </userAuthContext.Provider>
    );
  }
}
export default UserAuthContextProvider;

export function useUserAuth() {
  return useContext(userAuthContext);
}
