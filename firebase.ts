
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase configuration for project: nano-banana-c89ab
 * Note: These keys are restricted to the authorized domain for security.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBkIzIaZYQJKlHoDD7OQmRSJr9HSeO75d0",
  authDomain: "nano-banana-c89ab.firebaseapp.com",
  projectId: "nano-banana-c89ab",
  storageBucket: "nano-banana-c89ab.firebasestorage.app",
  messagingSenderId: "593704617313",
  appId: "1:593704617313:web:1abbeb62d6b2ecb8eeb120"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
