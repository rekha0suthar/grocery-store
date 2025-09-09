import express from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import configRoutes from './config.js';
import requestRoutes from './requests.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Grocery Store API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      config: '/api/config',
      requests: '/api/requests'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/config', configRoutes);
router.use('/requests', requestRoutes);

export default router;
