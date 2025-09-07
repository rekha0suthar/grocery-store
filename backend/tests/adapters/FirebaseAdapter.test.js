import { FirebaseAdapter } from '../../src/adapters/FirebaseAdapter.js';

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
        limit: jest.fn(() => ({
          get: jest.fn()
        }))
      }))
    }))
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  })),
  storage: jest.fn(() => ({
    bucket: jest.fn()
  })),
  messaging: jest.fn(() => ({
    send: jest.fn()
  })),
  apps: []
}));

describe('FirebaseAdapter - Database Adapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new FirebaseAdapter();
  });

  describe('Basic Functionality', () => {
    test('creates FirebaseAdapter instance', () => {
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(FirebaseAdapter);
    });

    test('has required methods', () => {
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

  describe('Connection Management', () => {
    test('connects successfully', async () => {
      await expect(adapter.connect()).resolves.toBeDefined();
    });

    test('disconnects successfully', async () => {
      await expect(adapter.disconnect()).resolves.toBe(true);
    });
  });
});
