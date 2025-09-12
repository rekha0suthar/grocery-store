import express from 'express';
import authRouter from './auth.js';
import productsRouter from './products.js';
import categoriesRouter from './categories.js';
import ordersRouter from './orders.js';
import requestsRouter from './requests.js';
import configRouter from './config.js';
import addressesRouter from './addresses.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Grocery Store API'
  });
});

// API routes
router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/orders', ordersRouter);
router.use('/requests', requestsRouter);
router.use('/config', configRouter);
router.use('/addresses', addressesRouter);

export default router;
