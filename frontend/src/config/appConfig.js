// Environment configuration
const config = {
  // API Configuration - Production URL only
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://grocery-store-backend-rouge.vercel.app/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Grocery Store',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  
  // Debug Configuration
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.MODE === 'development',
  
  // Firebase Configuration (if needed)
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: '/auth',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    REQUESTS: '/requests',
    CONFIG: '/config',
  },
};

// Log configuration in development
if (config.DEBUG) {
  console.log('🚀 App Configuration:', {
    API_BASE_URL: config.API_BASE_URL,
    APP_NAME: config.APP_NAME,
    ENVIRONMENT: config.ENVIRONMENT,
    DEBUG: config.DEBUG,
  });
}

export default config;
