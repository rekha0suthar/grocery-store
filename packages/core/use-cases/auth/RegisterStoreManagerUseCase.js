import { User } from '../../entities/User.js';
import { StoreManagerApprovalPolicy } from '../../services/StoreManagerApprovalPolicy.js';


export class RegisterStoreManagerUseCase {
  constructor(userRepository, requestRepository, storeManagerProfileRepository, passwordHasher, clock = null) {
    this.userRepository = userRepository;
    this.requestRepository = requestRepository;
    this.storeManagerProfileRepository = storeManagerProfileRepository;
    this.passwordHasher = passwordHasher;
    this.policy = new StoreManagerApprovalPolicy(clock);
  }

  async execute(userData) {
    try {
      const existingUsers = await this.userRepository.findAll();

      const canRegister = this.policy.canRegisterAsStoreManager(userData, existingUsers);
      if (!canRegister.canRegister) {
        return { 
          success: false, 
          message: canRegister.reason 
        };
      }

      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return { 
          success: false, 
          message: 'A user with this email already exists' 
        };
      }

      const hashedPassword = await this.passwordHasher.hash(userData.password);

      const user = new User({
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: 'store_manager',
        phone: userData.phone,
        address: userData.address || ''
      });

      if (!user.isValid()) {
        return { 
          success: false, 
          message: 'Invalid user data provided' 
        };
      }

      const savedUser = await this.userRepository.create(user.toPersistence());
      
      const profile = this.policy.createStoreManagerProfile(savedUser.id, {
        storeName: userData.storeName,
        storeAddress: userData.storeAddress
      });

      const savedProfile = await this.storeManagerProfileRepository.create(profile);

      const request = this.policy.createStoreManagerApprovalRequest(userData, savedUser.id);

      const savedRequest = await this.requestRepository.create(request.toPersistence());

      return {
        success: true,
        user: savedUser,
        profile: savedProfile,
        request: savedRequest,
        message: 'Store manager registration successful. Your account is pending approval from an administrator.'
      };

    } catch (error) {
      console.error('RegisterStoreManagerUseCase error:', error);
      return { 
        success: false, 
        message: 'Registration failed. Please try again.' 
      };
    }
  }
}
