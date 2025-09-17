import { PaymentResult } from '@grocery-store/core/entities/Payment.js';

/**
 * Cash on Delivery Payment Provider
 * Handles COD payment processing
 */
export class CashOnDeliveryProvider {
  supports(methodId) {
    return methodId === 'cash_on_delivery';
  }

  async authorize({ _amount, _currency, _fields, _orderId, _customerId, _metadata }) {
    // COD doesn't require authorization, just mark as pending
    return new PaymentResult({
      status: 'pending',
      externalId: `cod_${Date.now()}`,
      receiptUrl: null,
      error: null
    });
  }

  async capture({ _intentId, _amount }) {
    // COD doesn't support capture
    throw new Error('Capture not supported for Cash on Delivery');
  }

  async refund({ _paymentId, _amount, _reason }) {
    // COD doesn't support refunds
    throw new Error('Refunds not supported for Cash on Delivery');
  }

  async markPending({ _amount, _currency, _orderId, _metadata }) {
    // COD is always pending until delivery
    return new PaymentResult({
      status: 'pending',
      externalId: `cod_${Date.now()}`,
      receiptUrl: null,
      error: null
    });
  }
}
