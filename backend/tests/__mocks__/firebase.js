// Mock Firebase Admin SDK for testing
const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ exists: false })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve())
    })),
    add: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
    where: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ 
          forEach: jest.fn(),
          size: 0,
          empty: true,
          docs: []
        }))
      })),
      get: jest.fn(() => Promise.resolve({ 
        forEach: jest.fn(),
        size: 0,
        empty: true,
        docs: []
      }))
    })),
    limit: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ 
        forEach: jest.fn(),
        size: 0,
        empty: true,
        docs: []
      }))
    })),
    get: jest.fn(() => Promise.resolve({ 
      forEach: jest.fn(),
      size: 0,
      empty: true,
      docs: []
    }))
  }))
};

const mockAuth = {
  createUser: jest.fn(() => Promise.resolve({ uid: 'mock-uid' })),
  getUser: jest.fn(() => Promise.resolve({ uid: 'mock-uid' })),
  updateUser: jest.fn(() => Promise.resolve({ uid: 'mock-uid' })),
  deleteUser: jest.fn(() => Promise.resolve()),
  verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'mock-uid' }))
};

const mockStorage = {
  bucket: jest.fn(() => ({
    file: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve()),
      download: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve())
    }))
  }))
};

const mockMessaging = {
  send: jest.fn(() => Promise.resolve({ messageId: 'mock-message-id' }))
};

const mockCredential = {
  cert: jest.fn(() => ({ type: 'service_account' }))
};

const mockApp = {
  firestore: () => mockFirestore,
  auth: () => mockAuth,
  storage: () => mockStorage,
  messaging: () => mockMessaging
};

module.exports = {
  initializeApp: jest.fn(() => mockApp),
  app: jest.fn(() => mockApp),
  credential: mockCredential,
  apps: []
};
