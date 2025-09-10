import { User } from '../entities/User.js';

export class AdminManagementPolicy {
  constructor(clock = null) {
    this.clock = clock;
  }

  canCreateAdmin(existingUsers = []) {
    const adminCount = existingUsers.filter(user => user.role === 'admin').length;

    if (adminCount >= 1) {
      return {
        canCreate: false,
        reason: 'Only one administrator is allowed in the system'
      };
    }

    return { canCreate: true };
  }

  hasAdmin(existingUsers = []) {
    return existingUsers.some(user => user.role === 'admin');
  }

  canRegisterStoreManager(existingUsers = []) {
    if (!this.hasAdmin(existingUsers)) {
      return {
        canRegister: false,
        reason: 'Store manager registration is not available. No administrator exists in the system. Please contact system support.'
      };
    }

    return { canRegister: true };
  }

  canViewStoreManagerRequests(user) {
    if (!user) {
      return {
        canView: false,
        reason: 'User not authenticated'
      };
    }

    if (!user.isAdmin()) {
      return {
        canView: false,
        reason: 'Only administrators can view store manager requests'
      };
    }

    return { canView: true };
  }

  canApproveStoreManagerRequests(user) {
    if (!user) {
      return {
        canApprove: false,
        reason: 'User not authenticated'
      };
    }

    if (!user.isAdmin()) {
      return {
        canApprove: false,
        reason: 'Only administrators can approve store manager requests'
      };
    }

    return { canApprove: true };
  }

  createFirstAdmin(adminData) {
    return new User({
      email: adminData.email,
      name: adminData.name,
      password: adminData.password,
      role: 'admin',
      phone: adminData.phone || '',
      address: adminData.address || '',
      isEmailVerified: true
    }, this.clock);
  }

  getSystemStatus(existingUsers = []) {
    const adminCount = existingUsers.filter(user => user.role === 'admin').length;

    return {
      isInitialized: adminCount > 0,
      needsAdmin: adminCount === 0,
      adminCount: adminCount
    };
  }

  needsInitialization(existingUsers = []) {
    return !this.hasAdmin(existingUsers);
  }

  getInitializationMessage(existingUsers = []) {
    if (this.needsInitialization(existingUsers)) {
      return 'System needs to be initialized. Please create the first administrator account.';
    }

    return 'System is properly initialized with an administrator.';
  }
}
