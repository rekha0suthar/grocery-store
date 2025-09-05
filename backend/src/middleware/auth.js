import { appConfig } from '../config/appConfig.js';

/**
 * Flexible Authentication Middleware
 * Supports multiple authentication providers
 */
export class AuthMiddleware {
  constructor(authProvider) {
    this.authProvider = authProvider;
  }

  /**
   * Authentication middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  authenticate = async (req, res, next) => {
    try {
      const authProvider = appConfig.get('auth.provider', 'jwt');
      
      let token = null;
      
      // Extract token based on authentication provider
      switch (authProvider) {
        case 'jwt':
          token = this.extractJWTToken(req);
          break;
        case 'session':
          token = this.extractSessionToken(req);
          break;
        case 'oauth':
          token = this.extractOAuthToken(req);
          break;
        default:
          return res.status(401).json({
            success: false,
            error: 'Unsupported authentication provider'
          });
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No authentication token provided'
        });
      }

      // Verify token using the configured provider
      const user = await this.authProvider.getUserFromToken(token);
      req.user = user;
      req.token = token;
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  };

  /**
   * Authorization middleware
   * @param {...string} roles - Allowed roles
   * @returns {Function} Middleware function
   */
  authorize = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  };

  /**
   * Optional authentication middleware
   * Sets user if token is valid, but doesn't require it
   */
  optionalAuth = async (req, res, next) => {
    try {
      const authProvider = appConfig.get('auth.provider', 'jwt');
      
      let token = null;
      
      switch (authProvider) {
        case 'jwt':
          token = this.extractJWTToken(req);
          break;
        case 'session':
          token = this.extractSessionToken(req);
          break;
        case 'oauth':
          token = this.extractOAuthToken(req);
          break;
      }

      if (token) {
        const user = await this.authProvider.getUserFromToken(token);
        req.user = user;
        req.token = token;
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };

  /**
   * Extract JWT token from request
   * @param {Object} req - Express request object
   * @returns {string|null} JWT token
   */
  extractJWTToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  /**
   * Extract session token from request
   * @param {Object} req - Express request object
   * @returns {string|null} Session token
   */
  extractSessionToken(req) {
    // Check for session ID in cookies
    if (req.cookies && req.cookies.sessionId) {
      return req.cookies.sessionId;
    }
    
    // Check for session ID in headers
    const sessionHeader = req.headers['x-session-id'];
    if (sessionHeader) {
      return sessionHeader;
    }
    
    return null;
  }

  /**
   * Extract OAuth token from request
   * @param {Object} req - Express request object
   * @returns {string|null} OAuth token
   */
  extractOAuthToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

/**
 * Create authentication middleware instance
 * @param {Object} authProvider - Authentication provider instance
 * @returns {AuthMiddleware} Authentication middleware instance
 */
export const createAuthMiddleware = (authProvider) => {
  return new AuthMiddleware(authProvider);
};
