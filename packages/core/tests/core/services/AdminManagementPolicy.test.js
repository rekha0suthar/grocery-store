import { AdminManagementPolicy } from '../../../services/AdminManagementPolicy.js';
import { User } from '../../../entities/User.js';
import { FakeClock } from '../../utils/FakeClock.js';

describe('AdminManagementPolicy', () => {
  let policy;
  let clock;

  beforeEach(() => {
    clock = new FakeClock();
    policy = new AdminManagementPolicy(clock);
  });

  describe('canCreateAdmin', () => {
    it('should allow creating admin when no admin exists', () => {
      const existingUsers = [];
      const result = policy.canCreateAdmin(existingUsers);
      
      expect(result.canCreate).toBe(true);
    });

    it('should allow creating admin when only customers exist', () => {
      const existingUsers = [
        new User({ role: 'customer' }, clock),
        new User({ role: 'customer' }, clock)
      ];
      const result = policy.canCreateAdmin(existingUsers);
      
      expect(result.canCreate).toBe(true);
    });

    it('should allow creating admin when only store managers exist', () => {
      const existingUsers = [
        new User({ role: 'store_manager' }, clock),
        new User({ role: 'store_manager' }, clock)
      ];
      const result = policy.canCreateAdmin(existingUsers);
      
      expect(result.canCreate).toBe(true);
    });

    it('should reject creating admin when one admin already exists', () => {
      const existingUsers = [
        new User({ role: 'admin' }, clock)
      ];
      const result = policy.canCreateAdmin(existingUsers);
      
      expect(result.canCreate).toBe(false);
      expect(result.reason).toBe('Only one administrator is allowed in the system');
    });

    it('should reject creating admin when multiple admins exist', () => {
      const existingUsers = [
        new User({ role: 'admin' }, clock),
        new User({ role: 'admin' }, clock)
      ];
      const result = policy.canCreateAdmin(existingUsers);
      
      expect(result.canCreate).toBe(false);
      expect(result.reason).toBe('Only one administrator is allowed in the system');
    });
  });

  describe('hasAdmin', () => {
    it('should return false when no users exist', () => {
      const existingUsers = [];
      const result = policy.hasAdmin(existingUsers);
      
      expect(result).toBe(false);
    });

    it('should return false when no admin exists', () => {
      const existingUsers = [
        new User({ role: 'customer' }, clock),
        new User({ role: 'store_manager' }, clock)
      ];
      const result = policy.hasAdmin(existingUsers);
      
      expect(result).toBe(false);
    });

    it('should return true when admin exists', () => {
      const existingUsers = [
        new User({ role: 'customer' }, clock),
        new User({ role: 'admin' }, clock),
        new User({ role: 'store_manager' }, clock)
      ];
      const result = policy.hasAdmin(existingUsers);
      
      expect(result).toBe(true);
    });
  });

  describe('canRegisterStoreManager', () => {
    it('should allow store manager registration when admin exists', () => {
      const existingUsers = [
        new User({ role: 'admin' }, clock)
      ];
      const result = policy.canRegisterStoreManager(existingUsers);
      
      expect(result.canRegister).toBe(true);
    });

    it('should reject store manager registration when no admin exists', () => {
      const existingUsers = [];
      const result = policy.canRegisterStoreManager(existingUsers);
      
      expect(result.canRegister).toBe(false);
      expect(result.reason).toContain('No administrator exists');
    });

    it('should reject store manager registration when only customers exist', () => {
      const existingUsers = [
        new User({ role: 'customer' }, clock),
        new User({ role: 'customer' }, clock)
      ];
      const result = policy.canRegisterStoreManager(existingUsers);
      
      expect(result.canRegister).toBe(false);
      expect(result.reason).toContain('No administrator exists');
    });
  });

  describe('canViewStoreManagerRequests', () => {
    it('should allow admin to view requests', () => {
      const admin = new User({ role: 'admin' }, clock);
      const result = policy.canViewStoreManagerRequests(admin);
      
      expect(result.canView).toBe(true);
    });

    it('should reject customer from viewing requests', () => {
      const customer = new User({ role: 'customer' }, clock);
      const result = policy.canViewStoreManagerRequests(customer);
      
      expect(result.canView).toBe(false);
      expect(result.reason).toContain('Only administrators');
    });

    it('should reject store manager from viewing requests', () => {
      const storeManager = new User({ role: 'store_manager' }, clock);
      const result = policy.canViewStoreManagerRequests(storeManager);
      
      expect(result.canView).toBe(false);
      expect(result.reason).toContain('Only administrators');
    });

    it('should reject null user from viewing requests', () => {
      const result = policy.canViewStoreManagerRequests(null);
      
      expect(result.canView).toBe(false);
      expect(result.reason).toContain('not authenticated');
    });
  });

  describe('canApproveStoreManagerRequests', () => {
    it('should allow admin to approve requests', () => {
      const admin = new User({ role: 'admin' }, clock);
      const result = policy.canApproveStoreManagerRequests(admin);
      
      expect(result.canApprove).toBe(true);
    });

    it('should reject customer from approving requests', () => {
      const customer = new User({ role: 'customer' }, clock);
      const result = policy.canApproveStoreManagerRequests(customer);
      
      expect(result.canApprove).toBe(false);
      expect(result.reason).toContain('Only administrators');
    });

    it('should reject store manager from approving requests', () => {
      const storeManager = new User({ role: 'store_manager' }, clock);
      const result = policy.canApproveStoreManagerRequests(storeManager);
      
      expect(result.canApprove).toBe(false);
      expect(result.reason).toContain('Only administrators');
    });
  });

  describe('createFirstAdmin', () => {
    it('should create admin with correct properties', () => {
      const adminData = {
        email: 'admin@store.com',
        name: 'System Admin',
        password: 'admin123',
        phone: '+1234567890'
      };

      const admin = policy.createFirstAdmin(adminData);

      expect(admin.role).toBe('admin');
      expect(admin.email).toBe('admin@store.com');
      expect(admin.name).toBe('System Admin');
      expect(admin.isEmailVerified).toBe(true);
    });
  });

  describe('getSystemStatus', () => {
    it('should return correct status when no users exist', () => {
      const existingUsers = [];
      const status = policy.getSystemStatus(existingUsers);
      
      expect(status.isInitialized).toBe(false);
      expect(status.needsAdmin).toBe(true);
      expect(status.adminCount).toBe(0);
    });

    it('should return correct status when admin exists', () => {
      const existingUsers = [
        new User({ role: 'admin' }, clock),
        new User({ role: 'customer' }, clock),
        new User({ role: 'store_manager' }, clock)
      ];
      const status = policy.getSystemStatus(existingUsers);
      
      expect(status.isInitialized).toBe(true);
      expect(status.needsAdmin).toBe(false);
      expect(status.adminCount).toBe(1);
    });
  });

  describe('needsInitialization', () => {
    it('should return true when no admin exists', () => {
      const existingUsers = [];
      const result = policy.needsInitialization(existingUsers);
      
      expect(result).toBe(true);
    });

    it('should return false when admin exists', () => {
      const existingUsers = [
        new User({ role: 'admin' }, clock)
      ];
      const result = policy.needsInitialization(existingUsers);
      
      expect(result).toBe(false);
    });
  });

  describe('getInitializationMessage', () => {
    it('should return initialization message when no admin exists', () => {
      const existingUsers = [];
      const message = policy.getInitializationMessage(existingUsers);
      
      expect(message).toContain('needs to be initialized');
    });

    it('should return success message when admin exists', () => {
      const existingUsers = [
        new User({ role: 'admin' }, clock)
      ];
      const message = policy.getInitializationMessage(existingUsers);
      
      expect(message).toContain('properly initialized');
    });
  });
});
