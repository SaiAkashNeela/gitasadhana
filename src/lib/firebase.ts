import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, indexedDBLocalPersistence, GoogleAuthProvider, OAuthProvider, signInWithCredential } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  persistentSingleTabManager,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { Capacitor } from "@capacitor/core";

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

// Native WebView doesn't support multi-tab IndexedDB coordination
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: Capacitor.isNativePlatform()
      ? persistentSingleTabManager({})
      : persistentMultipleTabManager(),
  }),
});

// initializeAuth with indexedDB persistence avoids WebView popup/redirect resolver deadlock
const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);

// Initialize Cloud Functions
const functions = getFunctions(app, "us-central1");

export { app, db, auth, functions, GoogleAuthProvider, OAuthProvider, signInWithCredential };
