import { FirebaseAdapter } from '../adapters/FirebaseAdapter.js';

export class DatabaseFactory {
  static createAdapter(databaseType = 'firebase') {
    switch (databaseType.toLowerCase()) {
      case 'firebase':
      case 'firestore':
        return new FirebaseAdapter();
      
      default:
        throw new Error(`Unsupported database type: ${databaseType}. Only 'firebase' is supported.`);
    }
  }
}
