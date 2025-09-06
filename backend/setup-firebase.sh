#!/bin/bash

echo "🔥 Setting up Firebase for Grocery Store Backend"
echo "================================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase:"
    firebase login
fi

echo "📋 Available Firebase projects:"
firebase projects:list

echo ""
echo "🚀 Next steps:"
echo "1. Create a new Firebase project or select existing one"
echo "2. Enable Firestore Database"
echo "3. Enable Authentication"
echo "4. Copy your project configuration to .env file"
echo ""
echo "📝 Example .env configuration:"
echo "DATABASE_TYPE=firebase"
echo "FIREBASE_PROJECT_ID=your-project-id"
echo "FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com"
echo "FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com"
echo ""
echo "🔧 To initialize Firestore with sample data, run:"
echo "node scripts/init-firestore.js"
