/**
 * Frontend Application Configuration
 * Device-independent configuration management
 */
export class AppConfig {
  constructor() {
    this.config = {
      // API Configuration
      api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
        retries: parseInt(import.meta.env.VITE_API_RETRIES) || 3
      },

      // Authentication Configuration
      auth: {
        provider: import.meta.env.VITE_AUTH_PROVIDER || 'jwt', // jwt, session, oauth
        tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken',
        refreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'refreshToken',
        sessionKey: import.meta.env.VITE_AUTH_SESSION_KEY || 'sessionId',
        autoRefresh: import.meta.env.VITE_AUTH_AUTO_REFRESH !== 'false',
        refreshThreshold: parseInt(import.meta.env.VITE_AUTH_REFRESH_THRESHOLD) || 300000 // 5 minutes
      },

      // Device Configuration
      device: {
        type: this.detectDeviceType(),
        isMobile: this.isMobile(),
        isTablet: this.isTablet(),
        isDesktop: this.isDesktop(),
        touchSupport: this.hasTouchSupport(),
        orientation: this.getOrientation()
      },

      // UI Configuration
      ui: {
        theme: import.meta.env.VITE_UI_THEME || 'light', // light, dark, auto
        language: import.meta.env.VITE_UI_LANGUAGE || 'en',
        animations: import.meta.env.VITE_UI_ANIMATIONS !== 'false',
        compactMode: import.meta.env.VITE_UI_COMPACT_MODE === 'true',
        sidebarCollapsed: import.meta.env.VITE_UI_SIDEBAR_COLLAPSED === 'true'
      },

      // Features
      features: {
        authentication: import.meta.env.VITE_FEATURE_AUTH !== 'false',
        realTime: import.meta.env.VITE_FEATURE_REAL_TIME === 'true',
        notifications: import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false',
        offline: import.meta.env.VITE_FEATURE_OFFLINE === 'true',
        pwa: import.meta.env.VITE_FEATURE_PWA === 'true',
        analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true'
      },

      // Performance
      performance: {
        enableLazyLoading: import.meta.env.VITE_PERF_LAZY_LOADING !== 'false',
        enableCodeSplitting: import.meta.env.VITE_PERF_CODE_SPLITTING !== 'false',
        enableCaching: import.meta.env.VITE_PERF_CACHING !== 'false',
        cacheTimeout: parseInt(import.meta.env.VITE_PERF_CACHE_TIMEOUT) || 300000 // 5 minutes
      },

      // Development
      development: {
        enableDevTools: import.meta.env.DEV,
        enableHotReload: import.meta.env.DEV,
        enableSourceMaps: import.meta.env.DEV,
        enableConsoleLogs: import.meta.env.DEV
      }
    };
  }

  /**
   * Get configuration value
   * @param {string} path - Dot notation path
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
   * Check if device is mobile
   * @returns {boolean} True if mobile device
   */
  isMobile() {
    return this.config.device.isMobile;
  }

  /**
   * Check if device is tablet
   * @returns {boolean} True if tablet device
   */
  isTablet() {
    return this.config.device.isTablet;
  }

  /**
   * Check if device is desktop
   * @returns {boolean} True if desktop device
   */
  isDesktop() {
    return this.config.device.isDesktop;
  }

  /**
   * Detect device type
   * @returns {string} Device type (mobile, tablet, desktop)
   */
  detectDeviceType() {
    // const userAgent = navigator.userAgent;
    const width = window.innerWidth;
    
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Check if device has touch support
   * @returns {boolean} True if touch support available
   */
  hasTouchSupport() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get device orientation
   * @returns {string} Device orientation (portrait, landscape)
   */
  getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Get responsive breakpoint
   * @returns {string} Current breakpoint
   */
  getBreakpoint() {
    const width = window.innerWidth;
    
    if (width < 640) return 'sm';
    if (width < 768) return 'md';
    if (width < 1024) return 'lg';
    if (width < 1280) return 'xl';
    return '2xl';
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

  /**
   * Update device configuration on resize
   */
  updateDeviceConfig() {
    this.config.device.type = this.detectDeviceType();
    this.config.device.isMobile = this.isMobile();
    this.config.device.isTablet = this.isTablet();
    this.config.device.isDesktop = this.isDesktop();
    this.config.device.orientation = this.getOrientation();
  }
}

export const appConfig = new AppConfig();

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    appConfig.updateDeviceConfig();
  });
}
