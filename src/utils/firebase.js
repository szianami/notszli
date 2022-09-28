// Import the functions you need from the SDKs you need
import firebase from "firebase"
// default vs named import
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "../firebaseConfig";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);

export const db = firebase.firestore();
export const auth = getAuth(app);

export default firebase;
