import express from 'express';
import { AddressController } from '../controllers/AddressController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();
const addressController = new AddressController();

const addressValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Last name must be less than 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
];

router.use(authenticateToken);

router.get('/', addressController.getUserAddresses);

router.post('/', addressValidation, handleValidationErrors, addressController.saveAddress);

router.put('/:id', addressValidation, handleValidationErrors, addressController.updateAddress);

router.delete('/:id', addressController.deleteAddress);

router.put('/:id/default', addressController.setDefaultAddress);

export default router; 
