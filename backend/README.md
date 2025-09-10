# Grocery Store Backend - Firebase

Clean Architecture backend with Firebase Firestore database.

## 🚀 Quick Start

### 1. Setup Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new project or select existing
firebase projects:list
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Firebase project details
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Initialize Database
```bash
npm run init:firebase
```

### 5. Start Server
```bash
npm run dev
```

## 🔧 Database Switching

To switch to another database (e.g., PostgreSQL):

1. **Add new adapter** in `src/adapters/`
2. **Update factory** in `src/factories/DatabaseFactory.js`
3. **Change** `DATABASE_TYPE` in `.env`

Example:
```javascript
// src/factories/DatabaseFactory.js
case 'postgresql':
  return new PostgreSQLAdapter();
```

## 📁 Project Structure

```
src/
├── config/          # Configuration
├── controllers/     # API Controllers
├── entities/        # Business Entities
├── interfaces/      # Interfaces
├── repositories/    # Data Access Layer
├── middleware/      # Express Middleware
├── routes/          # API Routes
└── server.js        # Main Server
```

## 🎯 Clean Architecture Benefits

- **Database Agnostic**: Easy to switch databases
- **Testable**: Clear separation of concerns
- **Maintainable**: SOLID principles
- **Extensible**: Open/Closed principle
# CD Pipeline Test - Wed Sep 10 06:19:30 PM IST 2025
# CD Backend Workflow - Updated Wed Sep 10 06:49:08 PM IST 2025
