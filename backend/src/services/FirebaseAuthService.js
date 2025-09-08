import { auth } from '../config/FirebaseConfig.js';
import { IAuthProvider } from '@grocery-store/core/interfaces';

/**
 * Firebase Authentication Service
 * Implements IAuthProvider interface following Clean Architecture principles
 * Handles user authentication using Firebase Auth
 */
export class FirebaseAuthService extends IAuthProvider {
  constructor() {
    super();
  }

  /**
   * Create a new user account
   * @param {Object} userData - User data including email, password, etc.
   * @returns {Promise<Object>} Created user object
   */
  async createUser(userData) {
    try {
      const { email, password, displayName, phoneNumber } = userData;
      
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
        phoneNumber,
        emailVerified: false
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user by UID
   * @param {string} uid - User UID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserByUid(uid) {
    try {
      const userRecord = await auth.getUser(uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserByEmail(email) {
    try {
      const userRecord = await auth.getUserByEmail(email);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  /**
   * Update user data
   * @param {string} uid - User UID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  async updateUser(uid, updateData) {
    try {
      const userRecord = await auth.updateUser(uid, updateData);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Delete user account
   * @param {string} uid - User UID
   * @returns {Promise<boolean>} True if successful
   */
  async deleteUser(uid) {
    try {
      await auth.deleteUser(uid);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Verify ID token
   * @param {string} idToken - Firebase ID token
   * @returns {Promise<Object>} Decoded token data
   */
  async verifyIdToken(idToken) {
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        iss: decodedToken.iss,
        aud: decodedToken.aud,
        authTime: decodedToken.auth_time,
        exp: decodedToken.exp,
        iat: decodedToken.iat,
        firebase: decodedToken.firebase
      };
    } catch (error) {
      throw new Error(`Failed to verify ID token: ${error.message}`);
    }
  }

  /**
   * Create custom token for user
   * @param {string} uid - User UID
   * @param {Object} additionalClaims - Additional claims to include
   * @returns {Promise<string>} Custom token
   */
  async createCustomToken(uid, additionalClaims = {}) {
    try {
      const customToken = await auth.createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      throw new Error(`Failed to create custom token: ${error.message}`);
    }
  }

  /**
   * Set custom user claims
   * @param {string} uid - User UID
   * @param {Object} customClaims - Custom claims to set
   * @returns {Promise<boolean>} True if successful
   */
  async setCustomUserClaims(uid, customClaims) {
    try {
      await auth.setCustomUserClaims(uid, customClaims);
      return true;
    } catch (error) {
      throw new Error(`Failed to set custom user claims: ${error.message}`);
    }
  }

  /**
   * Get custom user claims
   * @param {string} uid - User UID
   * @returns {Promise<Object>} Custom claims object
   */
  async getCustomUserClaims(uid) {
    try {
      const userRecord = await auth.getUser(uid);
      return userRecord.customClaims || {};
    } catch (error) {
      throw new Error(`Failed to get custom user claims: ${error.message}`);
    }
  }

  /**
   * Send email verification
   * @param {string} uid - User UID
   * @returns {Promise<boolean>} True if successful
   */
  async sendEmailVerification(uid) {
    try {
      // Note: This would typically be handled on the client side
      // For server-side, we can generate a verification link
      const actionCodeSettings = {
        url: `${process.env.FRONTEND_URL}/verify-email`,
        handleCodeInApp: true
      };
      
      // This is a placeholder - actual implementation would depend on your setup
      console.log(`Email verification would be sent to user ${uid}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to send email verification: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if successful
   */
  async sendPasswordResetEmail(email) {
    try {
      // Note: This would typically be handled on the client side
      // For server-side, we can generate a reset link
      console.log(`Password reset email would be sent to ${email}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * List users with pagination
   * @param {number} maxResults - Maximum number of results
   * @param {string} pageToken - Page token for pagination
   * @returns {Promise<Object>} Users list and next page token
   */
  async listUsers(maxResults = 1000, pageToken) {
    try {
      const listUsersResult = await auth.listUsers(maxResults, pageToken);
      
      const users = listUsersResult.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      }));

      return {
        users,
        pageToken: listUsersResult.pageToken
      };
    } catch (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
  }

  /**
   * Disable user account
   * @param {string} uid - User UID
   * @returns {Promise<boolean>} True if successful
   */
  async disableUser(uid) {
    try {
      await auth.updateUser(uid, { disabled: true });
      return true;
    } catch (error) {
      throw new Error(`Failed to disable user: ${error.message}`);
    }
  }

  /**
   * Enable user account
   * @param {string} uid - User UID
   * @returns {Promise<boolean>} True if successful
   */
  async enableUser(uid) {
    try {
      await auth.updateUser(uid, { disabled: false });
      return true;
    } catch (error) {
      throw new Error(`Failed to enable user: ${error.message}`);
    }
  }
}
