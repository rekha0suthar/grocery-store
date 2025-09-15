module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/architecture/**/*.test.js'],
  collectCoverage: false,
  verbose: true
};
