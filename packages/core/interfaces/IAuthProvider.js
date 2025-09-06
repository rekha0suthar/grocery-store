/**
 * Authentication Provider Interface
 * Supports multiple authentication methods
 */
export class IAuthProvider {
  /**
   * Authenticate user credentials
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Authentication result
   */
  async authenticate(credentials) {
    throw new Error('authenticate method must be implemented');
  }

  /**
   * Generate authentication token
   * @param {Object} user - User object
   * @returns {Promise<string>} Authentication token
   */
  async generateToken(user) {
    throw new Error('generateToken method must be implemented');
  }

  /**
   * Verify authentication token
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Decoded token data
   */
  async verifyToken(token) {
    throw new Error('verifyToken method must be implemented');
  }

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    throw new Error('refreshToken method must be implemented');
  }

  /**
   * Revoke authentication token
   * @param {string} token - Token to revoke
   * @returns {Promise<boolean>} Success status
   */
  async revokeToken(token) {
    throw new Error('revokeToken method must be implemented');
  }

  /**
   * Get user from token
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} User object
   */
  async getUserFromToken(token) {
    throw new Error('getUserFromToken method must be implemented');
  }
}
