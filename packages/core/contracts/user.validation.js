// User validation business rules - Single source of truth for user validation

// Business constants
export const USER_RULES = {
  EMAIL_PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_PATTERN: /^[+]?[1-9][\d\s\-()]{7,15}$/,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  
  ROLES: ['admin', 'store_manager', 'customer'],
  
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_MIN_LENGTH: 7,
  PHONE_MAX_LENGTH: 15,
  ADDRESS_MAX_LENGTH: 500,
  STORE_NAME_MIN_LENGTH: 2,
  STORE_NAME_MAX_LENGTH: 100,
  STORE_ADDRESS_MIN_LENGTH: 10,
  STORE_ADDRESS_MAX_LENGTH: 500
};

// Individual validation functions
export function isValidEmail(email) {
  return typeof email === 'string' && 
         email.trim().length > 0 && 
         USER_RULES.EMAIL_PATTERN.test(email.trim());
}

export function isValidName(name) {
  return typeof name === 'string' && 
         name.trim().length >= USER_RULES.NAME_MIN_LENGTH && 
         name.trim().length <= USER_RULES.NAME_MAX_LENGTH;
}

export function isValidRole(role) {
  return USER_RULES.ROLES.includes(role);
}

export function isValidPhone(phone) {
  if (!phone || phone.trim() === '') return true;
  // More flexible phone validation that accepts various formats
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return typeof phone === 'string' && 
         cleanPhone.length >= USER_RULES.PHONE_MIN_LENGTH &&
         cleanPhone.length <= USER_RULES.PHONE_MAX_LENGTH &&
         /^[+]?[1-9]\d{6,14}$/.test(cleanPhone);
}

export function isValidPassword(password) {
  return typeof password === 'string' && 
         password.length >= USER_RULES.PASSWORD_MIN_LENGTH && 
         USER_RULES.PASSWORD_PATTERN.test(password);
}

export function isValidAddress(address) {
  if (!address || address.trim() === '') return true;
  return typeof address === 'string' && 
         address.trim().length <= USER_RULES.ADDRESS_MAX_LENGTH;
}

export function isValidStoreName(storeName) {
  return typeof storeName === 'string' && 
         storeName.trim().length >= USER_RULES.STORE_NAME_MIN_LENGTH && 
         storeName.trim().length <= USER_RULES.STORE_NAME_MAX_LENGTH;
}

export function isValidStoreAddress(storeAddress) {
  return typeof storeAddress === 'string' && 
         storeAddress.trim().length >= USER_RULES.STORE_ADDRESS_MIN_LENGTH && 
         storeAddress.trim().length <= USER_RULES.STORE_ADDRESS_MAX_LENGTH;
}

// Comprehensive validation functions
export function validateUserRegistration(data) {
  const errors = {};

  // Required fields
  if (!isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!isValidName(data.firstName)) {
    errors.firstName = `First name must be between ${USER_RULES.NAME_MIN_LENGTH} and ${USER_RULES.NAME_MAX_LENGTH} characters`;
  }

  if (!isValidPassword(data.password)) {
    errors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
  }

  if (!isValidRole(data.role)) {
    errors.role = `Role must be one of: ${USER_RULES.ROLES.join(', ')}`;
  }

  // Optional fields
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please provide a valid phone number';
  }

  if (data.address && !isValidAddress(data.address)) {
    errors.address = `Address must be less than ${USER_RULES.ADDRESS_MAX_LENGTH} characters`;
  }

  // Password confirmation
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Store manager specific fields
  if (data.role === 'store_manager') {
    if (!isValidStoreName(data.storeName)) {
      errors.storeName = `Store name must be between ${USER_RULES.STORE_NAME_MIN_LENGTH} and ${USER_RULES.STORE_NAME_MAX_LENGTH} characters`;
    }
    if (!isValidStoreAddress(data.storeAddress)) {
      errors.storeAddress = `Store address must be between ${USER_RULES.STORE_ADDRESS_MIN_LENGTH} and ${USER_RULES.STORE_ADDRESS_MAX_LENGTH} characters`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateUserLogin(data) {
  const errors = {};

  if (!isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password || data.password.length < USER_RULES.PASSWORD_MIN_LENGTH) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateUserProfile(data) {
  const errors = {};

  if (data.name && !isValidName(data.name)) {
    errors.name = `Name must be between ${USER_RULES.NAME_MIN_LENGTH} and ${USER_RULES.NAME_MAX_LENGTH} characters`;
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please provide a valid phone number';
  }

  if (data.address && !isValidAddress(data.address)) {
    errors.address = `Address must be less than ${USER_RULES.ADDRESS_MAX_LENGTH} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
