import { IAuthProvider } from '../../interfaces/IAuthProvider.js';

/**
 * Session-based Authentication Provider
 * Implements session-based authentication
 */
export class SessionAuthProvider extends IAuthProvider {
  constructor(options = {}) {
    super();
    this.sessionStore = options.sessionStore || new Map(); // In production, use Redis
    this.sessionExpiry = options.sessionExpiry || 24 * 60 * 60 * 1000; // 24 hours
  }

  async authenticate(credentials) {
    // This should be implemented based on your user repository
    throw new Error('authenticate method must be implemented with your user repository');
  }

  async generateToken(user) {
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.sessionExpiry)
    };

    this.sessionStore.set(sessionId, sessionData);
    
    return {
      sessionId,
      expiresAt: sessionData.expiresAt,
      type: 'Session'
    };
  }

  async verifyToken(sessionId) {
    const sessionData = this.sessionStore.get(sessionId);
    
    if (!sessionData) {
      throw new Error('Invalid session');
    }

    if (new Date() > sessionData.expiresAt) {
      this.sessionStore.delete(sessionId);
      throw new Error('Session expired');
    }

    return sessionData;
  }

  async refreshToken(sessionId) {
    const sessionData = await this.verifyToken(sessionId);
    
    // Extend session expiry
    sessionData.expiresAt = new Date(Date.now() + this.sessionExpiry);
    this.sessionStore.set(sessionId, sessionData);

    return {
      sessionId,
      expiresAt: sessionData.expiresAt,
      type: 'Session'
    };
  }

  async revokeToken(sessionId) {
    return this.sessionStore.delete(sessionId);
  }

  async getUserFromToken(sessionId) {
    const sessionData = await this.verifyToken(sessionId);
    return {
      id: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role
    };
  }

  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
