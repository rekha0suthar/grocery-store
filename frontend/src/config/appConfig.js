// Safe env reader that doesn't parse `import.meta` in non-ESM/Jest contexts
function readViteEnv() {
  try {
    // Using a Function prevents the parser from seeing `import.meta` as syntax.
    // In Vite/ESM it returns import.meta.env; in Jest/Node it throws and we return {}.
    // eslint-disable-next-line no-new-func
    const fn = new Function('return (typeof import !== "undefined" && import.meta && import.meta.env) ? import.meta.env : {}');
    return fn() || {};
  } catch {
    return {};
  }
}

const viteEnv = readViteEnv();
const nodeEnv = typeof process !== 'undefined' && process.env ? process.env : {};

// Helper to resolve with precedence: Vite → Node → default
const pick = (key, fallback = '') =>
  (viteEnv[key] ?? nodeEnv[key] ?? fallback);

const config = Object.freeze({
  NODE_ENV: pick('NODE_ENV', 'development'),
  API_BASE_URL: pick('VITE_API_BASE_URL', 'https://grocery-store-backend-rouge.vercel.app/api'),
  CDN_BASE_URL: pick('VITE_CDN_BASE_URL', ''),
  FEATURE_PAYMENTS: String(pick('VITE_FEATURE_PAYMENTS', 'true')) === 'true',
  SENTRY_DSN: pick('VITE_SENTRY_DSN', ''),
  BUILD_SHA: pick('VITE_BUILD_SHA', ''),
  APP_NAME: pick('VITE_APP_NAME', 'Grocery Store'),
  VERSION: '1.0.0',
  ENVIRONMENT: pick('MODE', 'development'),
  DEBUG: pick('VITE_DEBUG', 'false') === 'true' || pick('MODE', 'development') === 'development',
  
  // Firebase Configuration (if needed)
  FIREBASE: {
    API_KEY: pick('VITE_FIREBASE_API_KEY', ''),
    AUTH_DOMAIN: pick('VITE_FIREBASE_AUTH_DOMAIN', ''),
    PROJECT_ID: pick('VITE_FIREBASE_PROJECT_ID', ''),
    STORAGE_BUCKET: pick('VITE_FIREBASE_STORAGE_BUCKET', ''),
    MESSAGING_SENDER_ID: pick('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
    APP_ID: pick('VITE_FIREBASE_APP_ID', ''),
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: '/auth',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    REQUESTS: '/requests',
    CONFIG: '/config',
  },
});

export default config;
