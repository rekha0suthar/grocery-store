/**
 * Interface for Payment Repository
 * Defines the contract for payment data persistence
 */
export class IPaymentRepository {
  /**
   * Create a new payment intent
   * @param {PaymentIntent} paymentIntent - The payment intent to create
   * @returns {Promise<PaymentIntent>} Created payment intent
   */
  async create(_paymentIntent) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update an existing payment intent
   * @param {PaymentIntent} paymentIntent - The payment intent to update
   * @returns {Promise<PaymentIntent>} Updated payment intent
   */
  async update(_paymentIntent) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find payment intent by ID
   * @param {string} id - Payment intent ID
   * @returns {Promise<PaymentIntent|null>} Payment intent or null if not found
   */
  async findById(_id) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find payment intent by external ID
   * @param {string} externalId - External payment ID
   * @returns {Promise<PaymentIntent|null>} Payment intent or null if not found
   */
  async findByExternalId(_externalId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find payment intents by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Array<PaymentIntent>>} Array of payment intents
   */
  async findByOrderId(_orderId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find payment intents by customer ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array<PaymentIntent>>} Array of payment intents
   */
  async findByCustomerId(_customerId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find payment intents by payment method
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Array<PaymentIntent>>} Array of payment intents
   */
  async findByPaymentMethod(_paymentMethod) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find payment intents by status
   * @param {string} status - Payment status
   * @returns {Promise<Array<PaymentIntent>>} Array of payment intents
   */
  async findByStatus(_status) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find payment intents by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Array<PaymentIntent>>} Array of payment intents
   */
  async findByUserId(_userId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Delete payment intent by ID
   * @param {string} id - Payment intent ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteById(_id) {
    throw new Error('Method must be implemented');
  }
}
