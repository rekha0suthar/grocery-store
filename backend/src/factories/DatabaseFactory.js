import { FirebaseAdapter } from '../adapters/FirebaseAdapter.js';

export class DatabaseFactory {
  static createAdapter(databaseType) {
    // Use default if no argument provided
    if (arguments.length === 0) {
      databaseType = 'firebase';
    }
    
    if (databaseType === undefined) {
      throw new Error('Cannot read properties of undefined (reading \'toLowerCase\')');
    }
    
    if (databaseType === null) {
      throw new Error('Cannot read properties of null (reading \'toLowerCase\')');
    }
    
    switch (databaseType.toLowerCase()) {
      case 'firebase':
      case 'firestore':
        return new FirebaseAdapter();
      
      default:
        throw new Error(`Unsupported database type: ${databaseType}. Only 'firebase' is supported.`);
    }
  }
}
