import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  registerValidation, 
  loginValidation, 
  changePasswordValidation, 
  updateProfileValidation,
  handleValidationErrors 
} from '../middleware/validation.js';

const router = express.Router();
const authController = new AuthController();

router.post('/initialize', registerValidation, handleValidationErrors, authController.initializeSystem);
router.get('/initialization-status', authController.checkInitializationStatus);

router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.post('/logout', authController.logout);

router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, handleValidationErrors, authController.updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, handleValidationErrors, authController.changePassword);

router.get('/store-manager-requests', authenticateToken, authController.getPendingStoreManagerRequests);
router.put('/store-manager-requests/:requestId', authenticateToken, authController.approveStoreManagerRequest);

export default router;
