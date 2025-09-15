// Mock configuration for testing
const config = {
  API_BASE_URL: 'http://localhost:3000/api',
  APP_NAME: 'Grocery Store Test',
  VERSION: '1.0.0',
  ENVIRONMENT: 'test',
  DEBUG: false,
  FIREBASE: {},
  ENDPOINTS: {},
};

export default config;

// Test that the config is properly exported
test('appConfig exports a valid configuration object', () => {
  expect(config).toBeDefined();
  expect(config.API_BASE_URL).toBe('http://localhost:3000/api');
  expect(config.APP_NAME).toBe('Grocery Store Test');
  expect(config.ENVIRONMENT).toBe('test');
});
