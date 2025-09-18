import { StoreManagerApprovalPolicy } from '../../services/StoreManagerApprovalPolicy.js';

export class AuthenticateUserWithApprovalUseCase {
  constructor(userRepository, storeManagerProfileRepository, passwordHasher, clock = null) {
    this.userRepository = userRepository;
    this.storeManagerProfileRepository = storeManagerProfileRepository;
    this.passwordHasher = passwordHasher;
    this.policy = new StoreManagerApprovalPolicy(clock);
  }

  async execute(email, password) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address. Please check your email or create a new account.'
        };
      }

      // Critical fix: Validate user ID before proceeding
      if (!user.id || user.id === null || user.id === undefined) {
        console.error('AuthenticateUserWithApprovalUseCase: User ID is invalid:', {
          userId: user.id,
          userEmail: user.email,
          userObject: user
        });
        return {
          success: false,
          message: 'User data is corrupted. Please contact support.'
        };
      }

      if (user.isAccountLocked()) {
        return {
          success: false,
          message: 'Your account is temporarily locked due to multiple failed login attempts. Please try again later or contact support.'
        };
      }

      const isPasswordValid = await this.passwordHasher.compare(password, user.password);
      if (!isPasswordValid) {
        user.incrementLoginAttempts();
        if (user.loginAttempts >= 5) {
          user.lockAccount();
        }
        
        // Safe update with ID validation
        try {
          await this.userRepository.update(user.id, user.toPersistence());
        } catch (updateError) {
          console.error('Failed to update user after failed login:', updateError);
          // Continue with the flow even if update fails
        }

        return {
          success: false,
          message: 'Incorrect password. Please check your password and try again.'
        };
      }

      let profile = null;
      if (user.isStoreManager()) {
        profile = await this.storeManagerProfileRepository.findByUserId(user.id);
        if (!profile) {
          return {
            success: false,
            message: 'Store manager profile not found. Please contact support to complete your account setup.'
          };
        }
      }

      const canLogin = this.policy.canUserLogin(user, profile);
      if (!canLogin.canLogin) {
        return {
          success: false,
          message: canLogin.reason || 'Your account is not approved for login. Please contact support.'
        };
      }

      user.recordLogin();
      
      // Safe update with ID validation
      try {
        await this.userRepository.update(user.id, user.toPersistence());
      } catch (updateError) {
        console.error('Failed to update user after successful login:', updateError);
        // Continue with the flow even if update fails
      }

      return {
        success: true,
        user: user,
        profile: profile,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('AuthenticateUserWithApprovalUseCase error:', error);
      return {
        success: false,
        message: 'Authentication failed due to a server error. Please try again later.'
      };
    }
  }
}
