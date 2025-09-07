import { User } from '../../../entities/User.js';

// Test builders
const aUser = (overrides = {}) => new User({
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  ...overrides
});

describe('User Entity - Core Domain Rules', () => {
  describe('Creation Invariants', () => {
    test('creates user with valid email and name', () => {
      const user = aUser();
      
      expect(user.id).toBeNull();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.isEmailVerified).toBe(false);
      expect(user.isValid()).toBe(true);
    });

    test('rejects invalid email format', () => {
      const user = aUser({ email: 'invalid-email' });
      
      expect(user.isValid()).toBe(false);
      expect(user.validateEmail()).toBe(false);
    });

    test('rejects invalid name', () => {
      const user = aUser({ name: 'A' });
      
      expect(user.isValid()).toBe(false);
      expect(user.validateName()).toBe(false);
    });

    test('rejects invalid role', () => {
      const user = aUser({ role: 'invalid' });
      
      expect(user.isValid()).toBe(false);
      expect(user.validateRole()).toBe(false);
    });
  });

  describe('Role Identification', () => {
    test('identifies admin role correctly', () => {
      const user = aUser({ role: 'admin' });
      expect(user.isAdmin()).toBe(true);
      expect(user.isStoreManager()).toBe(false);
      expect(user.isCustomer()).toBe(false);
    });

    test('identifies store manager role correctly', () => {
      const user = aUser({ role: 'store_manager' });
      expect(user.isAdmin()).toBe(false);
      expect(user.isStoreManager()).toBe(true);
      expect(user.isCustomer()).toBe(false);
    });

    test('identifies customer role correctly', () => {
      const user = aUser({ role: 'customer' });
      expect(user.isAdmin()).toBe(false);
      expect(user.isStoreManager()).toBe(false);
      expect(user.isCustomer()).toBe(true);
    });
  });

  describe('State Transitions - Idempotency', () => {
    test('verifies email exactly once', () => {
      const user = aUser();
      
      expect(user.isEmailVerified).toBe(false);
      user.verifyEmail();
      expect(user.isEmailVerified).toBe(true);
      
      expect(() => user.verifyEmail()).toThrow('Email already verified');
    });

    test('verifies phone exactly once', () => {
      const user = aUser();
      
      expect(user.isPhoneVerified).toBe(false);
      user.verifyPhone();
      expect(user.isPhoneVerified).toBe(true);
      
      expect(() => user.verifyPhone()).toThrow('Phone already verified');
    });

    test('toPublicJSON remains stable after verification', () => {
      const user = aUser();
      const beforeVerification = user.toPublicJSON();
      
      user.verifyEmail();
      const afterVerification = user.toPublicJSON();
      
      // Should be identical except for isEmailVerified
      expect(afterVerification.isEmailVerified).toBe(true);
      expect(beforeVerification.isEmailVerified).toBe(false);
      expect(afterVerification.email).toBe(beforeVerification.email);
      expect(afterVerification.name).toBe(beforeVerification.name);
    });
  });

  describe('Business Queries', () => {
    test('returns display name from name or email', () => {
      const userWithName = aUser({ name: 'John Doe' });
      expect(userWithName.getDisplayName()).toBe('John Doe');
      
      const userWithoutName = aUser({ name: '', email: 'jane@example.com' });
      expect(userWithoutName.getDisplayName()).toBe('jane@example.com');
    });

    test('returns role display names', () => {
      expect(aUser({ role: 'admin' }).getRoleDisplayName()).toBe('Administrator');
      expect(aUser({ role: 'store_manager' }).getRoleDisplayName()).toBe('Store Manager');
      expect(aUser({ role: 'customer' }).getRoleDisplayName()).toBe('Customer');
      expect(aUser({ role: 'unknown' }).getRoleDisplayName()).toBe('Unknown');
    });

    test('checks verification status', () => {
      const user = aUser();
      expect(user.isVerified()).toBe(false);
      
      user.verifyEmail();
      expect(user.isVerified()).toBe(true);
    });
  });

  describe('Security - JSON Serialization', () => {
    test('toJSON NEVER includes password', () => {
      const user = aUser({ password: 'secret123' });
      
      const json = user.toJSON();
      expect(json).not.toHaveProperty('password');
      expect(json.email).toBe('test@example.com');
      expect(json.name).toBe('Test User');
    });

    test('toPersistence explicitly includes password', () => {
      const user = aUser({ password: 'secret123' });
      
      const persistence = user.toPersistence();
      expect(persistence).toHaveProperty('password', 'secret123');
      expect(persistence.email).toBe('test@example.com');
    });

    test('toPublicJSON is same as toJSON (no secrets)', () => {
      const user = aUser({ password: 'secret123' });
      
      const publicJson = user.toPublicJSON();
      const regularJson = user.toJSON();
      
      expect(publicJson).toEqual(regularJson);
      expect(publicJson).not.toHaveProperty('password');
    });
  });

  describe('Validation Edge Cases', () => {
    test('validates optional phone correctly', () => {
      const userWithoutPhone = aUser();
      expect(userWithoutPhone.validatePhone()).toBe(true);
      
      const userWithValidPhone = aUser({ phone: '+1-555-123-4567' });
      expect(userWithValidPhone.validatePhone()).toBe(true);
      
      const userWithInvalidPhone = aUser({ phone: 'invalid-phone!' });
      expect(userWithInvalidPhone.validatePhone()).toBe(false);
    });

    test('validates role case sensitivity', () => {
      const user = aUser({ role: 'ADMIN' }); // Mixed case
      expect(user.validateRole()).toBe(false);
      
      const validUser = aUser({ role: 'admin' }); // Lower case
      expect(validUser.validateRole()).toBe(true);
    });
  });

  describe('JSON Serialization - Contract-based', () => {
    test('serializes user with correct derived values', () => {
      const user = aUser();
      
      const json = user.toJSON();
      
      // Contract: essential fields are present, secrets are not
      expect(json.email).toBe('test@example.com');
      expect(json.name).toBe('Test User');
      expect(json.role).toBe('customer');
      expect(json).not.toHaveProperty('password');
    });

    test('deserializes user correctly', () => {
      const userData = {
        id: 'user-123',
        email: 'json@example.com',
        name: 'JSON User',
        role: 'admin',
        isEmailVerified: true
      };
      
      const user = User.fromJSON(userData);
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('json@example.com');
      expect(user.name).toBe('JSON User');
      expect(user.role).toBe('admin');
      expect(user.isEmailVerified).toBe(true);
    });
  });
});
