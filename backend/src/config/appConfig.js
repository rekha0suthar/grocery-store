/**
 * Application Configuration
 * Centralized configuration management
 * Supports multiple environments and customizations
 */
export class AppConfig {
  constructor() {
    this.config = {
      // Server Configuration
      server: {
        port: process.env.PORT || 3001,
        host: process.env.HOST || 'localhost',
        environment: process.env.NODE_ENV || 'development',
        cors: {
          origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
          credentials: true
        }
      },

      // Database Configuration
      database: {
        type: process.env.DB_TYPE || 'mongodb',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 27017,
        name: process.env.DB_NAME || 'app_database',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        url: process.env.DB_URL || null,
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        }
      },

      // Authentication Configuration
      auth: {
        provider: process.env.AUTH_PROVIDER || 'jwt', // jwt, session, oauth
        jwt: {
          secret: process.env.JWT_SECRET || 'your-secret-key',
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          algorithm: process.env.JWT_ALGORITHM || 'HS256'
        },
        session: {
          secret: process.env.SESSION_SECRET || 'your-session-secret',
          maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
          secure: process.env.SESSION_SECURE === 'true',
          httpOnly: process.env.SESSION_HTTP_ONLY !== 'false'
        },
        oauth: {
          provider: process.env.OAUTH_PROVIDER || 'google',
          clientId: process.env.OAUTH_CLIENT_ID || '',
          clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
          redirectUri: process.env.OAUTH_REDIRECT_URI || '',
          scope: process.env.OAUTH_SCOPE || 'openid email profile'
        }
      },

      // Rate Limiting
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
      },

      // Logging
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
        enableFile: process.env.LOG_ENABLE_FILE === 'true',
        filePath: process.env.LOG_FILE_PATH || './logs/app.log'
      },

      // Security
      security: {
        enableHelmet: process.env.SECURITY_ENABLE_HELMET !== 'false',
        enableCORS: process.env.SECURITY_ENABLE_CORS !== 'false',
        enableRateLimit: process.env.SECURITY_ENABLE_RATE_LIMIT !== 'false',
        trustProxy: process.env.SECURITY_TRUST_PROXY === 'true'
      },

      // Features
      features: {
        authentication: process.env.FEATURE_AUTH !== 'false',
        fileUpload: process.env.FEATURE_FILE_UPLOAD === 'true',
        realTime: process.env.FEATURE_REAL_TIME === 'true',
        caching: process.env.FEATURE_CACHING === 'true',
        monitoring: process.env.FEATURE_MONITORING === 'true'
      }
    };
  }

  /**
   * Get configuration value
   * @param {string} path - Dot notation path (e.g., 'server.port')
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Configuration value
   */
  get(path, defaultValue = null) {
    return this.getNestedValue(this.config, path, defaultValue);
  }

  /**
   * Set configuration value
   * @param {string} path - Dot notation path
   * @param {*} value - Value to set
   */
  set(path, value) {
    this.setNestedValue(this.config, path, value);
  }

  /**
   * Get all configuration
   * @returns {Object} Complete configuration object
   */
  getAll() {
    return this.config;
  }

  /**
   * Check if feature is enabled
   * @param {string} feature - Feature name
   * @returns {boolean} True if feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.get(`features.${feature}`, false);
  }

  /**
   * Get database connection URL
   * @returns {string} Database connection URL
   */
  getDatabaseUrl() {
    const db = this.config.database;
    
    if (db.url) {
      return db.url;
    }

    let connectionUrl = '';
    
    switch (db.type) {
      case 'mongodb':
        if (db.user && db.password) {
          connectionUrl = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`;
        } else {
          connectionUrl = `mongodb://${db.host}:${db.port}/${db.name}`;
        }
        break;
        
      case 'postgresql':
        connectionUrl = `postgresql://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`;
        break;
        
      case 'mysql':
        connectionUrl = `mysql://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`;
        break;
        
      default:
        throw new Error(`Unsupported database type: ${db.type}`);
    }
    
    return connectionUrl;
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @param {*} defaultValue - Default value
   * @returns {*} Found value or default
   */
  getNestedValue(obj, path, defaultValue) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  /**
   * Set nested value in object using dot notation
   * @param {Object} obj - Object to modify
   * @param {string} path - Dot notation path
   * @param {*} value - Value to set
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }
}

// Create singleton instance
export const appConfig = new AppConfig();
