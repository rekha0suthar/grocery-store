import { PaymentValidationRules, validatePaymentData, validateOrderData } from '../../contracts/payment.validation.js';

export class ValidatePaymentUseCase {
  constructor({ clock }) {
    this.clock = clock;
    this.validationRules = PaymentValidationRules;
  }

  validatePaymentMethod(paymentMethod) {
    return this.validationRules.validatePaymentMethod(paymentMethod);
  }

  validateCardNumber(cardNumber) {
    return this.validationRules.validateCardNumber(cardNumber);
  }

  validateExpiryDate(expiryDate) {
    return this.validationRules.validateExpiryDate(expiryDate, this.clock);
  }

  validateCVV(cvv) {
    return this.validationRules.validateCVV(cvv);
  }

  validateEmail(email) {
    return this.validationRules.validateEmail(email);
  }

  validatePhone(phone) {
    return this.validationRules.validatePhone(phone);
  }

  validateZIPCode(zipCode) {
    return this.validationRules.validateZIPCode(zipCode);
  }
 
  validatePaymentData(paymentData) {
    return validatePaymentData(paymentData, this.clock);
  }
 
  validateOrderData(orderData) {
    return validateOrderData(orderData, this.clock);
  }

  execute(type, data) {
    switch (type) {
      case 'paymentMethod':
        return this.validatePaymentMethod(data);
      case 'cardNumber':
        return this.validateCardNumber(data);
      case 'expiryDate':
        return this.validateExpiryDate(data);
      case 'cvv':
        return this.validateCVV(data);
      case 'email':
        return this.validateEmail(data);
      case 'phone':
        return this.validatePhone(data);
      case 'zipCode':
        return this.validateZIPCode(data);
      case 'paymentData':
        return this.validatePaymentData(data);
      case 'orderData':
        return this.validateOrderData(data);
      default:
        return {
          isValid: false,
          message: 'Unknown validation type'
        };
    }
  }
} 
