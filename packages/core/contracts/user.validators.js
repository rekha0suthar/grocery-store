export const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PHONE_RE = /^[+]?[1-9][\d\s\-()]{7,15}$/;
export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

const ROLES = ['admin', 'store_manager', 'customer'];

export function isValidEmail(email) {
  return typeof email === 'string' && 
         email.trim().length > 0 && 
         EMAIL_RE.test(email.trim());
}

export function isValidName(name) {
  return typeof name === 'string' && 
         name.trim().length >= 2 && 
         name.trim().length <= 100;
}

export function isValidRole(role) {
  return ROLES.includes(role);
}

export function isValidPhone(phone) {
  if (!phone || phone.trim() === '') return true;
  return typeof phone === 'string' && PHONE_RE.test(phone.trim());
}

export function isValidPassword(password) {
  return typeof password === 'string' && 
         password.length >= 6 && 
         PASSWORD_RE.test(password);
}

export function isValidAddress(address) {
  if (!address || address.trim() === '') return true;
  return typeof address === 'string' && address.trim().length <= 500;
}

export function validateUserForm(input) {
  const issues = [];
  
  if (!isValidEmail(input?.email)) {
    issues.push({ 
      field: 'email', 
      code: 'EMAIL_INVALID',
      message: 'Please provide a valid email address'
    });
  }
  
  if (!isValidName(input?.name)) {
    issues.push({ 
      field: 'name', 
      code: 'NAME_INVALID',
      message: 'Name must be between 2 and 100 characters'
    });
  }
  
  if (!isValidRole(input?.role ?? 'customer')) {
    issues.push({ 
      field: 'role', 
      code: 'ROLE_INVALID',
      message: 'Role must be admin, store_manager, or customer'
    });
  }
  
  if (!isValidPhone(input?.phone)) {
    issues.push({ 
      field: 'phone', 
      code: 'PHONE_INVALID',
      message: 'Please provide a valid phone number'
    });
  }
  
  if (!isValidAddress(input?.address)) {
    issues.push({ 
      field: 'address', 
      code: 'ADDRESS_INVALID',
      message: 'Address must be less than 500 characters'
    });
  }
  
  return { 
    ok: issues.length === 0, 
    issues,
    errors: issues.reduce((acc, issue) => {
      acc[issue.field] = issue.message;
      return acc;
    }, {})
  };
}

export function validateRegistrationForm(input) {
  const userValidation = validateUserForm(input);
  const issues = [...userValidation.issues];
  
  if (!isValidPassword(input?.password)) {
    issues.push({ 
      field: 'password', 
      code: 'PASSWORD_INVALID',
      message: 'Password must be at least 6 characters with uppercase, lowercase, and number'
    });
  }
  
  if (input?.password !== input?.confirmPassword) {
    issues.push({ 
      field: 'confirmPassword', 
      code: 'PASSWORD_MISMATCH',
      message: 'Passwords do not match'
    });
  }
  
  return { 
    ok: issues.length === 0, 
    issues,
    errors: issues.reduce((acc, issue) => {
      acc[issue.field] = issue.message;
      return acc;
    }, {})
  };
}

export function validateLoginForm(input) {
  const issues = [];
  
  if (!isValidEmail(input?.email)) {
    issues.push({ 
      field: 'email', 
      code: 'EMAIL_INVALID',
      message: 'Please provide a valid email address'
    });
  }
  
  if (!input?.password || input.password.length < 6) {
    issues.push({ 
      field: 'password', 
      code: 'PASSWORD_REQUIRED',
      message: 'Password is required'
    });
  }
  
  return { 
    ok: issues.length === 0, 
    issues,
    errors: issues.reduce((acc, issue) => {
      acc[issue.field] = issue.message;
      return acc;
    }, {})
  };
}

export { ROLES };
