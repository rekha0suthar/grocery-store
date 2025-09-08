// Firebase configuration for frontend (FREE TIER)
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration (FREE TIER)
const firebaseConfig = {
  apiKey: "demo-key", // Demo key for emulator
  authDomain: "grocery-store-e94dc.firebaseapp.com",
  projectId: "grocery-store-e94dc",
  storageBucket: "grocery-store-e94dc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Always connect to emulators in development (FREE TIER)
if (import.meta.env.DEV) {
  const emulatorHost = 'localhost';
  const authPort = 9099;
  const firestorePort = 8080;
  const storagePort = 9199;

  try {
    // Connect Auth emulator
    if (!auth._delegate._config?.emulator) {
      connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { disableWarnings: true });
    }

    // Connect Firestore emulator
    if (!db._delegate._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, emulatorHost, firestorePort);
    }

    // Connect Storage emulator
    if (!storage._delegate._host?.includes('localhost')) {
      connectStorageEmulator(storage, emulatorHost, storagePort);
    }

    console.log('🔧 Connected to Firebase emulators (FREE tier)');
  } catch (error) {
    console.warn('⚠️ Failed to connect to Firebase emulators:', error.message);
  }
}

export default app;
