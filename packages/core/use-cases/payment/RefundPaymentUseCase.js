import { PaymentResult } from '../../entities/Payment.js';

/**
 * Refund Payment Use Case
 * Handles payment refund operations
 */
export class RefundPaymentUseCase {
  constructor(paymentIntentRepo, paymentProvider, clock) {
    this.paymentIntentRepo = paymentIntentRepo;
    this.paymentProvider = paymentProvider;
    this.clock = clock;
  }

  /**
   * Execute refund payment
   * @param {Object} params - Refund parameters
   * @param {string} params.paymentId - Payment ID to refund
   * @param {Money} params.amount - Refund amount
   * @param {string} params.reason - Refund reason
   * @returns {Promise<PaymentResult>} Refund result
   */
  async execute({ paymentId, amount, reason }) {
    try {
      // Find the payment intent
      const paymentIntent = await this.paymentIntentRepo.findById(paymentId);
      if (!paymentIntent) {
        return new PaymentResult({
          status: 'failed',
          error: 'Payment intent not found'
        }, this.clock);
      }

      // Validate refund amount
      if (amount.amount > paymentIntent.amount.amount) {
        return new PaymentResult({
          status: 'failed',
          error: 'Refund amount cannot exceed payment amount'
        }, this.clock);
      }

      // Check if payment can be refunded
      if (paymentIntent.status !== 'captured') {
        return new PaymentResult({
          status: 'failed',
          error: 'Only captured payments can be refunded'
        }, this.clock);
      }

      // Process refund with payment provider
      const refundResult = await this.paymentProvider.refund({
        paymentId: paymentIntent.externalId,
        amount,
        reason
      });

      if (refundResult.isSuccess()) {
        // Update payment intent status
        paymentIntent.status = 'refunded';
        paymentIntent.updatedAt = this.clock.now();
        await this.paymentIntentRepo.update(paymentIntent);
      }

      return refundResult;

    } catch (error) {
      return new PaymentResult({
        status: 'failed',
        error: error.message || 'Refund failed'
      }, this.clock);
    }
  }
}
