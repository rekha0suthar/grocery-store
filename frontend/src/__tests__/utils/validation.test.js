import { formatValidationErrors, validateField } from '../../utils/validation.js';

describe('Validation Utils', () => {
  describe('formatValidationErrors', () => {
    it('should return valid result when validation is valid', () => {
      const validationResult = {
        isValid: true,
        errors: {}
      };
      
      const result = formatValidationErrors(validationResult);
      
      expect(result).toEqual({
        isValid: true,
        errors: {}
      });
    });

    it('should format errors when validation is invalid', () => {
      const validationResult = {
        isValid: false,
        errors: {
          'user.email': 'Email is required',
          'user.password': 'Password must be at least 6 characters',
          'name': 'Name is required'
        }
      };
      
      const result = formatValidationErrors(validationResult);
      
      expect(result).toEqual({
        isValid: false,
        errors: {
          email: 'Email is required',
          password: 'Password must be at least 6 characters',
          name: 'Name is required'
        }
      });
    });

    it('should handle nested field names correctly', () => {
      const validationResult = {
        isValid: false,
        errors: {
          'user.profile.firstName': 'First name is required',
          'user.profile.lastName': 'Last name is required',
          'simpleField': 'Simple field error'
        }
      };
      
      const result = formatValidationErrors(validationResult);
      
      expect(result).toEqual({
        isValid: false,
        errors: {
          firstName: 'First name is required',
          lastName: 'Last name is required',
          simpleField: 'Simple field error'
        }
      });
    });

    it('should handle empty errors object', () => {
      const validationResult = {
        isValid: false,
        errors: {}
      };
      
      const result = formatValidationErrors(validationResult);
      
      expect(result).toEqual({
        isValid: false,
        errors: {}
      });
    });
  });

  describe('validateField', () => {
    it('should return null for valid user field', () => {
      const result = validateField('email', 'test@example.com', 'user');
      expect(result).toBeNull();
    });

    it('should return null for valid product field', () => {
      const result = validateField('name', 'Test Product', 'product');
      expect(result).toBeNull();
    });

    it('should return null for default validation type', () => {
      const result = validateField('email', 'test@example.com');
      expect(result).toBeNull();
    });

    it('should handle unknown validation type', () => {
      const result = validateField('email', 'test@example.com', 'unknown');
      expect(result).toBeNull();
    });
  });
});
