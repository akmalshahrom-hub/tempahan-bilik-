/**
 * Firebase / Firestore Configuration & Adapter Layer
 * 
 * In development or standalone mode, this app uses localStorage via storageService.
 * To connect to Firebase:
 * 1. Populate the .env file with your Firebase credentials:
 *    VITE_FIREBASE_API_KEY=...
 *    VITE_FIREBASE_AUTH_DOMAIN=...
 *    VITE_FIREBASE_PROJECT_ID=...
 *    VITE_FIREBASE_STORAGE_BUCKET=...
 *    VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *    VITE_FIREBASE_APP_ID=...
 * 2. Set VITE_USE_FIREBASE=true
 */

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseAppConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'meeting-room-system.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'meeting-room-system-my',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'meeting-room-system.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

export const isFirebaseEnabled = (): boolean => {
  return import.meta.env.VITE_USE_FIREBASE === 'true';
};
