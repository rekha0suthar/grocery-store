import { AdminManagementPolicy } from '../../services/AdminManagementPolicy.js';

export class InitializeSystemUseCase {
  constructor(userRepository, clock = null) {
    this.userRepository = userRepository;
    this.policy = new AdminManagementPolicy(clock);
  }

  async execute(adminData) {
    try {
      const existingUsers = await this.userRepository.findAll();
      
      const canCreate = this.policy.canCreateAdmin(existingUsers);
      if (!canCreate.canCreate) {
        return { 
          success: false, 
          message: canCreate.reason 
        };
      }

      const admin = this.policy.createFirstAdmin(adminData);

      if (!admin.isValid()) {
        return { 
          success: false, 
          message: 'Invalid admin data provided' 
        };
      }

      const existingAdmin = await this.userRepository.findByEmail(admin.email);
      if (existingAdmin) {
        return { 
          success: false, 
          message: 'A user with this email already exists' 
        };
      }

      const savedAdmin = await this.userRepository.create(admin.toPersistence());

      return {
        success: true,
        user: savedAdmin,
        message: 'System has been successfully initialized with the first administrator account.'
      };

    } catch (error) {
      console.error('InitializeSystemUseCase error:', error);
      return { 
        success: false, 
        message: 'System initialization failed. Please try again.' 
      };
    }
  }

  async checkInitializationStatus() {
    try {
      const existingUsers = await this.userRepository.findAll();
      const status = this.policy.getSystemStatus(existingUsers);
      
      return {
        needsInitialization: status.needsAdmin,
        isInitialized: status.isInitialized,
        adminCount: status.adminCount,
        message: this.policy.getInitializationMessage(existingUsers)
      };
    } catch (error) {
      console.error('CheckInitializationStatus error:', error);
      return { 
        needsInitialization: true,
        isInitialized: false,
        adminCount: 0,
        message: 'Unable to check system status. System may need initialization.' 
      };
    }
  }
}
