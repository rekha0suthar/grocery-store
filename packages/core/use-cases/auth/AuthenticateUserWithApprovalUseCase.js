import { StoreManagerApprovalPolicy } from '../../services/StoreManagerApprovalPolicy.js';


export class AuthenticateUserWithApprovalUseCase {
  constructor(userRepository, storeManagerProfileRepository, requestRepository, passwordHasher, clock = null) {
    this.userRepository = userRepository;
    this.storeManagerProfileRepository = storeManagerProfileRepository;
    this.requestRepository = requestRepository;
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
        await this.userRepository.update(user.id, user.toPersistence());

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

        const rejectedRequest = await this.requestRepository.findByUserAndType(
          user.id, 
          'account_register_request', 
          'rejected'
        );

        if (rejectedRequest) {
          const rejectionReason = rejectedRequest.rejectionReason || 'No reason provided';
          return {
            success: false,
            message: `Your store manager registration request has been rejected. Reason: ${rejectionReason}. You can submit a new application if you wish.`
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
      await this.userRepository.update(user.id, user.toPersistence());

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
