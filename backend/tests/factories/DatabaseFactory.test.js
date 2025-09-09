import { DatabaseFactory } from '../../src/factories/DatabaseFactory.js';
import { FirebaseAdapter } from '../../src/adapters/FirebaseAdapter.js';

describe('DatabaseFactory - Factory Pattern', () => {
  describe('Database Adapter Creation', () => {
    test('creates Firebase adapter for firebase type', () => {
      const adapter = DatabaseFactory.createAdapter('firebase');
      expect(adapter).toBeInstanceOf(FirebaseAdapter);
    });

    test('creates Firebase adapter for FIREBASE type (case insensitive)', () => {
      const adapter = DatabaseFactory.createAdapter('FIREBASE');
      expect(adapter).toBeInstanceOf(FirebaseAdapter);
    });

    test('creates Firebase adapter for Firebase type (mixed case)', () => {
      const adapter = DatabaseFactory.createAdapter('Firebase');
      expect(adapter).toBeInstanceOf(FirebaseAdapter);
    });

    test('creates Firebase adapter for firestore type', () => {
      const adapter = DatabaseFactory.createAdapter('firestore');
      expect(adapter).toBeInstanceOf(FirebaseAdapter);
    });

    test('uses firebase as default when no type provided', () => {
      const adapter = DatabaseFactory.createAdapter();
      expect(adapter).toBeInstanceOf(FirebaseAdapter);
    });
  });

  describe('Error Handling', () => {
    test('throws error for unsupported database type', () => {
      expect(() => {
        DatabaseFactory.createAdapter('mysql');
      }).toThrow('Unsupported database type: mysql. Only \'firebase\' is supported.');
    });

    test('throws error for null database type', () => {
      expect(() => {
        DatabaseFactory.createAdapter(null);
      }).toThrow('Cannot read properties of null (reading \'toLowerCase\')');
    });

    test('throws error for undefined database type', () => {
      expect(() => {
        DatabaseFactory.createAdapter(undefined);
      }).toThrow('Cannot read properties of undefined (reading \'toLowerCase\')');
    });

    test('throws error for empty string database type', () => {
      expect(() => {
        DatabaseFactory.createAdapter('');
      }).toThrow('Unsupported database type: . Only \'firebase\' is supported.');
    });
  });

  describe('Adapter Interface', () => {
    test('created adapter implements required methods', () => {
      const adapter = DatabaseFactory.createAdapter('firebase');
      
      expect(typeof adapter.connect).toBe('function');
      expect(typeof adapter.disconnect).toBe('function');
      expect(typeof adapter.findById).toBe('function');
      expect(typeof adapter.findAll).toBe('function');
      expect(typeof adapter.create).toBe('function');
      expect(typeof adapter.update).toBe('function');
      expect(typeof adapter.delete).toBe('function');
      expect(typeof adapter.count).toBe('function');
    });
  });

  describe('Factory Method', () => {
    test('createAdapter is a static method', () => {
      expect(typeof DatabaseFactory.createAdapter).toBe('function');
    });
  });
});
