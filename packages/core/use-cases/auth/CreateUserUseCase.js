import { User } from '../../entities/User.js';

export class CreateUserUseCase {
  /**
   * @param {{ userRepo: { findByEmail(email):Promise<User>, create(data):Promise<User> }, passwordHasher: { hash(password):Promise<string> } }} deps
   */
  constructor({ userRepo, passwordHasher }) {
    this.userRepository = userRepo;
    this.passwordHasher = passwordHasher;
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

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          user: null
        };
      }

      // Hash password
      const hashedPassword = await this.passwordHasher.hash(userData.password);

      // Create user entity
      const userEntity = new User({
        ...userData,
        password: hashedPassword
      });

      // Validate user entity
      if (!userEntity.isValid()) {
        return {
          success: false,
          message: 'Invalid user data',
          user: null
        };
      }

      // Save user
      const createdUser = await this.userRepository.create(userEntity.toPersistence());
      
      console.log('Created user from database:', createdUser);
      console.log('Created user ID:', createdUser.id);

      return {
        success: true,
        message: 'User created successfully',
        user: User.fromJSON(createdUser).toPublicJSON()
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
    if (!userData) {
      return { isValid: false, message: 'User data is required' };
    }

    if (!userData.email) {
      return { isValid: false, message: 'Email is required' };
    }

    if (!userData.password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (!userData.name) {
      return { isValid: false, message: 'Name is required' };
    }

    if (userData.password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    return { isValid: true };
  }
}
