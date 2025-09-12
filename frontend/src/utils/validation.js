
export { 
  PaymentValidationRules, 
  PaymentFormatters, 
  validatePaymentData, 
  validateOrderData,
  PAYMENT_METHODS,
  getEnabledPaymentMethods,
  getPaymentMethod
} from '@grocery-store/core/contracts/payment.validation.js';

export { 
  validateUserRegistration,
  validateUserLogin,
  validateUserProfile,
  USER_RULES
} from '@grocery-store/core/contracts/user.validation.js';

export { 
  validateProduct,
  PRODUCT_RULES
} from '@grocery-store/core/contracts/product.validation.js';

export function formatValidationErrors(validationResult) {
  if (validationResult.isValid) {
    return { isValid: true, errors: {} };
  }
  
  const formatted = {};
  Object.entries(validationResult.errors).forEach(([field, message]) => { 
    const fieldName = field.includes('.') ? field.split('.').pop() : field;
    formatted[fieldName] = message;
  });
  
  return {
    isValid: false,
    errors: formatted
  };
}

export function validateField(fieldName, value, validationType = 'user') {  
  let validation;
  if (validationType === 'user') {
    validation = { isValid: true, message: "Valid" }; // TODO: Add proper validation
  } else if (validationType === 'product') {
    validation = { isValid: true, message: "Valid" }; // TODO: Add proper validation
  }
  
  return validation.errors[fieldName] || null;
} 
