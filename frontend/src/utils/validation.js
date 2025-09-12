// Frontend validation - Direct usage of core validation functions
import { 
  validateUserRegistration,
  validateUserLogin,
  validateUserProfile,
  validateProduct,
  USER_RULES,
  PRODUCT_RULES
} from '@grocery-store/core/contracts';

// Re-export for easy access
export {
  validateUserRegistration,
  validateUserLogin,
  validateUserProfile,
  validateProduct,
  USER_RULES,
  PRODUCT_RULES
};

// Helper function to format validation errors for forms
export function formatValidationErrors(validationResult) {
  return Object.entries(validationResult.errors).map(([field, message]) => ({
    field,
    message,
    value: ''
  }));
}

// Helper function for field-level validation
export function validateField(fieldName, value, validationType = 'user') {
  const testData = { [fieldName]: value };
  
  let validation;
  if (validationType === 'user') {
    validation = validateUserRegistration(testData);
  } else if (validationType === 'product') {
    validation = validateProduct(testData);
  }
  
  return validation.errors[fieldName] || null;
} 