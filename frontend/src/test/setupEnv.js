// src/test/setupEnv.js
// This runs BEFORE jsdom loads, so we can set up environment variables

process.env.TZ = 'UTC';
process.env.NODE_ENV = 'test';
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
process.env.VITE_FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = process.env.VITE_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET = process.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789';
process.env.VITE_FIREBASE_APP_ID = process.env.VITE_FIREBASE_APP_ID || 'test-app-id';
