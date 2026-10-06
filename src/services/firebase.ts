import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyCZs9L6W06MtOytPRxGnC3GbCVezcZpZ_8",
  authDomain: "old-is-gold-e6d27.firebaseapp.com",
  databaseURL: "https://old-is-gold-e6d27-default-rtdb.firebaseio.com",
  projectId: "old-is-gold-e6d27",
  storageBucket: "old-is-gold-e6d27.firebasestorage.app",
  messagingSenderId: "515315179915",
  appId: "1:515315179915:web:dcc89542a380aec6c90f8e"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance: ReturnType<typeof getFirestore> | null = null;
try {
  firestoreInstance = getFirestore(app);
} catch (e) {
  console.warn('Firestore initialization warning:', e);
}

let databaseInstance: ReturnType<typeof getDatabase> | null = null;
try {
  databaseInstance = getDatabase(app);
} catch (e) {
  console.warn('Realtime Database initialization warning:', e);
}

export const db = firestoreInstance;
export const rtdb = databaseInstance;
