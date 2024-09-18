// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
import { getDatabase, ref, get } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAmiN-jCQ92rYdf8ttrxrpheeGmAJ3KxVA",
  authDomain: "jyo-fashion-fiesta.firebaseapp.com",
  databaseURL: "https://jyo-fashion-fiesta-default-rtdb.firebaseio.com",
  projectId: "jyo-fashion-fiesta",
  storageBucket: "jyo-fashion-fiesta.appspot.com",
  messagingSenderId: "430873953674",
  appId: "1:430873953674:web:26f71e479f11da127f3473",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const database = getDatabase(app);
const storage = getStorage(app);
export { auth, ref, db, database, get, storage };

