import { BaseEntity } from './BaseEntity.js';
import { Money } from './Money.js';

/**
 * Payment Intent Entity - Represents a payment intent before processing
 */
export class PaymentIntent extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
    
    this.methodId = data.methodId || null;
    this.amount = data.amount instanceof Money ? data.amount : new Money(data.amount || 0, data.currency || 'USD');
    this.currency = this.amount.currency;
    this.metadata = data.metadata || {};
    this.status = data.status || 'created'; // created | requires_action | authorized | captured | failed | canceled
    this.externalId = data.externalId || null;
    this.receiptUrl = data.receiptUrl || null;
    this.error = data.error || null;
    this.orderId = data.orderId || null;
    this.customerId = data.customerId || null;
  }

  isValid() {
    return this.methodId && 
           this.amount && 
           this.amount.amount > 0 && 
           this.status && 
           ['created', 'requires_action', 'authorized', 'captured', 'failed', 'canceled'].includes(this.status);
  }

  authorize() {
    if (this.status !== 'created' && this.status !== 'requires_action') {
      throw new Error('Payment intent must be created or require action to authorize');
    }
    this.status = 'authorized';
    this.updatedAt = this.clock.now();
  }

  capture() {
    if (this.status !== 'authorized') {
      throw new Error('Payment intent must be authorized to capture');
    }
    this.status = 'captured';
    this.updatedAt = this.clock.now();
  }

  fail(error) {
    this.status = 'failed';
    this.error = error;
    this.updatedAt = this.clock.now();
  }

  cancel() {
    if (this.status === 'captured') {
      throw new Error('Cannot cancel captured payment');
    }
    this.status = 'canceled';
    this.updatedAt = this.clock.now();
  }

  requiresAction() {
    this.status = 'requires_action';
    this.updatedAt = this.clock.now();
  }

  setExternalId(externalId) {
    this.externalId = externalId;
    this.updatedAt = this.clock.now();
  }

  setReceiptUrl(receiptUrl) {
    this.receiptUrl = receiptUrl;
    this.updatedAt = this.clock.now();
  }

  toPersistence() {
    return {
      id: this.id,
      methodId: this.methodId,
      amount: this.amount.toPersistence(),
      currency: this.currency,
      metadata: this.metadata,
      status: this.status,
      externalId: this.externalId,
      receiptUrl: this.receiptUrl,
      error: this.error,
      orderId: this.orderId,
      customerId: this.customerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromPersistence(data, clock = null) {
    const paymentIntent = new PaymentIntent({
      id: data.id,
      methodId: data.methodId,
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata,
      status: data.status,
      externalId: data.externalId,
      receiptUrl: data.receiptUrl,
      error: data.error,
      orderId: data.orderId,
      customerId: data.customerId
    }, clock);
    
    paymentIntent.createdAt = data.createdAt;
    paymentIntent.updatedAt = data.updatedAt;
    return paymentIntent;
  }
}

/**
 * Payment Result Entity - Represents the result of a payment operation
 */
export class PaymentResult extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
    
    this.status = data.status || 'pending'; // pending | paid | failed | refunded
    this.externalId = data.externalId || null;
    this.receiptUrl = data.receiptUrl || null;
    this.error = data.error || null;
    this.amount = data.amount instanceof Money ? data.amount : new Money(data.amount || 0, data.currency || 'USD');
    this.currency = this.amount.currency;
    this.paymentMethod = data.paymentMethod || null;
    this.orderId = data.orderId || null;
    this.customerId = data.customerId || null;
    this.metadata = data.metadata || {};
  }

  isValid() {
    return this.status && 
           ['pending', 'paid', 'failed', 'refunded'].includes(this.status) &&
           this.amount && 
           this.amount.amount >= 0;
  }

  markAsPaid() {
    this.status = 'paid';
    this.updatedAt = this.clock.now();
  }

  markAsFailed(error) {
    this.status = 'failed';
    this.error = error;
    this.updatedAt = this.clock.now();
  }

  markAsRefunded() {
    this.status = 'refunded';
    this.updatedAt = this.clock.now();
  }

  setExternalId(externalId) {
    this.externalId = externalId;
    this.updatedAt = this.clock.now();
  }

  setReceiptUrl(receiptUrl) {
    this.receiptUrl = receiptUrl;
    this.updatedAt = this.clock.now();
  }

  toPersistence() {
    return {
      id: this.id,
      status: this.status,
      externalId: this.externalId,
      receiptUrl: this.receiptUrl,
      error: this.error,
      amount: this.amount.toPersistence(),
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      orderId: this.orderId,
      customerId: this.customerId,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromPersistence(data, clock = null) {
    const paymentResult = new PaymentResult({
      id: data.id,
      status: data.status,
      externalId: data.externalId,
      receiptUrl: data.receiptUrl,
      error: data.error,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      orderId: data.orderId,
      customerId: data.customerId,
      metadata: data.metadata
    }, clock);
    
    paymentResult.createdAt = data.createdAt;
    paymentResult.updatedAt = data.updatedAt;
    return paymentResult;
  }
}
