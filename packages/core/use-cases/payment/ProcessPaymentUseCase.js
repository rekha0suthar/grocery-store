import { PaymentIntent, PaymentResult } from '../../entities/Payment.js';
import { Money } from '../../entities/Money.js';
import { PAYMENT_METHOD_IDS } from '../../contracts/payment.contracts.js';

/**
 * Process Payment Use Case
 * Handles payment processing for different payment methods
 */
export class ProcessPaymentUseCase {
  constructor({ 
    paymentProvider, 
    paymentRegistry, 
    paymentIntentRepo, 
    clock 
  }) {
    this.paymentProvider = paymentProvider;
    this.paymentRegistry = paymentRegistry;
    this.paymentIntentRepo = paymentIntentRepo;
    this.clock = clock;
  }

  /**
   * Process a payment
   * @param {Object} params - Payment parameters
   * @param {string} params.methodId - Payment method ID
   * @param {number} params.amount - Payment amount
   * @param {string} params.currency - Currency code
   * @param {Object} params.fields - Payment method specific fields
   * @param {string} params.orderId - Order identifier
   * @param {string} params.customerId - Customer identifier
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<PaymentResult>} - Payment result
   */
  async execute({ 
    methodId, 
    amount, 
    currency, 
    fields = {}, 
    orderId, 
    customerId, 
    metadata = {} 
  }) {
    // Validate payment method
    const contract = this.paymentRegistry.getContract(methodId);
    if (!contract) {
      throw new Error('UnsupportedPaymentMethod');
    }

    if (!contract.enabled) {
      throw new Error('PaymentMethodDisabled');
    }

    // Validate provider supports this method
    if (!this.paymentProvider.supports(methodId)) {
      throw new Error('NoProviderForMethod');
    }

    // Create payment intent
    const paymentAmount = new Money(amount, currency);
    const paymentIntent = new PaymentIntent({
      methodId,
      amount: paymentAmount,
      fields,
      orderId,
      customerId,
      metadata,
      status: 'created'
    }, this.clock);

    if (!paymentIntent.isValid()) {
      throw new Error('InvalidPaymentIntent');
    }

    // Save payment intent
    await this.paymentIntentRepo.create(paymentIntent);

    let paymentResult;

    try {
      // Process payment based on method
      if (methodId === PAYMENT_METHOD_IDS.CASH_ON_DELIVERY) {
        // COD - mark as pending
        paymentResult = await this.paymentProvider.markPending({
          amount: paymentAmount.amount,
          currency: paymentAmount.currency,
          orderId,
          metadata
        });
      } else {
        // Online payment - authorize
        paymentResult = await this.paymentProvider.authorize({
          amount: paymentAmount.amount,
          currency: paymentAmount.currency,
          fields,
          orderId,
          customerId,
          metadata
        });
      }

      // Update payment intent with result
      if (paymentResult.isSuccess()) {
        paymentIntent.authorize();
        paymentIntent.setExternalId(paymentResult.externalId);
        if (paymentResult.receiptUrl) {
          paymentIntent.setReceiptUrl(paymentResult.receiptUrl);
        }
      } else if (paymentResult.isPending()) {
        paymentIntent.requiresAction();
        paymentIntent.setExternalId(paymentResult.externalId);
      } else if (paymentResult.isFailed()) {
        paymentIntent.fail(paymentResult.error);
      }

      // Update payment intent in repository
      await this.paymentIntentRepo.update(paymentIntent);

      return paymentResult;

    } catch (error) {
      // Handle payment processing errors
      paymentIntent.fail(error.message);
      await this.paymentIntentRepo.update(paymentIntent);
      
      return new PaymentResult({
        status: 'failed',
        error: error.message
      });
    }
  }
}
