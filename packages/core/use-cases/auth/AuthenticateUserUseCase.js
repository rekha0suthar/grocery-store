/**
 * Authenticate User Use Case - Application-specific business rules
 * 
 * This use case orchestrates the authentication flow using:
 * - User entity (enterprise-wide business rules)
 * - User repository (through interface/port)
 * - Password hasher (through interface/port)
 * 
 * NO direct framework dependencies
 * NO direct database dependencies
 * NO configuration dependencies
 */
export class AuthenticateUserUseCase {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
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

      // Check if account is locked (using entity business rule)
      if (user.isAccountLocked()) {
        return {
          success: false,
          message: 'Account is locked',
          user: null
        };
      }

      // Verify password using injected password hasher
      const isPasswordValid = await this.passwordHasher.compare(password, user.password);
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
        user: user.toPublicJSON()
      };

    } catch (error) {
      return {
        success: false,
        message: 'Authentication failed',
        user: null,
        error: error.message
      };
    }
  }

  // ===== APPLICATION-SPECIFIC BUSINESS RULES =====
  
  validateInput(credentials) {
    if (!credentials || !credentials.email || !credentials.password) {
      return {
        isValid: false,
        message: 'Email and password are required'
      };
    }

    // Use entity validation for email format
    const tempUser = new User({ email: credentials.email });
    if (!tempUser.validateEmail()) {
      return {
        isValid: false,
        message: 'Invalid email format'
      };
    }

    return { isValid: true };
  }

  async handleFailedLogin(user) {
    // Use entity business rule for login attempts
    user.incrementLoginAttempts();
    await this.userRepository.update(user.id, user.toJSON());
  }

  async handleSuccessfulLogin(user) {
    // Use entity business rule to reset attempts
    user.resetLoginAttempts();
    user.lastLoginAt = new Date();
    await this.userRepository.update(user.id, user.toJSON());
  }
}
