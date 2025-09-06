import { UserRepository } from '../../repositories/UserRepository.js';
import { User } from '../../entities/User.js';
import bcrypt from 'bcryptjs';
import appConfig from '../../config/appConfig.js';

/**
 * Create User Use Case - Business Logic
 * Handles user creation with validation and business rules
 */
export class CreateUserUseCase {
  constructor() {
    this.userRepository = new UserRepository(appConfig.getDatabaseType());
  }

  async execute(userData) {
    try {
      // Input validation
      const validation = this.validateInput(userData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          user: null
        };
      }

      const { email, name, password, role = 'customer', phone, address } = userData;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          user: null
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user entity
      const userEntity = new User({
        email,
        name,
        password: passwordHash,
        role,
        phone,
        address,
        isEmailVerified: false,
        isPhoneVerified: false
      });

      // Save to repository
      const createdUser = await this.userRepository.create(userEntity.toJSON());

      return {
        success: true,
        message: 'User created successfully',
        user: User.fromJSON(createdUser)
      };

    } catch (error) {
      console.error('User creation error:', error);
      return {
        success: false,
        message: 'User creation failed',
        user: null,
        error: error.message
      };
    }
  }

  validateInput(userData) {
    if (!userData || !userData.email || !userData.name || !userData.password) {
      return {
        isValid: false,
        message: 'Email, name, and password are required'
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return {
        isValid: false,
        message: 'Invalid email format'
      };
    }

    // Password validation
    if (userData.password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    // Role validation
    const validRoles = ['admin', 'store_manager', 'customer'];
    if (userData.role && !validRoles.includes(userData.role)) {
      return {
        isValid: false,
        message: 'Invalid role. Must be admin, store_manager, or customer'
      };
    }

    return { isValid: true };
  }
}
