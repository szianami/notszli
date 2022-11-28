import React, { createContext, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

export const userAuthContext = createContext({ user: '' });

// TODO: mi folyik itt, a didMountban subscribeolunk az auth change-re, oké asszem értem

class UserAuthContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
    };
    console.log('ctor usercontext: ', this.state.user);
    this.signUp = this.signUp.bind(this);
    this.logOut = this.logOut.bind(this);
    this.googleSignIn = this.googleSignIn.bind(this);
    this.addUserToFirestore = this.addUserToFirestore.bind(this);
  }

  async logIn(email, password, displayName) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password, displayName);
    } catch (error) {
      console.log(error.code, ' - Problems with login');
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  async signUp(email, password, displayName) {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password).then(async (res) => {
        updateProfile(res.user, {
          displayName: displayName,
        });
        await this.addUserToFirestore(res.user.uid, {
          email: email,
          displayName: displayName,
        });
      });
      // ez itt csinál valamit?
      this.setState({ user: user });
    } catch (error) {
      console.log(error.code, ' - Problems with signup');
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  logOut() {
    this.setState({ user: '' });
    return signOut(auth);
  }

  async addUserToFirestore(uid, data) {
    await setDoc(doc(db, 'users', uid), data)
      .then(() => {
        console.log('Added user to firestore!');
      })
      .catch((error) => {
        console.log('Something went wrong with added user to firestore: ', error);
      });
  }

  async googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    try {
      const user = await signInWithPopup(auth, googleAuthProvider);

      const docRef = doc(db, 'users', 'user.user.uid');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('user already exists, no need to add to doc');
      } else {
        await this.addUserToFirestore(user.user.uid, {
          email: user.user.email,
          displayName: user.user.displayName,
        });
      }
    } catch (error) {
      console.log(error.code, ' - Problems with signup');
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  componentDidMount() {
    // After 4.0.0, the observer is only triggered on sign-in or sign-out
    this.unsubscribeAuth = onAuthStateChanged(auth, (currentuser) => {
      console.log('Auth State Changed', currentuser);
      console.log('auth subscription');
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
