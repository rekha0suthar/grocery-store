import { 
  PaymentValidationRules, 
  validatePaymentData, 
  validateOrderData,
  PAYMENT_METHODS,
  getEnabledPaymentMethods,
  getPaymentMethod
} from '../../contracts/payment.validation.js';

describe('Payment Validation Rules', () => {
  describe('validateCardNumber', () => {
    test('should validate valid card numbers', () => {
      const validCards = [
        '4532015112830366', // Visa
        '5555555555554444', // Mastercard
        '378282246310005',  // American Express
        '6011111111111117', // Discover
        '4111111111111111'  // Visa test card
      ];

      validCards.forEach(cardNumber => {
        const result = PaymentValidationRules.validateCardNumber(cardNumber);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Valid card number');
      });
    });

    test('should reject invalid card numbers', () => {
      const invalidCards = [
        '1234567890123456', // Invalid Luhn
        '4532015112830367', // Invalid Luhn
        '1234',             // Too short
        '12345678901234567890', // Too long
        'abcd1234567890',   // Contains letters
        '',                 // Empty
        null,               // Null
        undefined           // Undefined
      ];

      invalidCards.forEach(cardNumber => {
        const result = PaymentValidationRules.validateCardNumber(cardNumber);
        expect(result.isValid).toBe(false);
        expect(result.message).toMatch(/Card number must be 13-19 digits|Invalid card number|Card number is required/);
      });
    });

    test('should handle card numbers with spaces and dashes', () => {
      const result = PaymentValidationRules.validateCardNumber('4532 0151 1283 0366');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateExpiryDate', () => {
    test('should validate valid expiry dates', () => {
      const validDates = [
        '12/25',
        '01/30',
        '06/28',
        '12/99'
      ];

      validDates.forEach(date => {
        const result = PaymentValidationRules.validateExpiryDate(date);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Valid expiry date');
      });
    });

    test('should reject invalid expiry dates', () => {
      const invalidDates = [
        '13/25',    // Invalid month
        '00/25',    // Invalid month
        '12/20',    // Past date
        '12/2',     // Invalid format
        '12/2025',  // Wrong format
        'abc/25',   // Non-numeric
        '',         // Empty
        null,       // Null
        undefined   // Undefined
      ];

      invalidDates.forEach(date => {
        const result = PaymentValidationRules.validateExpiryDate(date);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validateCVV', () => {
    test('should validate valid CVV codes', () => {
      const validCVVs = ['123', '456', '789', '000', '999'];

      validCVVs.forEach(cvv => {
        const result = PaymentValidationRules.validateCVV(cvv);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Valid CVV');
      });
    });

    test('should reject invalid CVV codes', () => {
      const invalidCVVs = [
        '12',      // Too short
        '12345',   // Too long
        'abc',     // Non-numeric
        '',        // Empty
        null,      // Null
        undefined  // Undefined
      ];

      invalidCVVs.forEach(cvv => {
        const result = PaymentValidationRules.validateCVV(cvv);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validateEmail', () => {
    test('should validate valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = PaymentValidationRules.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Valid email');
      });
    });

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        const result = PaymentValidationRules.validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validatePhone', () => {
    test('should validate valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '+1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '+1 (123) 456-7890'
      ];

      validPhones.forEach(phone => {
        const result = PaymentValidationRules.validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Valid phone number');
      });
    });

    test('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',           // Too short
        '12345678901234567890', // Too long
        'abc-def-ghij',  // Contains letters
        '',              // Empty
        null,            // Null
        undefined        // Undefined
      ];

      invalidPhones.forEach(phone => {
        const result = PaymentValidationRules.validatePhone(phone);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validateZIPCode', () => {
    test('should validate valid ZIP codes', () => {
      const validZIPs = [
        '12345',
        '12345-6789',
        '12345-6789',  // Extended format
        '1234567890'  // Long format
      ];

      validZIPs.forEach(zip => {
        const result = PaymentValidationRules.validateZIPCode(zip);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Valid ZIP code');
      });
    });

    test('should reject invalid ZIP codes', () => {
      const invalidZIPs = [
        '1234',      // Too short
        '123456789012345', // Too long
        'abcde',     // Non-numeric
        '',          // Empty
        null,        // Null
        undefined    // Undefined
      ];

      invalidZIPs.forEach(zip => {
        const result = PaymentValidationRules.validateZIPCode(zip);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validatePaymentMethod', () => {
    test('should validate valid payment methods', () => {
      const validMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'cod'];

      validMethods.forEach(method => {
        const result = PaymentValidationRules.validatePaymentMethod(method);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('Valid payment method');
      });
    });

    test('should reject invalid payment methods', () => {
      const invalidMethods = [
        'invalid_method',
        'bitcoin',
        '',
        null,
        undefined
      ];

      invalidMethods.forEach(method => {
        const result = PaymentValidationRules.validatePaymentMethod(method);
        expect(result.isValid).toBe(false);
      });
    });
  });
});

describe('Payment Data Validation', () => {
  describe('validatePaymentData', () => {
    test('should validate complete payment data', () => {
      const validPaymentData = {
        paymentMethod: 'credit_card',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardNumber: '4532015112830366',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        billingAddress: {
          street: '123 Main St',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US'
        }
      };

      const result = validatePaymentData(validPaymentData);
      expect(result.isValid).toBe(true);
    });

    test('should reject incomplete payment data', () => {
      const invalidPaymentData = {
        paymentMethod: 'credit_card',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardNumber: '1234', // Invalid
        expiryDate: '12/25',
        cvv: '123'
        // Missing required fields
      };

      const result = validatePaymentData(invalidPaymentData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe('validateOrderData', () => {
    test('should validate complete order data', () => {
      const validOrderData = {
        items: [
          {
            productId: 'prod1',
            productName: 'Test Product',
            productPrice: 10.99,
            quantity: 2,
            unit: 'piece'
          }
        ],
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US'
        },
        paymentMethod: 'credit_card',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        totalAmount: 21.98,
        userRole: 'customer'
      };

      const result = validateOrderData(validOrderData);
      expect(result.isValid).toBe(true);
    });

    test('should reject incomplete order data', () => {
      const invalidOrderData = {
        items: [], // Empty items
        paymentMethod: 'invalid_method'
        // Missing required fields
      };

      const result = validateOrderData(invalidOrderData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});

describe('Payment Methods Configuration', () => {
  describe('PAYMENT_METHODS', () => {
    test('should have all required payment methods', () => {
      expect(PAYMENT_METHODS).toHaveProperty('credit_card');
      expect(PAYMENT_METHODS).toHaveProperty('paypal');
      expect(PAYMENT_METHODS).toHaveProperty('cash_on_delivery');
    });

    test('should have correct structure for each payment method', () => {
      Object.values(PAYMENT_METHODS).forEach(method => {
        expect(method).toHaveProperty('id');
        expect(method).toHaveProperty('name');
        expect(method).toHaveProperty('description');
        expect(method).toHaveProperty('icon');
        expect(method).toHaveProperty('requiresCardDetails');
        expect(method).toHaveProperty('enabled');
        expect(typeof method.requiresCardDetails).toBe('boolean');
        expect(typeof method.enabled).toBe('boolean');
      });
    });
  });

  describe('getEnabledPaymentMethods', () => {
    test('should return only enabled payment methods', () => {
      const enabledMethods = getEnabledPaymentMethods();
      expect(Array.isArray(enabledMethods)).toBe(true);
      enabledMethods.forEach(method => {
        expect(method.enabled).toBe(true);
      });
    });
  });

  describe('getPaymentMethod', () => {
    test('should return correct payment method by ID', () => {
      const creditCard = getPaymentMethod('credit_card');
      expect(creditCard).toBeDefined();
      expect(creditCard.id).toBe('credit_card');
    });

    test('should return null for invalid ID', () => {
      const invalid = getPaymentMethod('invalid_method');
      expect(invalid).toBeNull();
    });
  });
});
