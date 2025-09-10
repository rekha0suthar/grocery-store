import {
  isValidEmail,
  isValidName,
  isValidRole,
  isValidPhone,
  isValidPassword,
  isValidAddress,
  validateUserForm,
  validateRegistrationForm,
  validateLoginForm,
  ROLES
} from '../../contracts/user.validators.js';

describe('User Validators', () => {
  describe('isValidEmail', () => {
    test('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('isValidName', () => {
    test('should validate correct names', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('Jane')).toBe(true);
      expect(isValidName('A')).toBe(false); // too short
    });

    test('should reject invalid names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName(' ')).toBe(false);
      expect(isValidName('A'.repeat(101))).toBe(false); // too long
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
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1 (234) 567-8900')).toBe(true);
      expect(isValidPhone('')).toBe(true); // optional
      expect(isValidPhone(null)).toBe(true); // optional
    });

    test('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false); // too short
      expect(isValidPhone('abc123')).toBe(false); // contains letters
    });
  });

  describe('isValidPassword', () => {
    test('should validate correct passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MyPass1')).toBe(true);
    });

    test('should reject invalid passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false); // too short
      expect(isValidPassword('password')).toBe(false); // no uppercase, no number
      expect(isValidPassword('PASSWORD')).toBe(false); // no lowercase, no number
      expect(isValidPassword('Password')).toBe(false); // no number
    });
  });

  describe('validateUserForm', () => {
    test('should validate correct user data', () => {
      const validData = {
        email: 'test@example.com',
        name: 'John Doe',
        role: 'customer',
        phone: '1234567890',
        address: '123 Main St'
      };

      const result = validateUserForm(validData);
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should return errors for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        role: 'invalid-role',
        phone: '123',
        address: 'A'.repeat(501)
      };

      const result = validateUserForm(invalidData);
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.name).toBeDefined();
      expect(result.errors.role).toBeDefined();
    });
  });

  describe('validateRegistrationForm', () => {
    test('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        name: 'John Doe',
        role: 'customer',
        phone: '1234567890',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = validateRegistrationForm(validData);
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should return error for password mismatch', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'John Doe',
        role: 'customer',
        phone: '1234567890',
        password: 'Password123',
        confirmPassword: 'DifferentPassword'
      };

      const result = validateRegistrationForm(invalidData);
      expect(result.ok).toBe(false);
      expect(result.errors.confirmPassword).toBeDefined();
    });
  });

  describe('validateLoginForm', () => {
    test('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const result = validateLoginForm(validData);
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should return error for missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      const result = validateLoginForm(invalidData);
      expect(result.ok).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });
});
