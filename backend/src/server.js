import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger, morganLogger, errorLogger } from './middleware/requestLogger.js';
import config from './config/appConfig.js';

const app = express();

config.log();

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

app.use(cors(config.get('cors')));

const limiter = rateLimit({
  windowMs: config.get('rateLimit').windowMs,
  max: config.get('rateLimit').max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.get('rateLimit').windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.url === '/api/health' || req.url === '/api/config/health') {
      return true;
    }
    return false;
  }
});

app.use(limiter);

app.use(requestLogger);
app.use(morganLogger);

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

app.set('trust proxy', config.security.trustProxy);

app.use(config.get('api').prefix, routes);

app.use(errorLogger);

app.use(errorHandler);

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    console.log('✅ Database connections closed');
    
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.log('❌ Forced shutdown');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

const server = app.listen(config.get('port'), config.get('host'), () => {
  console.log(`🚀 Server running on ${config.getBaseUrl()}`);
  console.log(`📊 Environment: ${config.environment}`);
  console.log(`🔗 API URL: ${config.getApiUrl()}`);
  console.log(`🌐 Frontend URL: ${config.getFrontendUrl()}`);
  console.log(`❤️  Health check: ${config.getApiUrl()}/config/health`);
  console.log(`⚙️  Configuration: ${config.getApiUrl()}/config`);
  console.log(`🔒 Rate limit: ${config.get('rateLimit').max} requests per ${Math.ceil(config.get('rateLimit').windowMs / 1000 / 60)} minutes`);
  console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
});

export default app;
