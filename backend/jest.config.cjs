module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@grocery-store/core/adapters$': '<rootDir>/../packages/core/adapters/DefaultClock.js',
    '^@grocery-store/core/(.*)$': '<rootDir>/../packages/core/$1',
    '^../config/firebase\\.js$': '<rootDir>/tests/__mocks__/firebase.js',
    '^../../config/firebase\\.js$': '<rootDir>/tests/__mocks__/firebase.js',
    '^src/config/firebase\\.js$': '<rootDir>/tests/__mocks__/firebase.js'
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/firebase.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.js']
};
