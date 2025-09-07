// use-cases/auth/AuthenticateUserUseCase.js
import { User } from '../../entities/User.js';

export class AuthenticateUserUseCase {
  constructor(userRepository, passwordHasher /*, clock? */) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute(credentials) {
    try {
      const validation = this.validateInput(credentials);
      if (!validation.isValid) {
        return { success: false, message: validation.message, user: null };
      }

      const { email, password } = credentials;

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return { success: false, message: 'Invalid credentials', user: null };
      }

      // If your User entity doesn’t implement this, wire a LoginPolicy or stub.
      if (typeof user.isAccountLocked === 'function' && user.isAccountLocked()) {
        return { success: false, message: 'Account is locked', user: null };
      }

      const isPasswordValid = await this.passwordHasher.compare(password, user.password);
      if (!isPasswordValid) {
        await this.handleFailedLogin(user);
        return { success: false, message: 'Invalid credentials', user: null };
      }

      await this.handleSuccessfulLogin(user);
      return {
        success: true,
        message: 'Authentication successful',
        user: user.toPublicJSON ? user.toPublicJSON() : this.safePublicUser(user)
      };
    } catch (error) {
      return { success: false, message: 'Authentication failed', user: null, error: error.message };
    }
  }

  // ——— Application-specific rules ———

  validateInput(credentials) {
    if (!credentials) {
      return { isValid: false, message: 'Credentials are required' };
    }
    if (!credentials.email) {
      return { isValid: false, message: 'Email is required' };
    }
    if (!credentials.password) {
      return { isValid: false, message: 'Password is required' };
    }

    const tempUser = new User({ email: credentials.email });
    if (!tempUser.validateEmail()) {
      return { isValid: false, message: 'Invalid email format' };
    }
    return { isValid: true };
  }

  async handleFailedLogin(user) {
    if (typeof user.incrementLoginAttempts === 'function') {
      user.incrementLoginAttempts();
    }
    await this.userRepository.update(
      user.id,
      user.toPersistence ? user.toPersistence() : user.toJSON()
    );
  }

  async handleSuccessfulLogin(user) {
    if (typeof user.resetLoginAttempts === 'function') {
      user.resetLoginAttempts();
    }
    user.lastLoginAt = new Date();
    await this.userRepository.update(
      user.id,
      user.toPersistence ? user.toPersistence() : user.toJSON()
    );
  }

  // fallback if toPublicJSON is missing
  safePublicUser(user) {
    const { password, loginAttempts, lockedUntil, ...rest } = user;
    return rest;
  }
}
