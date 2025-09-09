import express from 'express';
import { RequestController } from '../controllers/RequestController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
const requestController = new RequestController();

// Apply authentication to all routes
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/my-requests', requestController.getMyRequests);
router.post('/store-manager', requestController.createStoreManagerRequest);

// Store manager routes (store managers can create category requests)
router.post('/category', requireRole(['store_manager', 'admin']), requestController.createCategoryRequest);

// Admin routes
router.get('/', requireRole('admin'), requestController.getAllRequests);
router.get('/pending', requireRole('admin'), requestController.getPendingRequests);
router.get('/stats', requireRole('admin'), requestController.getRequestStats);
router.get('/:id', requireRole('admin'), requestController.getRequestById);
router.post('/:id/approve', requireRole('admin'), requestController.approveRequest);

export default router;
