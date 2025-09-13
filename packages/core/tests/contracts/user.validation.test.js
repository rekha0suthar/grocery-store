import {
  isValidEmail,
  isValidName,
  isValidRole,
  isValidPhone,
  isValidPassword,
  validateUserRegistration,
  validateUserLogin,
  validateUserProfile,
} from '../../contracts/user.validation.js';

describe('User Validators', () => {
  describe('isValidEmail', () => {
    test('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('isValidName', () => {
    test('should validate correct names', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName('Mary Jane')).toBe(true);
      expect(isValidName('O\'Connor')).toBe(true);
    });

    test('should reject invalid names', () => {
      expect(isValidName('A')).toBe(false);
      expect(isValidName('')).toBe(false);
      expect(isValidName(null)).toBe(false);
      expect(isValidName('A'.repeat(101))).toBe(false);
    });
  });

  describe('isValidRole', () => {
    test('should validate correct roles', () => {
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('store_manager')).toBe(true);
      expect(isValidRole('customer')).toBe(true);
    });

    test('should reject invalid roles', () => {
      expect(isValidRole('invalid')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole(null)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('should validate correct phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('')).toBe(true); // Optional field
      expect(isValidPhone(null)).toBe(true); // Optional field
    });

    test('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc-def-ghij')).toBe(false);
      expect(isValidPhone('12345678901234567890')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    test('should validate correct passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MySecure1')).toBe(true);
      expect(isValidPassword('Test123')).toBe(true);
    });

    test('should reject invalid passwords', () => {
      expect(isValidPassword('password')).toBe(false); // No uppercase, no number
      expect(isValidPassword('PASSWORD')).toBe(false); // No lowercase, no number
      expect(isValidPassword('Password')).toBe(false); // No number
      expect(isValidPassword('Pass1')).toBe(false); // Too short
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword(null)).toBe(false);
    });
  });

  describe('validateUserRegistration', () => {
    test('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123',
        role: 'customer'
      };

      const result = validateUserRegistration(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should return errors for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: 'A',
        lastName: '',
        password: 'weak',
        role: 'invalid'
      };

      const result = validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.firstName).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.role).toBeDefined();
    });

    test('should validate store manager specific fields', () => {
      const storeManagerData = {
        email: 'manager@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'Password123',
        role: 'store_manager',
        storeName: 'My Store',
        storeAddress: '123 Main Street, City, State 12345'
      };

      const result = validateUserRegistration(storeManagerData);
      expect(result.isValid).toBe(true);
    });

    test('should require store manager fields', () => {
      const incompleteStoreManagerData = {
        email: 'manager@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'Password123',
        role: 'store_manager'
        // Missing storeName and storeAddress
      };

      const result = validateUserRegistration(incompleteStoreManagerData);
      expect(result.isValid).toBe(false);
      expect(result.errors.storeName).toBeDefined();
      expect(result.errors.storeAddress).toBeDefined();
    });
  });

  describe('validateUserLogin', () => {
    test('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const result = validateUserLogin(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should return error for missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      const result = validateUserLogin(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('validateUserProfile', () => {
    test('should validate correct profile data', () => {
      const validData = {
        name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main Street'
      };

      const result = validateUserProfile(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should handle empty optional fields', () => {
      const validData = {};

      const result = validateUserProfile(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });
});
