import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Read Firebase config purely from Vite environment variables (Vercel / Local)
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || "";
const appId = import.meta.env.VITE_FIREBASE_APP_ID || "";

export const firebaseConfig = {
  projectId: projectId,
  apiKey: apiKey,
  authDomain: projectId ? `${projectId}.firebaseapp.com` : "",
  firestoreDatabaseId: databaseId || "(default)",
  storageBucket: projectId ? `${projectId}.firebasestorage.app` : "",
  appId: appId
};

// Initialize Firebase App instance safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore database
export const db = (databaseId && databaseId !== "(default)") 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);

export default app;
