import { body, param, validationResult } from 'express-validator';
import { 
  validateUserRegistration,
  validateProduct,
  USER_RULES,
  PRODUCT_RULES
} from '@grocery-store/core/contracts';

// Firebase document ID validation function
// Based on Firebase constraints: https://firebase.google.com/docs/firestore/quotas
const isValidFirebaseDocumentId = (value) => {
  if (!value || value.trim() === '') return true;

  if (!value || typeof value !== 'string') return false;
  
  // Firebase document ID constraints:
  // - Must be valid UTF-8 characters
  // - Must be no longer than 1,500 bytes
  // - Cannot contain a forward slash (/)
  // - Cannot solely consist of a single period (.) or double periods (..)
  // - Cannot match the regular expression __.*__
  const firebaseIdPattern = /^(?!\.\.?$)(?!.*__.*__)([^/]{1,1500})$/;
  
  return firebaseIdPattern.test(value.trim());
};

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Express-validator rules using core business rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .trim()
    .isLength({ min: USER_RULES.NAME_MIN_LENGTH, max: USER_RULES.NAME_MAX_LENGTH })
    .withMessage(`First name must be between ${USER_RULES.NAME_MIN_LENGTH} and ${USER_RULES.NAME_MAX_LENGTH} characters`),
  body('lastName')
    .trim()
    .isLength({ min: USER_RULES.NAME_MIN_LENGTH, max: USER_RULES.NAME_MAX_LENGTH })
    .withMessage(`Last name must be between ${USER_RULES.NAME_MIN_LENGTH} and ${USER_RULES.NAME_MAX_LENGTH} characters`),
  body('password')
    .isLength({ min: USER_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${USER_RULES.PASSWORD_MIN_LENGTH} characters long`)
    .matches(USER_RULES.PASSWORD_PATTERN)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(USER_RULES.ROLES)
    .withMessage(`Role must be one of: ${USER_RULES.ROLES.join(', ')}`),
  body('phone')
    .optional()
    .custom((value) => {
      if (value && value.trim().length > 0) {
        if (!USER_RULES.PHONE_PATTERN.test(value.trim())) {
          throw new Error('Please provide a valid phone number');
        }
      }
      return true;
    }),
  body('address')
    .optional()
    .trim()
    .isLength({ max: USER_RULES.ADDRESS_MAX_LENGTH })
    .withMessage(`Address must be less than ${USER_RULES.ADDRESS_MAX_LENGTH} characters`),
  body('storeName')
    .if(body('role').equals('store_manager'))
    .trim()
    .isLength({ min: USER_RULES.STORE_NAME_MIN_LENGTH, max: USER_RULES.STORE_NAME_MAX_LENGTH })
    .withMessage(`Store name must be between ${USER_RULES.STORE_NAME_MIN_LENGTH} and ${USER_RULES.STORE_NAME_MAX_LENGTH} characters`),
  body('storeAddress')
    .if(body('role').equals('store_manager'))
    .trim()
    .isLength({ min: USER_RULES.STORE_ADDRESS_MIN_LENGTH, max: USER_RULES.STORE_ADDRESS_MAX_LENGTH })
    .withMessage(`Store address must be between ${USER_RULES.STORE_ADDRESS_MIN_LENGTH} and ${USER_RULES.STORE_ADDRESS_MAX_LENGTH} characters`)
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: USER_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(`New password must be at least ${USER_RULES.PASSWORD_MIN_LENGTH} characters long`)
    .matches(USER_RULES.PASSWORD_PATTERN)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: USER_RULES.NAME_MIN_LENGTH, max: USER_RULES.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${USER_RULES.NAME_MIN_LENGTH} and ${USER_RULES.NAME_MAX_LENGTH} characters`),
  body('phone')
    .optional()
    .custom((value) => {
      if (value && value.trim().length > 0) {
        if (!USER_RULES.PHONE_PATTERN.test(value.trim())) {
          throw new Error('Please provide a valid phone number');
        }
      }
      return true;
    }),
  body('address')
    .optional()
    .trim()
    .isLength({ max: USER_RULES.ADDRESS_MAX_LENGTH })
    .withMessage(`Address must be less than ${USER_RULES.ADDRESS_MAX_LENGTH} characters`)
];

export const productValidation = [
  body('name')
    .trim()
    .isLength({ min: PRODUCT_RULES.NAME_MIN_LENGTH, max: PRODUCT_RULES.NAME_MAX_LENGTH })
    .withMessage(`Product name must be between ${PRODUCT_RULES.NAME_MIN_LENGTH} and ${PRODUCT_RULES.NAME_MAX_LENGTH} characters`),
  body('description')
    .trim()
    .isLength({ min: PRODUCT_RULES.DESCRIPTION_MIN_LENGTH, max: PRODUCT_RULES.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Product description must be between ${PRODUCT_RULES.DESCRIPTION_MIN_LENGTH} and ${PRODUCT_RULES.DESCRIPTION_MAX_LENGTH} characters`),
  body('price')
    .isFloat({ min: PRODUCT_RULES.PRICE_MIN, max: PRODUCT_RULES.PRICE_MAX })
    .withMessage(`Price must be between ${PRODUCT_RULES.PRICE_MIN} and ${PRODUCT_RULES.PRICE_MAX}`),
  body('categoryId')
    .custom(isValidFirebaseDocumentId)
    .withMessage('Category ID must be a valid Firebase document ID'),
  body('sku')
    .trim()
    .isLength({ min: PRODUCT_RULES.SKU_MIN_LENGTH, max: PRODUCT_RULES.SKU_MAX_LENGTH })
    .withMessage(`SKU must be between ${PRODUCT_RULES.SKU_MIN_LENGTH} and ${PRODUCT_RULES.SKU_MAX_LENGTH} characters`)
    .matches(PRODUCT_RULES.SKU_PATTERN)
    .withMessage('SKU must contain only uppercase letters, numbers, and hyphens'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barcode must be less than 100 characters'),
  body('unit')
    .optional()
    .isIn(PRODUCT_RULES.UNITS)
    .withMessage(`Unit must be one of: ${PRODUCT_RULES.UNITS.join(', ')}`),
  body('weight')
    .optional()
    .isFloat({ min: PRODUCT_RULES.WEIGHT_MIN, max: PRODUCT_RULES.WEIGHT_MAX })
    .withMessage(`Weight must be between ${PRODUCT_RULES.WEIGHT_MIN} and ${PRODUCT_RULES.WEIGHT_MAX}`),
  body('stock')
    .isInt({ min: PRODUCT_RULES.STOCK_MIN })
    .withMessage('Stock must be a non-negative integer'),
  body('minStock')
    .optional()
    .isInt({ min: PRODUCT_RULES.STOCK_MIN })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('maxStock')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum stock must be a positive integer'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .custom((value) => {
      // More flexible patterns
      const urlPattern = /^https?:\/\/.+/;
      const dataUrlPattern = /^data:image\/[a-zA-Z0-9]+;base64,.+/;
      
      // Check if it's a valid HTTP/HTTPS URL
      if (urlPattern.test(value)) return true;
      // Check if it's a valid data URL
      if (dataUrlPattern.test(value)) return true;
      // If neither pattern matches, it's invalid
      return false;
    })
    .withMessage('Each image must be a valid URL or data URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: PRODUCT_RULES.TAG_MIN_LENGTH, max: PRODUCT_RULES.TAG_MAX_LENGTH })
    .withMessage(`Each tag must be between ${PRODUCT_RULES.TAG_MIN_LENGTH} and ${PRODUCT_RULES.TAG_MAX_LENGTH} characters`),
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number'),
  body('discountStartDate')
    .optional()
    .isISO8601()
    .withMessage('Discount start date must be a valid date'),
  body('discountEndDate')
    .optional()
    .isISO8601()
    .withMessage('Discount end date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Manufacturer must be less than 255 characters'),
  body('countryOfOrigin')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country of origin must be less than 100 characters')
];

export const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description must be less than 500 characters'),
  body('parentId')
    .optional()
    .custom(isValidFirebaseDocumentId)
    .withMessage('Parent category ID must be a valid Firebase document ID')
];

export const categoryIdValidation = [
  param('id')
    .custom(isValidFirebaseDocumentId)
    .withMessage('Category ID must be a valid Firebase document ID')
];

export const productIdValidation = [
  param('id')
    .custom(isValidFirebaseDocumentId)
    .withMessage('Product ID must be a valid Firebase document ID')
];

export const stockValidation = [
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

export const paginationValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const searchValidation = [
  body('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

// Core validation middleware (alternative to express-validator)
export const validateRegistrationWithCore = (req, res, next) => {
  const validation = validateUserRegistration(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.entries(validation.errors).map(([field, message]) => ({
        field,
        message,
        value: req.body[field]
      }))
    });
  }
  next();
};

export const validateProductWithCore = (req, res, next) => {
  const validation = validateProduct(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.entries(validation.errors).map(([field, message]) => ({
        field,
        message,
        value: req.body[field]
      }))
    });
  }
  next();
};
