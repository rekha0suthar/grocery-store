import express from 'express';
import { 
  getPaymentContracts, 
  getPaymentContract,
  makeProcessPaymentUseCase,
  makeCapturePaymentUseCase,
  makeRefundPaymentUseCase
} from '../composition/PaymentComposition.js';

const router = express.Router();

router.get('/methods', (req, res) => {
  try {
    const methods = getPaymentContracts();
    res.json({ 
      success: true, 
      data: { methods },
      count: methods.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/methods/:methodId', (req, res) => {
  try {
    const { methodId } = req.params;
    const contract = getPaymentContract(methodId);
    
    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment method not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: { contract } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/process', async (req, res) => {
  try {
    const { 
      methodId, 
      amount, 
      currency = 'USD', 
      fields = {}, 
      orderId, 
      customerId, 
      metadata = {} 
    } = req.body;

    if (!methodId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment method ID is required' 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order ID is required' 
      });
    }

    const useCase = makeProcessPaymentUseCase(methodId);
    const result = await useCase.execute({
      methodId,
      amount,
      currency,
      fields,
      orderId,
      customerId,
      metadata
    });

    res.json({ 
      success: true, 
      data: { result } 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/capture', async (req, res) => {
  try {
    const { intentId, amount, currency = 'USD' } = req.body;

    if (!intentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment intent ID is required' 
      });
    }

    const paymentRepo = require('../composition/PaymentComposition.js').getPaymentRepository();
    const paymentIntent = await paymentRepo.findByExternalId(intentId);
    
    if (!paymentIntent) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment intent not found' 
      });
    }

    const useCase = makeCapturePaymentUseCase(paymentIntent.methodId);
    const result = await useCase.execute({
      intentId: paymentIntent.id,
      amount,
      currency
    });

    res.json({ 
      success: true, 
      data: { result } 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, currency = 'USD', reason = 'Refund requested' } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment ID is required' 
      });
    }

    const paymentRepo = require('../composition/PaymentComposition.js').getPaymentRepository();
    const paymentIntent = await paymentRepo.findByExternalId(paymentId);
    
    if (!paymentIntent) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment not found' 
      });
    }

    const useCase = makeRefundPaymentUseCase(paymentIntent.methodId);
    const result = await useCase.execute({
      paymentId,
      amount,
      currency,
      reason
    });

    res.json({ 
      success: true, 
      data: { result } 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
