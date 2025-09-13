import { StoreManagerApprovalPolicy } from '../../../services/StoreManagerApprovalPolicy.js';
import { User } from '../../../entities/User.js';
import { StoreManagerProfile } from '../../../entities/StoreManagerProfile.js';
import { FakeClock } from '../../utils/FakeClock.js';

describe('StoreManagerApprovalPolicy', () => {
  let policy;
  let clock;

  beforeEach(() => {
    clock = new FakeClock();
    policy = new StoreManagerApprovalPolicy(clock);
  });

  describe('canRegisterAsStoreManager', () => {
    it('should allow valid store manager registration when admin exists', () => {
      const userData = {
        email: 'manager@store.com',
        name: 'John Manager',
        phone: '+1234567890'
      };

      const existingUsers = [
        new User({ role: 'admin' }, clock)
      ];

      const result = policy.canRegisterAsStoreManager(userData, existingUsers);
      expect(result.canRegister).toBe(true);
    });

    it('should reject registration without email', () => {
      const userData = {
        name: 'John Manager',
        phone: '+1234567890'
      };

      const existingUsers = [
        new User({ role: 'admin' }, clock)
      ];

      const result = policy.canRegisterAsStoreManager(userData, existingUsers);
      expect(result.canRegister).toBe(false);
      expect(result.reason).toBe('Email and name are required');
    });

    it('should reject registration when no admin exists', () => {
      const userData = {
        email: 'manager@store.com',
        name: 'John Manager',
        phone: '+1234567890'
      };

      const existingUsers = []; // No admin

      const result = policy.canRegisterAsStoreManager(userData, existingUsers);
      expect(result.canRegister).toBe(false);
      expect(result.reason).toContain('No administrator exists');
    });
  });

  describe('createStoreManagerApprovalRequest', () => {
    it('should create a valid approval request', () => {
      const userData = {
        name: 'John Manager',
        email: 'manager@store.com',
        phone: '+1234567890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      };

      const request = policy.createStoreManagerApprovalRequest(userData, 'user123');
      
      expect(request.type).toBe('account_register_request');
      expect(request.status).toBe('pending');
      expect(request.requestedBy).toBe('user123');
      expect(request.requestData.name).toBe('John Manager');
      expect(request.requestData.email).toBe('manager@store.com');
    });
  });

  describe('createStoreManagerProfile', () => {
    it('should create an unapproved profile', () => {
      const profile = policy.createStoreManagerProfile('user123', {
        storeName: 'My Store',
        storeAddress: '123 Main St'
      });

      expect(profile.userId).toBe('user123');
      expect(profile.isApproved).toBe(false);
      expect(profile.storeName).toBe('My Store');
      expect(profile.storeAddress).toBe('123 Main St');
    });
  });

  describe('canUserLogin', () => {
    it('should allow admin login', () => {
      const admin = new User({ role: 'admin' }, clock);
      const result = policy.canUserLogin(admin);
      
      expect(result.canLogin).toBe(true);
    });

    it('should allow customer login', () => {
      const customer = new User({ role: 'customer' }, clock);
      const result = policy.canUserLogin(customer);
      
      expect(result.canLogin).toBe(true);
    });

    it('should allow approved store manager login', () => {
      const storeManager = new User({ role: 'store_manager' }, clock);
      const profile = new StoreManagerProfile({ 
        userId: 'user123', 
        isApproved: true 
      }, clock);
      
      const result = policy.canUserLogin(storeManager, profile);
      
      expect(result.canLogin).toBe(true);
    });

    it('should reject unapproved store manager login', () => {
      const storeManager = new User({ role: 'store_manager' }, clock);
      const profile = new StoreManagerProfile({ 
        userId: 'user123', 
        isApproved: false 
      }, clock);
      
      const result = policy.canUserLogin(storeManager, profile);
      
      expect(result.canLogin).toBe(false);
      expect(result.reason).toContain('pending approval');
    });

    it('should reject locked account login', () => {
      const user = new User({ 
        role: 'customer',
        lockedUntil: clock.now().getTime() + 60000 // locked for 1 minute
      }, clock);
      
      const result = policy.canUserLogin(user);
      
      expect(result.canLogin).toBe(false);
      expect(result.reason).toContain('locked');
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
  });

  describe('approveStoreManager', () => {
    it('should approve store manager', () => {
      const profile = new StoreManagerProfile({ 
        userId: 'user123', 
        isApproved: false 
      }, clock);
      const admin = new User({ role: 'admin' }, clock);
      
      const result = policy.approveStoreManager(profile, admin);
      
      expect(result.success).toBe(true);
      expect(profile.isApproved).toBe(true);
      expect(profile.approvedBy).toBe(admin.id);
    });

    it('should reject approval by non-admin', () => {
      const profile = new StoreManagerProfile({ 
        userId: 'user123', 
        isApproved: false 
      }, clock);
      const customer = new User({ role: 'customer' }, clock);
      
      const result = policy.approveStoreManager(profile, customer);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Only administrators');
    });
  });
});
