import express from 'express';
import { RequestController } from '../controllers/RequestController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const requestController = new RequestController();

router.use(authenticateToken);

router.get('/my-requests', requestController.getMyRequests);
router.post('/store-manager', requestController.createStoreManagerRequest);
router.post('/category', requireRole(['store_manager', 'admin']), requestController.createCategoryRequest);

router.get('/', requireRole('admin'), requestController.getAllRequests);
router.get('/pending', requireRole('admin'), requestController.getPendingRequests);
router.get('/stats', requireRole('admin'), requestController.getRequestStats);
router.get('/:id', requireRole('admin'), requestController.getRequestById);
router.patch('/:id/approve', requireRole('admin'), requestController.approveRequest);
router.patch('/:id/reject', requireRole('admin'), requestController.approveRequest);

export default router;
