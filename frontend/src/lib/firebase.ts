import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TechCore Firebase Configuration
export const firebaseConfig = {
  projectId: "unique-diode-x6tp2",
  appId: "1:613282200427:web:8a5d512f2ac78245faea2e",
  apiKey: "AIzaSyDDuLTnCJKum7xQhYyLDS7posYk5mWXC0g",
  authDomain: "unique-diode-x6tp2.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-luxuryelectronic-9b205320-d69d-4896-853f-dba9e26cdb6e",
  storageBucket: "unique-diode-x6tp2.firebasestorage.app",
  messagingSenderId: "613282200427",
  measurementId: "",
  oAuthClientId: "613282200427-k0unt4go9rufarg97prnak7c3vrj6chr.apps.googleusercontent.com"
};

// Initialize Firebase App instance safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore database using the specified databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

export default app;
