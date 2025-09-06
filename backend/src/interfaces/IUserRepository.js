import { IRepository } from './IRepository.js';

/**
 * User Repository Interface - Specific contract for user data access
 * Database-independent interface for user operations
 */
export class IUserRepository extends IRepository {
  /**
   * Find user by email
   * @param {string} email - The user email
   * @returns {Promise<Object|null>} The found user or null
   */
  async findByEmail(email) {
    throw new Error('findByEmail method must be implemented');
  }

  /**
   * Find users by role
   * @param {string} role - The user role
   * @returns {Promise<Array>} Array of users
   */
  async findByRole(role) {
    throw new Error('findByRole method must be implemented');
  }

  /**
   * Find active users
   * @returns {Promise<Array>} Array of active users
   */
  async findActiveUsers() {
    throw new Error('findActiveUsers method must be implemented');
  }

  /**
   * Find users by multiple roles
   * @param {Array<string>} roles - Array of roles
   * @returns {Promise<Array>} Array of users
   */
  async findByRoles(roles) {
    throw new Error('findByRoles method must be implemented');
  }

  /**
   * Update user password
   * @param {string} id - The user ID
   * @param {string} hashedPassword - The hashed password
   * @returns {Promise<Object|null>} The updated user or null
   */
  async updatePassword(id, hashedPassword) {
    throw new Error('updatePassword method must be implemented');
  }

  /**
   * Update user login attempts
   * @param {string} id - The user ID
   * @param {number} attempts - Number of login attempts
   * @param {Date|null} lockedUntil - Lock expiry date
   * @returns {Promise<Object|null>} The updated user or null
   */
  async updateLoginAttempts(id, attempts, lockedUntil = null) {
    throw new Error('updateLoginAttempts method must be implemented');
  }

  /**
   * Update user last login
   * @param {string} id - The user ID
   * @param {Date} lastLoginAt - Last login timestamp
   * @returns {Promise<Object|null>} The updated user or null
   */
  async updateLastLogin(id, lastLoginAt) {
    throw new Error('updateLastLogin method must be implemented');
  }

  /**
   * Find users by verification status
   * @param {boolean} isEmailVerified - Email verification status
   * @param {boolean} isPhoneVerified - Phone verification status
   * @returns {Promise<Array>} Array of users
   */
  async findByVerificationStatus(isEmailVerified, isPhoneVerified) {
    throw new Error('findByVerificationStatus method must be implemented');
  }

  /**
   * Search users by name or email
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching users
   */
  async search(searchTerm) {
    throw new Error('search method must be implemented');
  }
}
