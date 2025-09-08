import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Legacy Firebase Configuration
 * This file is deprecated. Use FirebaseConfig.js instead.
 * Kept for backward compatibility during migration.
 */

let firebaseApp;

try {
  if (!admin.apps || !admin.apps || admin.apps.length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else {
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
  } else {
    firebaseApp = admin.app();
  }

  console.log('✅ Firebase Admin SDK initialized (Legacy)');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();

export default firebaseApp;
