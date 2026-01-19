
// Fix: Consolidating modular imports for Firebase v9+ to resolve missing export errors.
// Using namespace imports and destructuring to resolve resolution issues in specific environments.
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, where, deleteDoc 
} from "firebase/firestore";

// Fix: Destructuring from namespace imports to resolve "no exported member" errors
const { initializeApp, getApp, getApps } = firebaseApp;
const { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } = firebaseAuth;

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || ""
};

// Helper to check if Firebase is correctly configured
export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

let app;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn(
    "DEBUG: Firebase API Key is missing. The app is running in 'Guest Mode' (Local State Only)."
  );
}

// Export modular functions from a single entry point to resolve resolution issues in external files
export { 
  auth, 
  db, 
  googleProvider, 
  onAuthStateChanged, 
  signInWithPopup,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc
};
