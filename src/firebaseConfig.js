// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";

const firebaseConfig = {
  apiKey: "AIzaSyDkcqaMW-3B5MPIah69t7UXJGCPjjihI4k",
  authDomain: "jyo-fashion-fiesta-6ddaa.firebaseapp.com",
  projectId: "jyo-fashion-fiesta-6ddaa",
  storageBucket: "jyo-fashion-fiesta-6ddaa.appspot.com",
  messagingSenderId: "437720927659",
  appId: "1:437720927659:web:572a5e7c8d64caa72b16ee",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { auth, db };

