/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.js$': 'babel-jest' },
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'node'],

  // 🔑 Aliases
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/$1',

    // If some tests still import a FakeClock from a utils path, redirect it:
    '^\\.\\./\\.\\./\\.\\./\\.\\./utils/FakeClock(\\.js)?$': '<rootDir>/tests/utils/FakeClock.js',
    '^\\.\\./\\.\\./\\.\\./utils/FakeClock(\\.js)?$': '<rootDir>/tests/utils/FakeClock.js',
    '^\\.\\./\\.\\./utils/FakeClock(\\.js)?$': '<rootDir>/tests/utils/FakeClock.js',
    '^@test/(.*)$': '<rootDir>/tests/$1', // optional convenience
  },

  collectCoverageFrom: [
    'entities/**/*.js',
    'use-cases/**/*.js',
    'services/**/*.js',
    'errors/**/*.js',
    '!**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000
};
