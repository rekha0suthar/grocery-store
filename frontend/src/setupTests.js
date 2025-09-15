import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (compatible; Test)',
    clipboard: {
      writeText: jest.fn(),
      readText: jest.fn(),
    },
  },
  writable: true,
});

// Mock document
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {},
  },
  writable: true,
});

// Mock HTMLElement
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

// Mock import.meta for Vite
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api',
      VITE_APP_NAME: 'Grocery Store Test',
      VITE_DEBUG: 'false',
      MODE: 'test',
      VITE_FIREBASE_API_KEY: 'test-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test-bucket',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: 'test-app-id',
    },
  },
};

// Fix JSDOM HTMLCollection issue by mocking the problematic property
Object.defineProperty(window, '_goober', {
  value: undefined,
  writable: true,
  configurable: true,
});

// Additional JSDOM fixes
if (typeof window.HTMLCollection !== 'undefined') {
  const originalHTMLCollection = window.HTMLCollection;
  Object.defineProperty(window, 'HTMLCollection', {
    value: originalHTMLCollection,
    writable: true,
    configurable: true,
  });
}
