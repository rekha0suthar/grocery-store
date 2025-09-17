/**
 * Interface for Payment Method Registry
 * Manages available payment methods and their contracts
 */
export class IPaymentMethodRegistry {
  /**
   * List all available payment method contracts
   * @returns {Array} Array of PaymentMethodContract objects
   */
  listContracts() {
    throw new Error('Method must be implemented');
  }

  /**
   * Get a specific payment method contract by ID
   * @param {string} methodId - The payment method ID
   * @returns {PaymentMethodContract|null} The contract or null if not found
   */
  getContract(_methodId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Register a new payment method contract
   * @param {PaymentMethodContract} contract - The contract to register
   */
  registerContract(_contract) {
    throw new Error('Method must be implemented');
  }

  /**
   * Unregister a payment method contract
   * @param {string} methodId - The payment method ID to unregister
   */
  unregisterContract(_methodId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Check if a payment method is available
   * @param {string} methodId - The payment method ID to check
   * @returns {boolean} True if available, false otherwise
   */
  isMethodAvailable(_methodId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get all available payment method IDs
   * @returns {Array<string>} Array of method IDs
   */
  getAvailableMethodIds() {
    throw new Error('Method must be implemented');
  }
}
