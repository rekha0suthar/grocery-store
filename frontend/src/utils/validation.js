// Frontend validation utilities that match backend validation rules

export const validationRules = {
  email: {
    required: 'Email is required',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please provide a valid email address'
  },
  
  name: {
    required: 'Name is required',
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters'
  },
  
  password: {
    required: 'Password is required',
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  },
  
  phone: {
    required: 'Phone number is required',
    pattern: /^[+]?[1-9][\d]{0,15}$/,
    message: 'Please provide a valid phone number'
  },
  
  role: {
    required: 'Please select an account type',
    options: ['admin', 'store_manager', 'customer'],
    message: 'Role must be admin, store_manager, or customer'
  },
  
  address: {
    maxLength: 500,
    message: 'Address must be less than 500 characters'
  }
};

export const validateField = (fieldName, value, rules = validationRules) => {
  const rule = rules[fieldName];
  if (!rule) return null;

  // Required validation
  if (rule.required && (!value || value.trim() === '')) {
    return rule.required;
  }

  // Skip other validations if value is empty and not required
  if (!value || value.trim() === '') {
    return null;
  }

  // Length validations
  if (rule.minLength && value.length < rule.minLength) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rule.minLength} characters`;
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${rule.maxLength} characters`;
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    return rule.message;
  }

  // Options validation (for select fields)
  if (rule.options && !rule.options.includes(value)) {
    return rule.message;
  }

  return null;
};

export const validateForm = (data, rules = validationRules) => {
  const errors = {};
  
  Object.keys(data).forEach(field => {
    const error = validateField(field, data[field], rules);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Specific validation functions for common use cases
export const validateRegistration = (data) => {
  const rules = {
    ...validationRules,
    firstName: {
      required: 'First name is required',
      minLength: 2,
      message: 'First name must be at least 2 characters'
    },
    lastName: {
      required: 'Last name is required',
      minLength: 2,
      message: 'Last name must be at least 2 characters'
    },
    confirmPassword: {
      required: 'Please confirm your password',
      message: 'Passwords do not match'
    }
  };

  const errors = {};

  // Validate individual fields
  Object.keys(data).forEach(field => {
    if (field === 'confirmPassword') {
      if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      const error = validateField(field, data[field], rules);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLogin = (data) => {
  const rules = {
    email: validationRules.email,
    password: {
      required: 'Password is required',
      minLength: 6,
      message: 'Password must be at least 6 characters'
    }
  };

  return validateForm(data, rules);
};
