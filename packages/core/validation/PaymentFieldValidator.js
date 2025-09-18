import { PaymentFieldType } from '../contracts/payment.contracts.js';


export class PaymentFieldValidator {

  static validateField(field, value) {
    if (field.required && (!value || value.trim() === '')) {
      return `${field.label} is required`;
    }

    if (!value || value.trim() === '') {
      return null;
    }

    const trimmedValue = value.trim();

    const fieldSpecificError = PaymentFieldValidator.validateFieldSpecific(field.name, trimmedValue, field);
    if (fieldSpecificError) {
      return fieldSpecificError;
    }

    switch (field.type) {
      case PaymentFieldType.EMAIL:
        return PaymentFieldValidator.validateEmail(trimmedValue, field);
      case PaymentFieldType.PHONE:
        return PaymentFieldValidator.validatePhone(trimmedValue, field);
      case PaymentFieldType.NUMBER:
        return PaymentFieldValidator.validateNumber(trimmedValue, field);
      default:
        return PaymentFieldValidator.validateString(trimmedValue, field);
    }
  }

 
  static validateFieldSpecific(fieldName, value, _field) { // Fixed: prefix unused param with _
    switch (fieldName) {
      case 'cardNumber':
        return PaymentFieldValidator.validateCardNumber(value);
      case 'expiry':
        return PaymentFieldValidator.validateExpiryDate(value);
      case 'cvv':
        return PaymentFieldValidator.validateCVV(value);
      case 'cardholder':
        return PaymentFieldValidator.validateCardholderName(value);
      case 'upiId':
        return PaymentFieldValidator.validateUpiId(value);
      default:
        return null;
    }
  }


  static getCardType(cardNumber) {
    const digits = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits) || /^4/.test(digits)) return 'discover';
    if (/^3[068]/.test(digits)) return 'diners';
    if (/^35/.test(digits)) return 'jcb';
    if (/^62/.test(digits)) return 'unionpay';
    
    return 'unknown';
  }


  static validateCardNumber(value) {
    if (!value) return 'Card number is required';
    
    const digits = value.replace(/\s/g, '');
    if (!/^\d+$/.test(digits)) {
      return 'Card number must contain only digits';
    }
    
    const cardType = PaymentFieldValidator.getCardType(digits);
    const validLengths = {
      visa: [13, 16, 19],
      mastercard: [16],
      amex: [15],
      discover: [16],
      diners: [14],
      jcb: [15, 16],
      unionpay: [16, 17, 18, 19]
    };
    
    if (cardType !== 'unknown' && !validLengths[cardType].includes(digits.length)) {
      return `Invalid ${cardType} card number length`;
    }
    
    if (!PaymentFieldValidator.validateLuhn(digits)) {
      return 'Card number is invalid';
    }
    
    return null;
  }


  static validateLuhn(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }


  static validateExpiryDate(value) {
    if (!value) return 'Expiry date is required';
    
    const formatRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!formatRegex.test(value)) {
      return 'Enter month and year (e.g., 12/25)';
    }
    
    return null;
  }


  static validateCVV(value) {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length < 3 || digits.length > 4) {
      return 'CVV must be 3 or 4 digits';
    }
    
    return null;
  }


  static validateCardholderName(value) {
    if (!value) return 'Cardholder name is required';
    
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return 'Cardholder name must be at least 2 characters';
    }
    
    if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
      return 'Cardholder name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    return null;
  }


  static validateUpiId(value) {
    if (!value) return 'UPI ID is required';
    
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!upiRegex.test(value)) {
      return 'Enter a valid UPI ID (e.g., username@bank)';
    }
    
    return null;
  }

 
  static validateEmail(value, field) {
    return PaymentFieldValidator.validateString(value, field);
  }

  /**
   * Validate phone number
   */
  static validatePhone(value, field) {
    return PaymentFieldValidator.validateString(value, field);
  }

 
  static validateNumber(value, field) {
    return PaymentFieldValidator.validateString(value, field);
  }


  static validateString(value, field) {
    if (!value) return null;
    
    if (field.minLength && value.length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters`;
    }
    
    if (field.maxLength && value.length > field.maxLength) {
      return `${field.label} must be no more than ${field.maxLength} characters`;
    }
    
    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      return field.patternMessage || `${field.label} format is invalid`;
    }
    
    return null;
  }
}

export const PaymentValidationRules = {
  cardNumber: PaymentFieldValidator.validateCardNumber,
  expiryDate: PaymentFieldValidator.validateExpiryDate,
  cvv: PaymentFieldValidator.validateCVV,
  cardholderName: PaymentFieldValidator.validateCardholderName,
  upiId: PaymentFieldValidator.validateUpiId
}; 
