// Frontend validation utilities using shared core validators
import { 
  validateUserForm, 
  validateRegistrationForm, 
  validateLoginForm,
  ROLES,
  isValidEmail,
  isValidName,
  isValidRole,
  isValidPhone,
  isValidPassword
} from '@grocery-store/core/contracts';

// Helper function to map validation errors to form field errors
export function mapValidationErrors(validationResult) {
  if (validationResult.ok) {
    return {};
  }
  
  return validationResult.errors;
}

// Registration form validation with enhanced error handling
export function validateRegistration(data) {
  const errors = {};

  
  // Validate lastName (optional - only validate if provided)
  if (data.lastName && data.lastName.trim().length > 0 && data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters if provided';
  }

  // Validate email using shared validator
  if (!isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Validate phone using shared validator
  if (!isValidPhone(data.phone)) {
    errors.phone = 'Please provide a valid phone number';
  }

  // Validate role using shared validator
  if (!isValidRole(data.role || 'customer')) {
    errors.role = 'Role must be admin, store_manager, or customer';
  }

  // Validate password using shared validator
  if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters with uppercase, lowercase, and number';
  }

  // Validate password confirmation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Login form validation
export function validateLogin(data) {
  const result = validateLoginForm(data);
  return {
    isValid: result.ok,
    errors: mapValidationErrors(result)
  };
}

// User profile validation
export function validateUserProfile(data) {
  const result = validateUserForm(data);
  return {
    isValid: result.ok,
    errors: mapValidationErrors(result)
  };
}

// Export roles for frontend use
export { ROLES };

// Helper function to get role display name
export function getRoleDisplayName(role) {
  const roleNames = {
    admin: 'Administrator',
    store_manager: 'Store Manager',
    customer: 'Customer'
  };
  return roleNames[role] || 'Unknown';
}

// Helper function to get role options for forms
export function getRoleOptions() {
  return ROLES.map(role => ({
    value: role,
    label: getRoleDisplayName(role),
    description: getRoleDescription(role)
  }));
}

// Helper function to get role descriptions
export function getRoleDescription(role) {
  const descriptions = {
    admin: 'Full system access and management capabilities',
    store_manager: 'Manage store operations, products, and requests',
    customer: 'Shop for groceries and manage personal account'
  };
  return descriptions[role] || '';
}

// Real-time validation helpers for better UX
export function validateField(fieldName, value, allData = {}) {
  const validation = validateRegistration({ ...allData, [fieldName]: value });
  return {
    isValid: !validation.errors[fieldName],
    error: validation.errors[fieldName] || null
  };
}

// Password strength indicator
export function getPasswordStrength(password) {
  if (!password) return { strength: 0, label: '', color: '' };
  
  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  const levels = [
    { strength: 0, label: 'Very Weak', color: 'text-red-500' },
    { strength: 1, label: 'Weak', color: 'text-red-400' },
    { strength: 2, label: 'Fair', color: 'text-yellow-500' },
    { strength: 3, label: 'Good', color: 'text-blue-500' },
    { strength: 4, label: 'Strong', color: 'text-green-500' },
    { strength: 5, label: 'Very Strong', color: 'text-green-600' }
  ];
  
  return levels[strength] || levels[0];
}
