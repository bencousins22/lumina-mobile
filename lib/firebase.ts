
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCF3rGVrI7FGDhP7RCcKPj02b41yoDfv0Q",
  authDomain: "aussie-agents-pprdsp.firebaseapp.com",
  projectId: "aussie-agents-pprdsp",
  storageBucket: "aussie-agents-pprdsp.firebasestorage.app",
  messagingSenderId: "759924142908",
  appId: "1:759924142908:web:8e927ca47d9f1fcadae439"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
