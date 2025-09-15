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

// Mock localStorage with a proper implementation
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((k) => store[k] || null),
    setItem: jest.fn((k, v) => { store[k] = String(v); }),
    removeItem: jest.fn((k) => { delete store[k]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', { 
  value: localStorageMock, 
  writable: true 
});

Object.defineProperty(window, 'sessionStorage', { 
  value: localStorageMock, 
  writable: true 
});

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

// Mock window.history
window.history = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

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

// Mock window.getComputedStyle
window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(),
}));

// Mock HTMLElement prototype methods (only if they don't exist)
if (typeof HTMLElement !== 'undefined') {
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = jest.fn();
  }
  if (!HTMLElement.prototype.focus) {
    HTMLElement.prototype.focus = jest.fn();
  }
  if (!HTMLElement.prototype.blur) {
    HTMLElement.prototype.blur = jest.fn();
  }
  if (!HTMLElement.prototype.click) {
    HTMLElement.prototype.click = jest.fn();
  }
  if (!HTMLElement.prototype.setAttribute) {
    HTMLElement.prototype.setAttribute = jest.fn();
  }
  if (!HTMLElement.prototype.getAttribute) {
    HTMLElement.prototype.getAttribute = jest.fn();
  }
  if (!HTMLElement.prototype.removeAttribute) {
    HTMLElement.prototype.removeAttribute = jest.fn();
  }
}

// Mock HTMLCollection prototype
if (typeof HTMLCollection !== 'undefined') {
  HTMLCollection.prototype._update = jest.fn();
}

// Mock window._goober for styling libraries
window._goober = {
  _version: '1.0.0',
};

// Mock fetch if not available
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  );
}

// Mock URL constructor
if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      this.href = url;
      this.origin = 'http://localhost:3000';
      this.protocol = 'http:';
      this.host = 'localhost:3000';
      this.hostname = 'localhost';
      this.port = '3000';
      this.pathname = '/';
      this.search = '';
      this.hash = '';
    }
  };
}

// Mock crypto for libraries that use it
if (!globalThis.crypto) {
  globalThis.crypto = { 
    getRandomValues: (arr) => require('crypto').randomFillSync(arr) 
  };
}

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

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
