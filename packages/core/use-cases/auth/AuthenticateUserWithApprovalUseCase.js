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
          message: 'Invalid email or password'
        };
      }


      if (user.isAccountLocked()) {
        return {
          success: false,
          message: 'Your account is temporarily locked due to multiple failed login attempts.'
        };
      }

      const isPasswordValid = await this.passwordHasher.compare(password, user.password);
      if (!isPasswordValid) {
        user.incrementLoginAttempts();
        if (user.loginAttempts >= 5) {
          user.lockAccount();
        }
        await this.userRepository.save(user);

        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      let profile = null;
      if (user.isStoreManager()) {
        profile = await this.storeManagerProfileRepository.findByUserId(user.id);
        if (!profile) {
          return {
            success: false,
            message: 'Store manager profile not found. Please contact support.'
          };
        }
      }

      const canLogin = this.policy.canUserLogin(user, profile);
      if (!canLogin.canLogin) {
        return {
          success: false,
          message: canLogin.reason
        };
      }

      user.recordLogin();
      await this.userRepository.save(user);

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
        message: 'Authentication failed. Please try again.'
      };
    }
  }
}
