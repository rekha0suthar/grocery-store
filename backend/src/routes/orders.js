import express from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { 
  orderValidation, 
  orderIdValidation,
  paginationValidation,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();
const orderController = new OrderController();

router.post('/', authenticateToken, orderValidation, handleValidationErrors, orderController.createOrder);

router.get('/my-orders', authenticateToken, paginationValidation, handleValidationErrors, orderController.getUserOrders);

router.get('/', authenticateToken, requireAdmin, paginationValidation, handleValidationErrors, orderController.getAllOrders);

router.get('/:id', authenticateToken, orderIdValidation, handleValidationErrors, orderController.getOrderById);

router.put('/:id/status', authenticateToken, requireAdmin, orderIdValidation, handleValidationErrors, orderController.updateOrderStatus);

router.get('/stats/overview', authenticateToken, requireAdmin, orderController.getOrderStats);

router.put('/:id/cancel', authenticateToken, orderIdValidation, handleValidationErrors, orderController.cancelOrder);

export default router; 
