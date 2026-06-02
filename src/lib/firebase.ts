import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithCredential } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "gitasadhana-app.firebaseapp.com",
  projectId: "gitasadhana-app",
  storageBucket: "gitasadhana-app.firebasestorage.app",
  messagingSenderId: "822836118890",
  appId: "1:822836118890:web:16ae4ff0ea730954165113",
  measurementId: "G-GQ23CEM0FG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust local persistent cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Initialize Auth
const auth = getAuth(app);

// Initialize Cloud Functions
const functions = getFunctions(app, "us-central1");

export { app, db, auth, functions, GoogleAuthProvider, OAuthProvider, signInWithCredential };
