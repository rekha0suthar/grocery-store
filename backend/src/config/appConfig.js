import dotenv from 'dotenv';

dotenv.config();

class AppConfig {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 3000;
    this.host = process.env.HOST || 'localhost';
    
    // Database configuration
    this.database = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'grocery_store',
      user: process.env.DB_USER || 'grocery_user',
      password: process.env.DB_PASSWORD || 'grocery_password',
      ssl: process.env.DB_SSL === 'true',
      max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000
    };

    // JWT configuration
    this.jwt = {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };

    // CORS configuration
    this.cors = {
      origin: this.getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'X-API-Key',
        'X-Client-Version'
      ]
    };

    // Rate limiting configuration
    this.rateLimit = {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true'
    };

    // File upload configuration
    this.upload = {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ],
      uploadPath: process.env.UPLOAD_PATH || './uploads'
    };

    // Email configuration
    this.email = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM || 'noreply@grocerystore.com'
    };

    // Redis configuration (for caching and sessions)
    this.redis = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0
    };

    // Logging configuration
    this.logging = {
      level: process.env.LOG_LEVEL || (this.environment === 'production' ? 'info' : 'debug'),
      format: process.env.LOG_FORMAT || 'combined',
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE === 'true',
      logFile: process.env.LOG_FILE_PATH || './logs/app.log'
    };

    // Security configuration
    this.security = {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
      sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
      cookieSecure: process.env.COOKIE_SECURE === 'true',
      cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
      trustProxy: process.env.TRUST_PROXY === 'true'
    };

    // API configuration
    this.api = {
      version: process.env.API_VERSION || 'v1',
      prefix: process.env.API_PREFIX || '/api',
      timeout: parseInt(process.env.API_TIMEOUT) || 30000,
      enableSwagger: process.env.ENABLE_SWAGGER !== 'false'
    };

    // Frontend configuration
    this.frontend = {
      url: this.getFrontendUrl(),
      enableCORS: process.env.FRONTEND_CORS !== 'false'
    };
  }

  getCorsOrigins() {
    const origins = process.env.CORS_ORIGINS;
    
    if (origins) {
      return origins.split(',').map(origin => origin.trim());
    }

    // Default origins based on environment
    switch (this.environment) {
      case 'production':
        return [
          'https://grocerystore.com',
          'https://www.grocerystore.com',
          'https://app.grocerystore.com'
        ];
      case 'staging':
        return [
          'https://staging.grocerystore.com',
          'https://staging-app.grocerystore.com'
        ];
      case 'development':
      default:
        return [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173', // Vite default
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:5173'
        ];
    }
  }

  getFrontendUrl() {
    // Priority order for frontend URL detection
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL;
    }

    // Derive from environment
    switch (this.environment) {
      case 'production':
        return 'https://grocerystore.com';
      case 'staging':
        return 'https://staging.grocerystore.com';
      case 'development':
      default:
        return 'http://localhost:3000';
    }
  }

  getBaseUrl() {
    const protocol = this.environment === 'production' ? 'https' : 'http';
    const host = this.host === '0.0.0.0' ? 'localhost' : this.host;
    return `${protocol}://${host}:${this.port}`;
  }

  getApiUrl() {
    return `${this.getBaseUrl()}${this.api.prefix}`;
  }

  getDatabaseUrl() {
    const { host, port, name, user, password, ssl } = this.database;
    const sslParam = ssl ? '?sslmode=require' : '';
    return `postgresql://${user}:${password}@${host}:${port}/${name}${sslParam}`;
  }

  getRedisUrl() {
    const { host, port, password, db } = this.redis;
    const auth = password ? `:${password}@` : '';
    return `redis://${auth}${host}:${port}/${db}`;
  }

  isDevelopment() {
    return this.environment === 'development';
  }

  isProduction() {
    return this.environment === 'production';
  }

  isStaging() {
    return this.environment === 'staging';
  }

  isTest() {
    return this.environment === 'test';
  }

  // Validation method
  validate() {
    const errors = [];

    // Required environment variables
    if (this.isProduction()) {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
        errors.push('JWT_SECRET must be set in production');
      }
      if (!process.env.DB_PASSWORD) {
        errors.push('DB_PASSWORD must be set in production');
      }
    }

    // Validate database configuration
    if (!this.database.host || !this.database.name || !this.database.user) {
      errors.push('Database configuration is incomplete');
    }

    // Validate JWT configuration
    if (!this.jwt.secret) {
      errors.push('JWT secret is required');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  // Get configuration for frontend
  getFrontendConfig() {
    return {
      apiUrl: this.getApiUrl(),
      environment: this.environment,
      version: this.api.version,
      features: {
        enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
        enablePasswordReset: process.env.ENABLE_PASSWORD_RESET !== 'false',
        enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
        enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true',
        enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
        enableRealTimeNotifications: process.env.ENABLE_REAL_TIME_NOTIFICATIONS === 'true'
      },
      limits: {
        maxFileSize: this.upload.maxFileSize,
        maxProductsPerPage: parseInt(process.env.MAX_PRODUCTS_PER_PAGE) || 50,
        maxCategoriesPerPage: parseInt(process.env.MAX_CATEGORIES_PER_PAGE) || 20
      },
      integrations: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        paypalClientId: process.env.PAYPAL_CLIENT_ID
      }
    };
  }

  // Log configuration (excluding sensitive data)
  log() {
    const safeConfig = {
      environment: this.environment,
      port: this.port,
      host: this.host,
      database: {
        host: this.database.host,
        port: this.database.port,
        name: this.database.name,
        user: this.database.user,
        ssl: this.database.ssl
      },
      cors: {
        origins: this.cors.origin
      },
      rateLimit: this.rateLimit,
      api: this.api,
      frontend: {
        url: this.frontend.url
      },
      logging: this.logging
    };

    console.log('🔧 Application Configuration:');
    console.log(JSON.stringify(safeConfig, null, 2));
  }
}

// Create singleton instance
const config = new AppConfig();

// Validate configuration on startup
try {
  config.validate();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  if (config.isProduction()) {
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing with invalid configuration in non-production environment');
  }
}

export default config;
