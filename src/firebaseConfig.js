// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";

const firebaseConfig = {
  apiKey: "AIzaSyDxZVJLJN-zyGrlWjheCnx0DhvYsorb1w8",
  authDomain: "jyo-fashion-47b0c.firebaseapp.com",
  projectId: "jyo-fashion-47b0c",
  storageBucket: "jyo-fashion-47b0c.appspot.com",
  messagingSenderId: "706587465005",
  appId: "1:706587465005:web:0193a5b9774d413e48efa4",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { auth, db };

