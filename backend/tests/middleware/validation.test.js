import { 
  handleValidationErrors,
  registerValidation,
  loginValidation,
  productValidation,
  paginationValidation,
  searchValidation
} from '../../src/middleware/validation.js';

describe('Validation Middleware - Input Validation', () => {
  describe('Validation Rules', () => {
    test('register validation rules are defined', () => {
      expect(registerValidation).toBeDefined();
      expect(Array.isArray(registerValidation)).toBe(true);
      expect(registerValidation.length).toBeGreaterThan(0);
    });

    test('login validation rules are defined', () => {
      expect(loginValidation).toBeDefined();
      expect(Array.isArray(loginValidation)).toBe(true);
      expect(loginValidation.length).toBeGreaterThan(0);
    });

    test('product validation rules are defined', () => {
      expect(productValidation).toBeDefined();
      expect(Array.isArray(productValidation)).toBe(true);
      expect(productValidation.length).toBeGreaterThan(0);
    });

    test('pagination validation rules are defined', () => {
      expect(paginationValidation).toBeDefined();
      expect(Array.isArray(paginationValidation)).toBe(true);
      expect(paginationValidation.length).toBeGreaterThan(0);
    });

    test('search validation rules are defined', () => {
      expect(searchValidation).toBeDefined();
      expect(Array.isArray(searchValidation)).toBe(true);
      expect(searchValidation.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Error Handler', () => {
    test('handleValidationErrors function is defined', () => {
      expect(handleValidationErrors).toBeDefined();
      expect(typeof handleValidationErrors).toBe('function');
    });
  });
});
