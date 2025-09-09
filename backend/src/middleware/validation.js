import { body, param, query, validationResult } from 'express-validator';

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

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'store_manager', 'customer'])
    .withMessage('Role must be admin, store_manager, or customer'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters')
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
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters')
];

export const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Product description must be between 10 and 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category ID must be a valid UUID'),
  body('sku')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('SKU must be between 3 and 100 characters')
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barcode must be less than 100 characters'),
  body('unit')
    .optional()
    .isIn(['piece', 'kg', 'g', 'liter', 'ml', 'box', 'pack', 'dozen'])
    .withMessage('Unit must be one of: piece, kg, g, liter, ml, box, pack, dozen'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
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
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
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

export const stockValidation = [
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

export const productIdValidation = [
  param('id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Product ID must be a valid UUID')
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be a valid UUID'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean')
];

export const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Category name must be between 2 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Category description must be between 10 and 1000 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('parentId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Parent ID must be a valid UUID'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean')
];

export const categoryIdValidation = [
  param('id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category ID must be a valid UUID')
];

export const cartItemValidation = [
  body('productId')
    .isLength({ min: 1, max: 100 })
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

export const cartIdValidation = [
  param('id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Cart ID must be a valid UUID')
];

export const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isLength({ min: 1, max: 100 })
    .withMessage('Each item must have a valid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item must have a positive quantity'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Street address must be between 5 and 255 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('shippingAddress.zipCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('ZIP code must be between 3 and 20 characters'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
    .withMessage('Payment method must be one of: credit_card, debit_card, paypal, cash_on_delivery'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

export const orderIdValidation = [
  param('id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Order ID must be a valid UUID')
];

export const requestValidation = [
  body('type')
    .isIn(['store_manager_approval', 'category_creation', 'category_modification'])
    .withMessage('Request type must be one of: store_manager_approval, category_creation, category_modification'),
  body('requestData')
    .isObject()
    .withMessage('Request data is required'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, normal, high, urgent'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

export const requestIdValidation = [
  param('id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Request ID must be a valid UUID')
];

export const requestActionValidation = [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  body('response')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Response must be less than 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];
