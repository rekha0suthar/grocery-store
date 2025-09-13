import express from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { authenticateToken, requireStoreManager } from '../middleware/auth.js';
import { 
  productValidation, 
  stockValidation, 
  productIdValidation,
  paginationValidation,
  searchValidation,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();
const productController = new ProductController();

router.get('/', paginationValidation, handleValidationErrors, productController.getAllProducts);
router.get('/featured', paginationValidation, handleValidationErrors, productController.getFeaturedProducts);
router.get('/search', searchValidation, handleValidationErrors, productController.searchProducts);
router.get('/:id', productIdValidation, handleValidationErrors, productController.getProductById);

router.use(authenticateToken);

router.post('/', requireStoreManager, productValidation, handleValidationErrors, productController.createProduct);
router.put('/:id', requireStoreManager, productIdValidation, handleValidationErrors, productController.updateProduct);
router.delete('/:id', requireStoreManager, productIdValidation, handleValidationErrors, productController.deleteProduct);
router.put('/:id/stock', requireStoreManager, productIdValidation, stockValidation, handleValidationErrors, productController.updateStock);
router.get('/admin/low-stock', requireStoreManager, productController.getLowStockProducts);

export default router;
