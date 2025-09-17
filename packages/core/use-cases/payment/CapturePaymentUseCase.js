import { PaymentResult } from '../../entities/Payment.js';
import { Money } from '../../entities/Money.js';

/**
 * Capture Payment Use Case
 * Captures a previously authorized payment
 */
export class CapturePaymentUseCase {
  constructor({ paymentProvider, paymentIntentRepo, clock }) {
    this.paymentProvider = paymentProvider;
    this.paymentIntentRepo = paymentIntentRepo;
    this.clock = clock;
  }

  /**
   * Capture a payment
   * @param {Object} params - Capture parameters
   * @param {string} params.intentId - Payment intent identifier
   * @param {number} params.amount - Amount to capture (optional)
   * @param {string} params.currency - Currency code
   * @returns {Promise<PaymentResult>} - Capture result
   */
  async execute({ intentId, amount, currency }) {
    // Get payment intent
    const paymentIntent = await this.paymentIntentRepo.findById(intentId);
    if (!paymentIntent) {
      throw new Error('PaymentIntentNotFound');
    }

    if (paymentIntent.status !== 'authorized') {
      throw new Error('PaymentIntentNotAuthorized');
    }

    // Determine capture amount
    const captureAmount = amount ? new Money(amount, currency) : paymentIntent.amount;

    try {
      // Capture payment
      const captureResult = await this.paymentProvider.capture({
        intentId: paymentIntent.externalId,
        amount: captureAmount
      });

      if (captureResult.isSuccess()) {
        paymentIntent.capture();
        await this.paymentIntentRepo.update(paymentIntent);
      }

      return captureResult;

    } catch (error) {
      return new PaymentResult({
        status: 'failed',
        error: error.message
      });
    }
  }
}
