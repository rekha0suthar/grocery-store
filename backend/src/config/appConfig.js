import dotenv from 'dotenv';

dotenv.config();

class AppConfig {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.loadConfig();
  }

  loadConfig() {
    this.config = {
      environment: this.environment,
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost',
      
      database: {
        type: process.env.DATABASE_TYPE || 'firebase',
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      },

      jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      },

      cors: {
        origins: process.env.CORS_ORIGINS 
          ? process.env.CORS_ORIGINS.split(',')
          : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173']
      },

      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
      },

      api: {
        version: process.env.API_VERSION || 'v1',
        prefix: process.env.API_PREFIX || '/api'
      },

      frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000'
      }
    };
  }

  get(key) {
    return key ? this.config[key] : this.config;
  }

  getDatabaseType() {
    return this.config.database.type;
  }

  log() {
    console.log('📋 Configuration loaded:');
    console.log(`   Environment: ${this.environment}`);
    console.log(`   Port: ${this.config.port}`);
    console.log(`   Host: ${this.config.host}`);
    console.log(`   Database: ${this.config.database.type}`);
    console.log(`   API Prefix: ${this.config.api.prefix}`);
  }

  getBaseUrl() {
    return `http://${this.config.host}:${this.config.port}`;
  }

  getApiUrl() {
    return `${this.getBaseUrl()}${this.config.api.prefix}`;
  }

  getFrontendUrl() {
    return this.config.frontend.url;
  }

  // Add missing properties
  get upload() {
    return {
      maxFileSize: process.env.UPLOAD_MAX_FILE_SIZE || '10mb'
    };
  }

  get security() {
    return {
      trustProxy: process.env.TRUST_PROXY === 'true' || false
    };
  }

  // Add missing database properties
  get database() {
    return {
      ...this.config.database,
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      name: process.env.DATABASE_NAME || 'grocery_store'
    };
  }
}

const appConfig = new AppConfig();
export default appConfig;
