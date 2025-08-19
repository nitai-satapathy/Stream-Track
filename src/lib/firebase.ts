import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "cinestream-nzyo7",
  appId: "1:817990861026:web:736080631467fdede8debb",
  storageBucket: "cinestream-nzyo7.firebasestorage.app",
  apiKey: "AIzaSyBFLrBRw45IR0hBHgRh1P5OtQo_vEb803g",
  authDomain: "cinestream-nzyo7.firebaseapp.com",
  messagingSenderId: "817990861026",
  measurementId: "",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
