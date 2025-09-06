import morgan from 'morgan';

// Custom token for request ID
morgan.token('requestId', (req) => {
  return req.id || 'unknown';
});

// Custom token for response time
morgan.token('responseTime', (req, res) => {
  if (!req._startTime || !res._startTime) {
    return '0ms';
  }
  const ms = res._startTime - req._startTime;
  return `${ms}ms`;
});

// Development format (more detailed)
const devFormat = ':method :url :status :response-time ms - :res[content-length] - :requestId';

// Production format (less verbose)
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :responseTime';

export const requestLogger = (req, res, next) => {
  // Add request ID for tracking
  req.id = Math.random().toString(36).substr(2, 9);

  // Add start time for response time calculation
  req._startTime = Date.now();
  res._startTime = Date.now();

  next();
};

export const morganLogger = morgan(
  process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  {
    skip: (req, res) => {
      // Skip logging for health checks in production
      if (process.env.NODE_ENV === 'production' && req.url === '/api/health') {
        return true;
      }
      return false;
    }
  }
);

export const errorLogger = (err, req, res, next) => {
  console.error(`[${req.id}] Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next(err);
};
