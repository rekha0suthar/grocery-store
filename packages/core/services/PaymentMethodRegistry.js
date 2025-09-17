import { IPaymentMethodRegistry } from '../interfaces/IPaymentMethodRegistry.js';
import { DEFAULT_PAYMENT_CONTRACTS } from '../contracts/payment.methods.defaults.js';


export class InMemoryPaymentMethodRegistry extends IPaymentMethodRegistry {
  constructor(contracts = DEFAULT_PAYMENT_CONTRACTS) {
    super();
    this.map = new Map();
    contracts.forEach(contract => this.map.set(contract.id, contract));
  }

  listContracts() {
    return Array.from(this.map.values());
  }

  getContract(methodId) {
    return this.map.get(methodId) || null;
  }

  listEnabledContracts() {
    return Array.from(this.map.values()).filter(contract => contract.enabled);
  }

  isAvailable(methodId) {
    const contract = this.map.get(methodId);
    return contract ? contract.enabled : false;
  }

  register(contract) {
    if (!contract || !contract.id) {
      throw new Error('Contract must have an id');
    }
    this.map.set(contract.id, contract);
  }

  unregister(methodId) {
    this.map.delete(methodId);
  }

  /**
   * Get contracts that require online authorization
   * @returns {PaymentMethodContract[]} - Array of contracts requiring online auth
   */
  listOnlineAuthContracts() {
    return Array.from(this.map.values()).filter(contract => 
      contract.enabled && contract.requiresOnlineAuth
    );
  }

  /**
   * Get contracts that don't require online authorization (COD, etc.)
   * @returns {PaymentMethodContract[]} - Array of contracts not requiring online auth
   */
  listOfflineAuthContracts() {
    return Array.from(this.map.values()).filter(contract => 
      contract.enabled && !contract.requiresOnlineAuth
    );
  }

  /**
   * Get contracts by _category or type
   * @param {string} _category - Category to filter by
   * @returns {PaymentMethodContract[]} - Array of contracts in _category
   */
  listContractsByCategory(_category) {
    // This could be extended to support categories
    return this.listEnabledContracts();
  }
}
