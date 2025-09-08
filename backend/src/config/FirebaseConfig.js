import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Firebase Configuration Manager (FREE TIER)
 * Uses Firebase emulator for development to avoid billing
 */
class FirebaseConfig {
  constructor() {
    this.app = null;
    this.isInitialized = false;
    this.config = this.loadConfig();
  }

  loadConfig() {
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      emulatorHost: process.env.FIREBASE_EMULATOR_HOST || 'localhost',
      emulatorPort: process.env.FIREBASE_EMULATOR_PORT || 8080,
      useEmulator: process.env.FIREBASE_EMULATOR === 'true'
    };

    // For FREE tier, we don't validate service account
    console.log('🔧 Using Firebase FREE tier with emulator');
    return config;
  }

  initialize() {
    if (this.isInitialized && this.app) {
      return this.app;
    }

    try {
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        this.app = admin.app();
        this.isInitialized = true;
        console.log('✅ Using existing Firebase app instance');
        return this.app;
      }

      // Initialize with default credentials (FREE tier)
      this.app = admin.initializeApp({
        projectId: this.config.projectId,
        databaseURL: this.config.databaseURL,
        storageBucket: this.config.storageBucket
      });

      this.isInitialized = true;
      console.log('✅ Firebase Admin SDK initialized (FREE tier)');
      
      // Configure emulator if specified
      if (this.config.useEmulator) {
        this.configureEmulator();
      }

      return this.app;
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw new Error(`Failed to initialize Firebase: ${error.message}`);
    }
  }

  configureEmulator() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Configuring Firebase emulator...');
      
      // Set emulator environment variables
      process.env.FIRESTORE_EMULATOR_HOST = `${this.config.emulatorHost}:${this.config.emulatorPort}`;
      process.env.FIREBASE_AUTH_EMULATOR_HOST = `${this.config.emulatorHost}:9099`;
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${this.config.emulatorHost}:9199`;
      
      console.log('✅ Firebase emulator configured');
    }
  }

  getFirestore() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return admin.firestore();
  }

  getAuth() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return admin.auth();
  }

  getStorage() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return admin.storage();
  }

  getMessaging() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return admin.messaging();
  }

  getApp() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.app;
  }

  getConfig() {
    return { ...this.config };
  }

  isFirebaseInitialized() {
    return this.isInitialized;
  }

  reset() {
    if (this.app) {
      this.app.delete();
      this.app = null;
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
const firebaseConfig = new FirebaseConfig();

// Export instances for backward compatibility
export const db = firebaseConfig.getFirestore();
export const auth = firebaseConfig.getAuth();
export const storage = firebaseConfig.getStorage();
export const messaging = firebaseConfig.getMessaging();
export const app = firebaseConfig.getApp();

// Export the configuration manager
export default firebaseConfig;
