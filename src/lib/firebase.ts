import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithCredential } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "gita-1fe63.firebaseapp.com",
  projectId: "gita-1fe63",
  storageBucket: "gita-1fe63.firebasestorage.app",
  messagingSenderId: "397599373842",
  appId: "1:397599373842:android:e19f24860156c93a8376cb",
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

export { app, db, auth, GoogleAuthProvider, OAuthProvider, signInWithCredential };
