import { UserRepository } from '../repositories/UserRepository.js';
import bcrypt from 'bcryptjs';
import appConfig from '../config/appConfig.js';

/**
 * Authenticate User Use Case - Clean Architecture
 * Business logic for user authentication
 */
export class AuthenticateUserUseCase {
  constructor() {
    this.userRepository = new UserRepository(appConfig.getDatabaseType());
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 30 * 60 * 1000; // 30 minutes
  }

  async execute(credentials) {
    try {
      // Input validation
      const validation = this.validateInput(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          user: null
        };
      }

      const { email, password } = credentials;

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
          user: null
        };
      }

      // Check if account is locked
      if (this.isAccountLocked(user)) {
        return {
          success: false,
          message: 'Account is locked',
          user: null
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.handleFailedLogin(user);
        return {
          success: false,
          message: 'Invalid credentials',
          user: null
        };
      }

      // Successful authentication
      await this.handleSuccessfulLogin(user);
      
      return {
        success: true,
        message: 'Authentication successful',
        user: this.sanitizeUser(user)
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        message: 'Authentication failed',
        user: null,
        error: error.message
      };
    }
  }

  validateInput(credentials) {
    if (!credentials || !credentials.email || !credentials.password) {
      return {
        isValid: false,
        message: 'Email and password are required'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      return {
        isValid: false,
        message: 'Invalid email format'
      };
    }

    return { isValid: true };
  }

  isAccountLocked(user) {
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil) > new Date();
  }

  async handleFailedLogin(user) {
    const newAttempts = user.loginAttempts + 1;
    
    if (newAttempts >= this.maxLoginAttempts) {
      const lockoutUntil = new Date(Date.now() + this.lockoutDuration);
      await this.userRepository.updateLoginAttempts(user.id, newAttempts, lockoutUntil.toISOString());
      
      return {
        success: false,
        message: 'Account locked due to too many failed attempts',
        user: null
      };
    } else {
      await this.userRepository.updateLoginAttempts(user.id, newAttempts);
    }
  }

  async handleSuccessfulLogin(user) {
    await this.userRepository.resetLoginAttempts(user.id);
    await this.userRepository.updateLastLogin(user.id);
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
