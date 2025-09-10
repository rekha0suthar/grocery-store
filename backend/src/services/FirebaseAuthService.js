import { auth } from '../config/FirebaseConfig.js';
import { IAuthProvider } from '@grocery-store/core/interfaces';

export class FirebaseAuthService extends IAuthProvider {
  constructor() {
    super();
  }

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

  async deleteUser(uid) {
    try {
      await auth.deleteUser(uid);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

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

  async createCustomToken(uid, additionalClaims = {}) {
    try {
      const customToken = await auth.createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      throw new Error(`Failed to create custom token: ${error.message}`);
    }
  }

  async setCustomUserClaims(uid, customClaims) {
    try {
      await auth.setCustomUserClaims(uid, customClaims);
      return true;
    } catch (error) {
      throw new Error(`Failed to set custom user claims: ${error.message}`);
    }
  }
  
  async getCustomUserClaims(uid) {
    try {
      const userRecord = await auth.getUser(uid);
      return userRecord.customClaims || {};
    } catch (error) {
      throw new Error(`Failed to get custom user claims: ${error.message}`);
    }
  }
  
  async sendEmailVerification(uid) {
    try {    
      console.log(`Email verification would be sent to user ${uid}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to send email verification: ${error.message}`);
    }
  }
  
  async sendPasswordResetEmail(email) {
    try {
      console.log(`Password reset email would be sent to ${email}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

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

  async disableUser(uid) {
    try {
      await auth.updateUser(uid, { disabled: true });
      return true;
    } catch (error) {
      throw new Error(`Failed to disable user: ${error.message}`);
    }
  }

  async enableUser(uid) {
    try {
      await auth.updateUser(uid, { disabled: false });
      return true;
    } catch (error) {
      throw new Error(`Failed to enable user: ${error.message}`);
    }
  }
}
