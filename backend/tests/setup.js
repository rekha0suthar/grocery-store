process.env.NODE_ENV = 'test';

global.console = {
  ...console,
  warn: () => {},
  error: () => {},
};
