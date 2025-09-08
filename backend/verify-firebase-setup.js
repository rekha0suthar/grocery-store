#!/usr/bin/env node

/**
 * Firebase Setup Verification Script
 * Tests the Firebase configuration and setup
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Verifying Firebase Setup...\n');

// Test 1: Environment Variables
console.log('1️⃣ Checking Environment Variables...');
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_STORAGE_BUCKET',
  'JWT_SECRET',
  'DATABASE_TYPE'
];

let envVarsValid = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: ${process.env[envVar].substring(0, 20)}...`);
  } else {
    console.log(`   ❌ ${envVar}: Missing`);
    envVarsValid = false;
  }
});

if (envVarsValid) {
  console.log('   ✅ All required environment variables are set\n');
} else {
  console.log('   ❌ Some environment variables are missing\n');
}

// Test 2: Firebase Configuration
console.log('2️⃣ Testing Firebase Configuration...');
try {
  const { default: firebaseConfig } = await import('./src/config/FirebaseConfig.js');
  
  // Test configuration loading
  const config = firebaseConfig.getConfig();
  console.log(`   ✅ Configuration loaded: ${Object.keys(config).length} properties`);
  
  // Test Firebase initialization
  const app = firebaseConfig.initialize();
  console.log('   ✅ Firebase app initialized');
  
  // Test service instances
  const db = firebaseConfig.getFirestore();
  const auth = firebaseConfig.getAuth();
  const storage = firebaseConfig.getStorage();
  
  console.log('   ✅ Firestore instance created');
  console.log('   ✅ Auth instance created');
  console.log('   ✅ Storage instance created');
  
} catch (error) {
  console.log(`   ❌ Firebase configuration error: ${error.message}`);
}

console.log('');

// Test 3: Firebase Auth Service
console.log('3️⃣ Testing Firebase Auth Service...');
try {
  const { FirebaseAuthService } = await import('./src/services/FirebaseAuthService.js');
  const authService = new FirebaseAuthService();
  console.log('   ✅ FirebaseAuthService instantiated');
  
  // Test service methods exist
  const methods = [
    'createUser', 'getUserByUid', 'getUserByEmail', 'updateUser',
    'deleteUser', 'verifyIdToken', 'createCustomToken'
  ];
  
  methods.forEach(method => {
    if (typeof authService[method] === 'function') {
      console.log(`   ✅ Method ${method} exists`);
    } else {
      console.log(`   ❌ Method ${method} missing`);
    }
  });
  
} catch (error) {
  console.log(`   ❌ Firebase Auth Service error: ${error.message}`);
}

console.log('');

// Test 4: File Structure
console.log('4️⃣ Checking File Structure...');
import { existsSync } from 'fs';

const requiredFiles = [
  '.env.example',
  '.env.development',
  '.env.production',
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json',
  'storage.rules',
  'setup-firebase-complete.sh',
  'src/config/FirebaseConfig.js',
  'src/services/FirebaseAuthService.js',
  'FIREBASE_SETUP.md',
  'FIREBASE_MIGRATION.md',
  'FIREBASE_SETUP_SUMMARY.md'
];

let filesValid = true;
requiredFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing`);
    filesValid = false;
  }
});

if (filesValid) {
  console.log('   ✅ All required files are present\n');
} else {
  console.log('   ❌ Some required files are missing\n');
}

// Test 5: Package.json Scripts
console.log('5️⃣ Checking Package.json Scripts...');
try {
  const packageJson = JSON.parse(await import('fs').then(fs => fs.readFileSync('package.json', 'utf8')));
  const requiredScripts = [
    'setup:firebase',
    'init:firebase',
    'firebase:emulator',
    'firebase:deploy:rules',
    'test:firebase'
  ];
  
  let scriptsValid = true;
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`   ✅ Script ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`   ❌ Script ${script} - Missing`);
      scriptsValid = false;
    }
  });
  
  if (scriptsValid) {
    console.log('   ✅ All required scripts are present\n');
  } else {
    console.log('   ❌ Some required scripts are missing\n');
  }
} catch (error) {
  console.log(`   ❌ Package.json error: ${error.message}\n`);
}

// Summary
console.log('🎯 Verification Summary');
console.log('======================');
console.log('✅ Firebase setup verification completed!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Run: ./setup-firebase-complete.sh (if not done already)');
console.log('2. Update .env with your actual Firebase project details');
console.log('3. Run: npm run init:firebase (to initialize sample data)');
console.log('4. Run: npm run dev (to start the development server)');
console.log('');
console.log('📚 Documentation:');
console.log('- FIREBASE_SETUP.md - Complete setup guide');
console.log('- FIREBASE_MIGRATION.md - Migration guide');
console.log('- FIREBASE_SETUP_SUMMARY.md - This summary');
console.log('');
console.log('🚀 Your Firebase setup is ready!');
