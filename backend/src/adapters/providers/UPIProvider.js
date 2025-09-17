import { PaymentResult } from '@grocery-store/core/entities/Payment.js';

/**
 * UPI Payment Provider
 * Handles UPI payment processing
 */
export class UPIProvider {
  supports(methodId) {
    return methodId === 'upi';
  }

  async authorize({ _amount, _currency, fields, _orderId, _customerId, _metadata }) {
    try {
      const { vpa } = fields;
      
      // Validate UPI ID format
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(vpa)) {
        return new PaymentResult({
          status: 'failed',
          error: 'Invalid UPI ID format'
        });
      }

      // Simulate UPI authorization
      return new PaymentResult({
        status: 'authorized',
        externalId: `upi_${Date.now()}`,
        receiptUrl: `https://upi.com/receipts/${Date.now()}`,
        error: null
      });
    } catch (error) {
      return new PaymentResult({
        status: 'failed',
        error: error.message
      });
    }
  }

  async capture({ intentId, _amount }) {
    try {
      if (!intentId) {
        return new PaymentResult({
          status: 'failed',
          error: 'Intent ID is required for capture'
        });
      }

      return new PaymentResult({
        status: 'captured',
        externalId: intentId,
        receiptUrl: `https://upi.com/receipts/${intentId}`,
        error: null
      });
    } catch (error) {
      return new PaymentResult({
        status: 'failed',
        error: error.message
      });
    }
  }

  async refund({ _paymentId, _amount, _reason }) {
    // UPI refund implementation would go here
    throw new Error('Refund not implemented for UPI provider');
  }

  async markPending({ _amount, _currency, _orderId, _metadata }) {
    // UPI doesn't use pending status
    throw new Error('Mark pending not supported for UPI provider');
  }
}
