import express from 'express';
import { ConfigController } from '../controllers/ConfigController.js';

const router = express.Router();
const configController = new ConfigController();

router.get('/', configController.getConfig);
router.get('/health', configController.getHealth);
router.get('/environment', configController.getEnvironment);

export default router;
