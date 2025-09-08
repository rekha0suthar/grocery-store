import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestLogger, morganLogger, errorLogger } from './middleware/requestLogger.js';
import config from './config/appConfig.js';

const app = express();

// Log configuration on startup
config.log();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.getApiUrl()],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.url === '/api/health' || req.url === '/api/config/health') {
      return true;
    }
    return false;
  }
});

app.use(limiter);

// Request logging middleware
app.use(requestLogger);
app.use(morganLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: config.upload.maxFileSize,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON payload'
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', config.security.trustProxy);

// Routes
app.use(config.api.prefix, routes);

// Error handling middleware
app.use(errorLogger);
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    // Close database connections
    await pool.end();
    console.log('✅ Database connections closed');
    
    // Close server
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('❌ Forced shutdown');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
const server = app.listen(config.port, config.host, () => {
  console.log(`🚀 Server running on ${config.getBaseUrl()}`);
  console.log(`📊 Environment: ${config.environment}`);
  console.log(`🔗 API URL: ${config.getApiUrl()}`);
  console.log(`🌐 Frontend URL: ${config.getFrontendUrl()}`);
  console.log(`❤️  Health check: ${config.getApiUrl()}/config/health`);
  console.log(`⚙️  Configuration: ${config.getApiUrl()}/config`);
  console.log(`🔒 Rate limit: ${config.rateLimit.max} requests per ${Math.ceil(config.rateLimit.windowMs / 1000 / 60)} minutes`);
  console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
});

export default app;
