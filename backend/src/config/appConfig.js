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
        serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      },

      jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },

      cors: {
        origin: this.getCorsOrigin(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      },

      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000
      },

      api: {
        version: process.env.API_VERSION || 'v1',
        prefix: process.env.API_PREFIX || '/api',
      },

      frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    };
  }

  getCorsOrigin() {
    // If CORS_ORIGINS is set, use it
    if (process.env.CORS_ORIGINS) {
      return process.env.CORS_ORIGINS.split(',');
    }

    // For production, allow all Vercel deployments
    if (this.isProduction()) {
      return (origin, callback) => {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
        
        // Allow any Vercel deployment
        if (origin.includes('vercel.app')) {
          return callback(null, true);
        }
        
        // Allow any grocery-store deployment
        if (origin.includes('grocery-store')) {
          return callback(null, true);
        }
        
        // Allow HTTPS origins (more permissive for production)
        if (origin.startsWith('https://')) {
          return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'), false);
      };
    }

    // Development: allow all localhost origins
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
    ];
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
    console.log(`   CORS: ${this.isProduction() ? 'Dynamic (production)' : 'Static (development)'}`);
    console.log(`   Rate Limit: ${this.config.rateLimit.max} requests per ${Math.ceil(this.config.rateLimit.windowMs / 1000 / 60)} minutes`);
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

  get upload() {
    return {
      maxFileSize: process.env.UPLOAD_MAX_FILE_SIZE || '10mb',
    };
  }

  get security() {
    return {
      trustProxy: process.env.TRUST_PROXY === 'true' || false,
    };
  }

  get database() {
    return {
      ...this.config.database,
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      name: process.env.DATABASE_NAME || 'grocery_store',
    };
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

  getFrontendConfig() {
    return {
      features: {
        registration: true,
        socialLogin: false,
        darkMode: true,
        notifications: true,
        search: true,
        filters: true,
        wishlist: true,
        reviews: true,
      },
      limits: {
        maxFileSize: '10MB',
        maxProductsPerPage: 50,
        maxSearchResults: 100,
        maxCartItems: 50,
        maxWishlistItems: 100,
      },
      ui: {
        theme: 'light',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      },
    };
  }
}

const appConfig = new AppConfig();
export default appConfig;
