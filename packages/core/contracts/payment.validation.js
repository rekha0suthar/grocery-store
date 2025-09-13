export const PaymentValidationRules = {
  validateCardNumber: (cardNumber) => {
    if (!cardNumber) {
      return { isValid: false, message: 'Card number is required' };
    }

    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (!/^\d{13,19}$/.test(cleaned)) {
      return { isValid: false, message: 'Card number must be 13-19 digits' };
    }
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return {
      isValid: sum % 10 === 0,
      message: sum % 10 === 0 ? 'Valid card number' : 'Invalid card number'
    };
  },

  validateExpiryDate: (expiryDate, clock) => {
    if (!expiryDate) {
      return { isValid: false, message: 'Expiry date is required' };
    }

    const cleaned = expiryDate.replace(/\D/g, '');
    
    if (!/^\d{4}$/.test(cleaned)) {
      return { isValid: false, message: 'Expiry date must be in MM/YY format' };
    }
    
    const month = parseInt(cleaned.substring(0, 2));
    const year = parseInt(cleaned.substring(2, 4));
    
    if (month < 1 || month > 12) {
      return { isValid: false, message: 'Invalid month' };
    }
    
    // Use provided clock or fallback to Date
    const now = clock ? clock.now() : new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { isValid: false, message: 'Card has expired' };
    }
    
    return { isValid: true, message: 'Valid expiry date' };
  },

  validateCVV: (cvv) => {
    if (!cvv) {
      return { isValid: false, message: 'CVV is required' };
    }

    const cleaned = cvv.replace(/\D/g, '');
    
    if (!/^\d{3,4}$/.test(cleaned)) {
      return { isValid: false, message: 'CVV must be 3-4 digits' };
    }
    
    return { isValid: true, message: 'Valid CVV' };
  },

  validateEmail: (email) => {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.includes('..')) {
      return { isValid: false, message: 'Invalid email format' };
    }
    return {
      isValid: emailRegex.test(email),
      message: emailRegex.test(email) ? 'Valid email' : 'Invalid email format'
    };
  },

  validatePhone: (phone) => {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    const cleaned = phone.replace(/\D/g, '');
    const phoneRegex = /^\d{10,15}$/;
    
    return {
      isValid: phoneRegex.test(cleaned),
      message: phoneRegex.test(cleaned) ? 'Valid phone number' : 'Phone number must be 10-15 digits'
    };
  },

  validateZIPCode: (zipCode) => {
    if (!zipCode) {
      return { isValid: false, message: 'ZIP code is required' };
    }

    const cleaned = zipCode.replace(/\D/g, '');
    const zipRegex = /^\d{5,10}$/;
    
    return {
      isValid: zipRegex.test(cleaned),
      message: zipRegex.test(cleaned) ? 'Valid ZIP code' : 'ZIP code must be 5-10 digits'
    };
  },

  validatePaymentMethod: (paymentMethod) => {
    const validMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'cod'];
    
    return {
      isValid: validMethods.includes(paymentMethod),
      message: validMethods.includes(paymentMethod) ? 'Valid payment method' : 'Invalid payment method'
    };
  },

  validatePaymentStatus: (paymentStatus) => {
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    return {
      isValid: validStatuses.includes(paymentStatus),
      message: validStatuses.includes(paymentStatus) ? 'Valid payment status' : 'Invalid payment status'
    };
  }
};

export const PaymentFormatters = {
  formatCardNumber: (value) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19); 
  },

  formatExpiryDate: (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  },

  formatCVV: (value) => {
    return value.replace(/\D/g, '').substring(0, 4);
  },

  formatPhone: (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    } else if (cleaned.length <= 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    }
  }
};

export const validatePaymentData = (paymentData, clock = null) => {
  const errors = {};
  
  const requiredFields = ['paymentMethod'];
  requiredFields.forEach(field => {
    if (!paymentData[field]) {
      errors[field] = `${field} is required`;
    }
  });

  if (paymentData.paymentMethod) {
    const methodValidation = PaymentValidationRules.validatePaymentMethod(paymentData.paymentMethod);
    if (!methodValidation.isValid) {
      errors.paymentMethod = methodValidation.message;
    }
  }

  if (paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') {
    const cardFields = ['cardNumber', 'expiryDate', 'cvv'];
    
    cardFields.forEach(field => {
      if (!paymentData[field]) {
        errors[field] = `${field} is required for card payments`;
      }
    });

    if (paymentData.cardNumber) {
      const cardValidation = PaymentValidationRules.validateCardNumber(paymentData.cardNumber);
      if (!cardValidation.isValid) {
        errors.cardNumber = cardValidation.message;
      }
    }

    if (paymentData.expiryDate) {
      const expiryValidation = PaymentValidationRules.validateExpiryDate(paymentData.expiryDate, clock);
      if (!expiryValidation.isValid) {
        errors.expiryDate = expiryValidation.message;
      }
    }

    if (paymentData.cvv) {
      const cvvValidation = PaymentValidationRules.validateCVV(paymentData.cvv);
      if (!cvvValidation.isValid) {
        errors.cvv = cvvValidation.message;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateOrderData = (orderData, clock) => {
  const errors = {};
  
  const requiredOrderFields = ['items', 'totalAmount', 'shippingAddress', 'paymentMethod'];
  requiredOrderFields.forEach(field => {
    if (!orderData[field]) {
      errors[field] = `${field} is required`;
    }
  });

  if (orderData.items && !Array.isArray(orderData.items)) {
    errors.items = 'Items must be an array';
  } else if (orderData.items && orderData.items.length === 0) {
    errors.items = 'Order must contain at least one item';
  }

  if (orderData.totalAmount && (isNaN(orderData.totalAmount) || orderData.totalAmount <= 0)) {
    errors.totalAmount = 'Total amount must be a positive number';
  }

  if (orderData.shippingAddress) {
    const addressFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    addressFields.forEach(field => {
      if (!orderData.shippingAddress[field]) {
        errors[`shippingAddress.${field}`] = `Shipping ${field} is required`;
      }
    });

    if (orderData.shippingAddress.email) {
      const emailValidation = PaymentValidationRules.validateEmail(orderData.shippingAddress.email);
      if (!emailValidation.isValid) {
        errors['shippingAddress.email'] = emailValidation.message;
      }
    }

    if (orderData.shippingAddress.phone) {
      const phoneValidation = PaymentValidationRules.validatePhone(orderData.shippingAddress.phone);
      if (!phoneValidation.isValid) {
        errors['shippingAddress.phone'] = phoneValidation.message;
      }
    }

    if (orderData.shippingAddress.zipCode) {
      const zipValidation = PaymentValidationRules.validateZIPCode(orderData.shippingAddress.zipCode);
      if (!zipValidation.isValid) {
        errors['shippingAddress.zipCode'] = zipValidation.message;
      }
    }
  }

  if (orderData.paymentMethod) {
    const paymentValidation = validatePaymentData({
      paymentMethod: orderData.paymentMethod,
      cardNumber: orderData.cardNumber,
      expiryDate: orderData.expiryDate,
      cvv: orderData.cvv
    }, clock);
    
    if (!paymentValidation.isValid) {
      Object.assign(errors, paymentValidation.errors);
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 

export const PAYMENT_METHODS = {
  credit_card: {
    id: 'credit_card',
    name: 'Credit/Debit Card',
    description: 'Pay with your credit or debit card',
    icon: 'credit-card',
    requiresCardDetails: true,
    enabled: true
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay securely with PayPal',
    icon: 'paypal',
    requiresCardDetails: false,
    enabled: true
  },
  cash_on_delivery: {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: 'truck',
    requiresCardDetails: false,
    enabled: true
  }
};

export const getEnabledPaymentMethods = () => {
  return Object.values(PAYMENT_METHODS).filter(method => method.enabled);
};

export const getPaymentMethod = (id) => {
  return PAYMENT_METHODS[id] || null;
}; 