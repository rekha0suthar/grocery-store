import { StoreManagerApprovalPolicy } from '../../../services/StoreManagerApprovalPolicy.js';
import { User } from '../../../entities/User.js';
import { StoreManagerProfile } from '../../../entities/StoreManagerProfile.js';
import { Request } from '../../../entities/Request.js';
import { FakeClock } from '../../utils/FakeClock.js';

describe('Store Manager Approval Workflow', () => {
  let policy;
  let clock;
  let admin;
  let storeManager;
  let profile;
  let request;

  beforeEach(() => {
    clock = new FakeClock();
    policy = new StoreManagerApprovalPolicy(clock);
    
    // Create admin user
    admin = new User({
      id: 'admin_1',
      email: 'admin@store.com',
      role: 'admin'
    }, clock);

    // Create store manager user
    storeManager = new User({
      id: 'manager_1',
      email: 'manager@store.com',
      role: 'store_manager'
    }, clock);

    // Create unapproved store manager profile
    profile = new StoreManagerProfile({
      id: 'profile_1',
      userId: 'manager_1',
      isApproved: false,
      storeName: 'My Store',
      storeAddress: '123 Main St'
    }, clock);

    // Create approval request
    request = new Request({
      id: 'request_1',
      type: 'account_register_request',
      status: 'pending',
      requestedBy: 'manager_1',
      requestData: {
        name: 'John Manager',
        email: 'manager@store.com',
        phone: '+1234567890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      }
    }, clock);
  });

  describe('Complete Approval Workflow', () => {
    it('should handle complete approval workflow', () => {
      // 1. Initial state - store manager cannot login
      let loginResult = policy.canUserLogin(storeManager, profile);
      expect(loginResult.canLogin).toBe(false);
      expect(loginResult.reason).toContain('pending approval');

      // 2. Admin approves the request
      const approvalResult = policy.approveStoreManagerRequest(request, profile, admin);
      expect(approvalResult.success).toBe(true);
      expect(request.status).toBe('approved');
      expect(profile.isApproved).toBe(true);
      expect(profile.approvedBy).toBe('admin_1');

      // 3. Store manager can now login
      loginResult = policy.canUserLogin(storeManager, profile);
      expect(loginResult.canLogin).toBe(true);
    });

    it('should handle rejection workflow', () => {
      // 1. Initial state - store manager cannot login
      let loginResult = policy.canUserLogin(storeManager, profile);
      expect(loginResult.canLogin).toBe(false);

      // 2. Admin rejects the request
      const rejectionResult = policy.rejectStoreManager(profile, admin, 'Insufficient documentation');
      expect(rejectionResult.success).toBe(true);
      expect(profile.isApproved).toBe(false);

      // 3. Store manager still cannot login
      loginResult = policy.canUserLogin(storeManager, profile);
      expect(loginResult.canLogin).toBe(false);
      expect(loginResult.reason).toContain('pending approval');
    });

    it('should handle approval then revocation workflow', () => {
      // 1. Admin approves
      policy.approveStoreManager(profile, admin);
      expect(profile.isApproved).toBe(true);

      // 2. Store manager can login
      let loginResult = policy.canUserLogin(storeManager, profile);
      expect(loginResult.canLogin).toBe(true);

      // 3. Admin revokes approval
      const revocationResult = policy.rejectStoreManager(profile, admin, 'Policy violation');
      expect(revocationResult.success).toBe(true);
      expect(profile.isApproved).toBe(false);

      // 4. Store manager can no longer login
      loginResult = policy.canUserLogin(storeManager, profile);
      expect(loginResult.canLogin).toBe(false);
      expect(loginResult.reason).toContain('pending approval');
    });
  });

  describe('Request Approval Integration', () => {
    it('should approve both request and profile together', () => {
      expect(request.status).toBe('pending');
      expect(profile.isApproved).toBe(false);

      const result = policy.approveStoreManagerRequest(request, profile, admin);

      expect(result.success).toBe(true);
      expect(request.status).toBe('approved');
      expect(request.reviewedBy).toBe('admin_1');
      expect(profile.isApproved).toBe(true);
      expect(profile.approvedBy).toBe('admin_1');
    });

    it('should rollback request approval if profile approval fails', () => {
      // Create an already approved profile
      const approvedProfile = new StoreManagerProfile({
        id: 'profile_2',
        userId: 'manager_1',
        isApproved: true
      }, clock);

      const result = policy.approveStoreManagerRequest(request, approvedProfile, admin);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already approved');
      expect(request.status).toBe('pending'); // Should be rolled back
    });

    it('should reject invalid request types', () => {
      const invalidRequest = new Request({
        type: 'category_add_request',
        status: 'pending'
      }, clock);

      const result = policy.approveStoreManagerRequest(invalidRequest, profile, admin);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid request type');
    });

    it('should reject approval by non-admin', () => {
      const customer = new User({
        id: 'customer_1',
        role: 'customer'
      }, clock);

      const result = policy.approveStoreManagerRequest(request, profile, customer);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only administrators');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple approval attempts', () => {
      // First approval
      const result1 = policy.approveStoreManager(profile, admin);
      expect(result1.success).toBe(true);

      // Second approval attempt
      const result2 = policy.approveStoreManager(profile, admin);
      expect(result2.success).toBe(false);
      expect(result2.message).toContain('already approved');
    });

    it('should handle approval of already approved profile', () => {
      profile.approve('admin_1');

      const result = policy.approveStoreManager(profile, admin);
      expect(result.success).toBe(false);
      expect(result.message).toContain('already approved');
    });

    it('should handle revocation of unapproved profile', () => {
      expect(profile.isApproved).toBe(false);

      const result = policy.rejectStoreManager(profile, admin, 'Test reason');
      expect(result.success).toBe(true);
      expect(result.message).toContain('already not approved');
    });

    it('should handle non-store manager user login', () => {
      const customer = new User({
        role: 'customer'
      }, clock);

      const result = policy.canUserLogin(customer);
      expect(result.canLogin).toBe(true);
    });

    it('should handle store manager without profile', () => {
      const result = policy.canUserLogin(storeManager, null);
      expect(result.canLogin).toBe(false);
      expect(result.reason).toContain('profile not found');
    });
  });

  describe('Status Messages', () => {
    it('should provide correct status messages', () => {
      // Unapproved
      let message = policy.getApprovalStatusMessage(storeManager, profile);
      expect(message).toContain('pending approval');

      // Approved
      profile.approve('admin_1');
      message = policy.getApprovalStatusMessage(storeManager, profile);
      expect(message).toContain('approved and active');

      // Non-store manager
      const customer = new User({ role: 'customer' }, clock);
      message = policy.getApprovalStatusMessage(customer);
      expect(message).toContain('not a store manager');
    });
  });
});
