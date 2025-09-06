import express from 'express';
import { CategoryController } from '../controllers/CategoryController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  categoryValidation, 
  categoryIdValidation,
  paginationValidation,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', paginationValidation, handleValidationErrors, categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:id', categoryIdValidation, handleValidationErrors, categoryController.getCategoryById);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin only routes
router.post('/', requireAdmin, categoryValidation, handleValidationErrors, categoryController.createCategory);
router.put('/:id', requireAdmin, categoryIdValidation, handleValidationErrors, categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryIdValidation, handleValidationErrors, categoryController.deleteCategory);

export default router;
