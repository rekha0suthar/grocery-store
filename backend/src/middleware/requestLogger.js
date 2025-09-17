import morgan from 'morgan';

morgan.token('requestId', (req) => {
  return req.id || 'unknown';
});

morgan.token('responseTime', (req, res) => {
  if (!req._startTime || !res._startTime) {
    return '0ms';
  }
  const ms = res._startTime - req._startTime;
  return `${ms}ms`;
});

const devFormat = ':method :url :status :responseTime ms - :res[content-length] - :requestId';

const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :responseTime';

export const requestLogger = (req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);

  req._startTime = Date.now();
  res._startTime = Date.now();

  next();
};

export const morganLogger = morgan(
  process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  {
    skip: (req, res) => {
      // Skip logging for health checks and static assets
      return req.url === '/health' || req.url.startsWith('/static');
    }
  }
);

export const errorLogger = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
  next(err);
};
