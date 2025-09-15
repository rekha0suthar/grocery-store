// src/test/setupTests.js
// This runs AFTER jsdom is ready, so we can safely use window/document

import '@testing-library/jest-dom';

// Some components/libraries expect these browser APIs:
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},            // deprecated but used by some libs
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (!window.scrollTo) {
  window.scrollTo = () => {};
}

if (!window.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock;
}

if (!window.IntersectionObserver) {
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = IntersectionObserverMock;
}

// Safe localStorage/sessionStorage mocks using globalThis
const storage = () => {
  let store = {};
  return {
    getItem: jest.fn((k) => (k in store ? store[k] : null)),
    setItem: jest.fn((k, v) => { store[k] = String(v); }),
    removeItem: jest.fn((k) => { delete store[k]; }),
    clear: jest.fn(() => { store = {}; }),
    key: jest.fn((i) => Object.keys(store)[i] ?? null),
    get length() { return Object.keys(store).length; },
  };
};

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true });
}
if (!globalThis.sessionStorage) {
  Object.defineProperty(globalThis, 'sessionStorage', { value: storage(), configurable: true });
}

// Mock window.location safely - don't try to spy on read-only properties
// Instead, just ensure the location object has the properties we need
if (typeof window !== 'undefined' && window.location) {
  // Don't try to spy on read-only methods, just ensure they exist
  if (!window.location.assign) {
    window.location.assign = jest.fn();
  }
  if (!window.location.replace) {
    window.location.replace = jest.fn();
  }
  if (!window.location.reload) {
    window.location.reload = jest.fn();
  }
}

// Mock window.history safely
if (typeof window !== 'undefined' && window.history) {
  if (!window.history.pushState) {
    window.history.pushState = jest.fn();
  }
  if (!window.history.replaceState) {
    window.history.replaceState = jest.fn();
  }
}

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    userAgent: 'jest-test-agent',
    platform: 'test-platform',
    language: 'en-US',
    languages: ['en-US'],
    cookieEnabled: true,
    onLine: true,
  },
});

// Mock fetch
global.fetch = jest.fn();

// Mock crypto for libraries that need it
if (!globalThis.crypto) {
  globalThis.crypto = { 
    getRandomValues: (arr) => require('crypto').randomFillSync(arr) 
  };
}

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock goober styling library
jest.mock('goober', () => ({
  styled: jest.fn(() => jest.fn()),
  css: jest.fn(),
  glob: jest.fn(),
  keyframes: jest.fn(),
}));

// Mock HTMLCollection.prototype._update for JSDOM compatibility
if (typeof HTMLCollection !== 'undefined' && HTMLCollection.prototype) {
  HTMLCollection.prototype._update = jest.fn();
}

// Mock window._goober for styling library compatibility
if (typeof window !== 'undefined') {
  window._goober = {
    _version: '2.1.0',
  };
}
