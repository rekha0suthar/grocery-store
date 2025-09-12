import { FakeClock } from "../../../utils/FakeClock.js";
import { ValidatePaymentUseCase } from '../../../../use-cases/payment/ValidatePaymentUseCase';

describe('ValidatePaymentUseCase', () => {
  let useCase;

  beforeEach(() => {
    useCase = new ValidatePaymentUseCase({ clock: new FakeClock() });
  });

  describe('Constructor', () => {
    test('should initialize with validation rules', () => {
      expect(useCase.validationRules).toBeDefined();
    });
  });

  describe('Individual Validation Methods', () => {
    describe('validatePaymentMethod', () => {
      test('should validate valid payment methods', () => {
        const result = useCase.validatePaymentMethod('credit_card');
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid payment methods', () => {
        const result = useCase.validatePaymentMethod('invalid_method');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateCardNumber', () => {
      test('should validate valid card numbers', () => {
        const result = useCase.validateCardNumber('4532015112830366');
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid card numbers', () => {
        const result = useCase.validateCardNumber('1234567890123456');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateExpiryDate', () => {
      test('should validate valid expiry dates', () => {
        const result = useCase.validateExpiryDate('12/25');
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid expiry dates', () => {
        const result = useCase.validateExpiryDate('13/25');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateCVV', () => {
      test('should validate valid CVV codes', () => {
        const result = useCase.validateCVV('123');
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid CVV codes', () => {
        const result = useCase.validateCVV('12');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateEmail', () => {
      test('should validate valid email addresses', () => {
        const result = useCase.validateEmail('test@example.com');
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid email addresses', () => {
        const result = useCase.validateEmail('invalid-email');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validatePhone', () => {
      test('should validate valid phone numbers', () => {
        const result = useCase.validatePhone('1234567890');
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid phone numbers', () => {
        const result = useCase.validatePhone('123');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateZIPCode', () => {
      test('should validate valid ZIP codes', () => {
        const result = useCase.validateZIPCode('12345');
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid ZIP codes', () => {
        const result = useCase.validateZIPCode('1234');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Complex Validation Methods', () => {
    describe('validatePaymentData', () => {
      test('should validate complete payment data', () => {
        const paymentData = {
          paymentMethod: 'credit_card',
          shippingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US'
          },
          cardNumber: '4111111111111111',
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

        const result = useCase.validatePaymentData(paymentData);
        expect(result.isValid).toBe(true);
      });
      test("should reject incomplete payment data", () => {

        const paymentData = {
          paymentMethod: "credit_card",
          // Missing required card fields for credit card payment
        };

        const result = useCase.validatePaymentData(paymentData);
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateOrderData', () => {
      test('should validate complete order data', () => {
        const orderData = {
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
          billingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US'
          },
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123',
          totalAmount: 21.98,
          userRole: 'customer'
        };

        const result = useCase.validateOrderData(orderData);
        expect(result.isValid).toBe(true);
      });

      test('should reject incomplete order data', () => {
        const orderData = {
          items: [],
          paymentMethod: 'invalid_method'
        };

        const result = useCase.validateOrderData(orderData);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Execute Method', () => {
    test('should handle paymentMethod validation', () => {
      const result = useCase.execute('paymentMethod', 'credit_card');
      expect(result.isValid).toBe(true);
    });

    test('should handle cardNumber validation', () => {
      const result = useCase.execute('cardNumber', '4532015112830366');
      expect(result.isValid).toBe(true);
    });

    test('should handle expiryDate validation', () => {
      const result = useCase.execute('expiryDate', '12/25');
      expect(result.isValid).toBe(true);
    });

    test('should handle cvv validation', () => {
      const result = useCase.execute('cvv', '123');
      expect(result.isValid).toBe(true);
    });

    test('should handle email validation', () => {
      const result = useCase.execute('email', 'test@example.com');
      expect(result.isValid).toBe(true);
    });

    test('should handle phone validation', () => {
      const result = useCase.execute('phone', '1234567890');
      expect(result.isValid).toBe(true);
    });

    test('should handle zipCode validation', () => {
      const result = useCase.execute('zipCode', '12345');
      expect(result.isValid).toBe(true);
    });

    test('should handle paymentData validation', () => {
      const paymentData = {
        paymentMethod: 'credit_card',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US'
        },
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
      };

      const result = useCase.execute('paymentData', paymentData);
      expect(result.isValid).toBe(true);
    });

    test('should handle orderData validation', () => {
      const orderData = {
        items: [
          {
            productId: 'prod1',
            productName: 'Test Product',
            productPrice: 10.99,
            quantity: 2,
            unit: 'piece'
          }
        ],
        paymentMethod: 'credit_card',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US'
        },
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        totalAmount: 21.98,
        userRole: 'customer'
      };

      const result = useCase.execute('orderData', orderData);
      expect(result.isValid).toBe(true);
    });

    test('should handle unknown validation type', () => {
      const result = useCase.execute('unknownType', 'someData');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Unknown validation type');
    });
  });
});
