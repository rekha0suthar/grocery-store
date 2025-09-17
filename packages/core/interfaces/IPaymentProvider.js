/**
 * Interface for Payment Providers
 * Defines the contract for payment processing implementations
 */
export class IPaymentProvider {
  /**
   * Check if this provider supports a specific payment method
   * @param {string} methodId - The payment method ID
   * @returns {boolean} True if supported, false otherwise
   */
  supports(_methodId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Authorize a payment (for prepaid methods)
   * @param {Object} params - Authorization parameters
   * @param {Money} params.amount - Payment amount
   * @param {string} params.currency - Currency code
   * @param {Object} params.fields - Payment method specific fields
   * @param {string} params.orderId - Order ID
   * @param {string} params.customerId - Customer ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<PaymentResult>} Authorization result
   */
  async authorize(_params) {
    throw new Error('Method must be implemented');
  }

  /**
   * Capture a previously authorized payment
   * @param {Object} params - Capture parameters
   * @param {string} params.intentId - Payment intent ID
   * @param {Money} params.amount - Amount to capture
   * @returns {Promise<PaymentResult>} Capture result
   */
  async capture(_params) {
    throw new Error('Method must be implemented');
  }

  /**
   * Refund a payment
   * @param {Object} params - Refund parameters
   * @param {string} params.paymentId - Payment ID to refund
   * @param {Money} params.amount - Refund amount
   * @param {string} params.reason - Refund reason
   * @returns {Promise<PaymentResult>} Refund result
   */
  async refund(_params) {
    throw new Error('Method must be implemented');
  }

  /**
   * Mark payment as pending (for COD/Zero-pay methods)
   * @param {Object} params - Pending parameters
   * @param {Money} params.amount - Payment amount
   * @param {string} params.currency - Currency code
   * @param {string} params.orderId - Order ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<PaymentResult>} Pending result
   */
  async markPending(_params) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get payment status
   * @param {string} intentId - Payment intent ID
   * @returns {Promise<PaymentResult>} Payment status
   */
  async getStatus(_intentId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Cancel a payment
   * @param {string} paymentId - Payment ID to cancel
   * @returns {Promise<PaymentResult>} Cancellation result
   */
  async cancel(_paymentId) {
    throw new Error('Method must be implemented');
  }
}
