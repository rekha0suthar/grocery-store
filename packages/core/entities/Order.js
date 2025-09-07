import { BaseEntity } from './BaseEntity.js';
import { InvalidTransitionError } from '../errors/DomainErrors.js';

/**
 * Order Entity - Represents customer orders
 */
export class Order extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.orderNumber = data.orderNumber || this.generateOrderNumber();
    this.userId = data.userId || null;
    this.items = data.items || []; // Array of OrderItem objects
    this.status = data.status || 'pending'; // pending, confirmed, processing, shipped, delivered, cancelled
    this.totalAmount = data.totalAmount || 0;
    this.discountAmount = data.discountAmount || 0;
    this.shippingAmount = data.shippingAmount || 0;
    this.taxAmount = data.taxAmount || 0;
    this.finalAmount = data.finalAmount || 0;
    this.shippingAddress = data.shippingAddress || null;
    this.billingAddress = data.billingAddress || null;
    this.paymentMethod = data.paymentMethod || null;
    this.paymentStatus = data.paymentStatus || 'pending'; // pending, paid, failed, refunded
    this.paymentId = data.paymentId || null;
    this.notes = data.notes || '';
    this.deliveryDate = data.deliveryDate || null;
    this.deliveryTimeSlot = data.deliveryTimeSlot || null;
    this.trackingNumber = data.trackingNumber || null;
    this.cancelledAt = data.cancelledAt || null;
    this.cancellationReason = data.cancellationReason || null;
  }

  // Domain validation
  isValid() {
    return this.validateUserId() && this.validateItems() && this.validateStatus();
  }

  validateUserId() {
    return this.userId !== null;
  }

  validateItems() {
    return Array.isArray(this.items) && this.items.length > 0 && this.items.every(item => item.isValid());
  }

  validateStatus() {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    return validStatuses.includes(this.status);
  }

  // Business rules
  isPending() {
    return this.status === 'pending';
  }

  isConfirmed() {
    return this.status === 'confirmed';
  }

  isProcessing() {
    return this.status === 'processing';
  }

  isShipped() {
    return this.status === 'shipped';
  }

  isDelivered() {
    return this.status === 'delivered';
  }

  isCancelled() {
    return this.status === 'cancelled';
  }

  canBeCancelled() {
    return this.status === 'pending' || this.status === 'confirmed';
  }

  canBeConfirmed() {
    return this.status === 'pending';
  }

  canBeProcessed() {
    return this.status === 'confirmed';
  }

  canBeShipped() {
    return this.status === 'processing';
  }

  canBeDelivered() {
    return this.status === 'shipped';
  }

  // Safe status transitions (no direct setter)
  confirm() {
    if (!this.canBeConfirmed()) {
      throw new InvalidTransitionError(this.status, 'confirmed');
    }
    this.status = 'confirmed';
    this.updateTimestamp();
    return true;
  }

  startProcessing() {
    if (!this.canBeProcessed()) {
      throw new InvalidTransitionError(this.status, 'processing');
    }
    this.status = 'processing';
    this.updateTimestamp();
    return true;
  }

  ship(trackingNumber = null) {
    if (!this.canBeShipped()) {
      throw new InvalidTransitionError(this.status, 'shipped');
    }
    this.status = 'shipped';
    this.trackingNumber = trackingNumber;
    this.updateTimestamp();
    return true;
  }

  deliver() {
    if (!this.canBeDelivered()) {
      throw new InvalidTransitionError(this.status, 'delivered');
    }
    this.status = 'delivered';
    this.updateTimestamp();
    return true;
  }

  cancel(reason = null) {
    if (!this.canBeCancelled()) {
      throw new InvalidTransitionError(this.status, 'cancelled');
    }
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.cancelledAt = new Date();
    this.updateTimestamp();
    return true;
  }

  // Payment status transitions
  markAsPaid(paymentId = null) {
    this.paymentStatus = 'paid';
    this.paymentId = paymentId;
    this.updateTimestamp();
  }

  markPaymentFailed() {
    this.paymentStatus = 'failed';
    this.updateTimestamp();
  }

  refund() {
    if (this.paymentStatus !== 'paid') {
      throw new InvalidTransitionError(this.paymentStatus, 'refunded', 'Only paid orders can be refunded');
    }
    this.paymentStatus = 'refunded';
    this.updateTimestamp();
  }

  // Generate unique order number (deterministic for testing)
  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  // Calculate totals
  calculateTotals() {
    this.totalAmount = this.items.reduce((total, item) => total + item.lineTotal(), 0);
    this.finalAmount = Math.max(0, this.totalAmount + this.shippingAmount + this.taxAmount - this.discountAmount);
    this.updateTimestamp();
  }

  // Getters
  getUserId() {
    return this.userId;
  }

  getItems() {
    return this.items;
  }

  getStatus() {
    return this.status;
  }

  getTotalAmount() {
    return this.totalAmount;
  }

  getFinalAmount() {
    return this.finalAmount;
  }

  getPaymentStatus() {
    return this.paymentStatus;
  }

  getOrderNumber() {
    return this.orderNumber;
  }

  getTrackingNumber() {
    return this.trackingNumber;
  }

  getCancellationReason() {
    return this.cancellationReason;
  }

  // Convert to plain object
  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      orderNumber: this.orderNumber,
      userId: this.userId,
      items: this.items.map(item => item.toJSON()),
      status: this.status,
      totalAmount: this.totalAmount,
      discountAmount: this.discountAmount,
      shippingAmount: this.shippingAmount,
      taxAmount: this.taxAmount,
      finalAmount: this.finalAmount,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      paymentId: this.paymentId,
      notes: this.notes,
      deliveryDate: this.deliveryDate,
      deliveryTimeSlot: this.deliveryTimeSlot,
      trackingNumber: this.trackingNumber,
      cancelledAt: this.cancelledAt,
      cancellationReason: this.cancellationReason
    };
  }

  // Create from plain object
  static fromJSON(data) {
    const order = new Order(data);
    order.items = data.items ? data.items.map(item => OrderItem.fromJSON(item)) : [];
    return order;
  }
}

/**
 * OrderItem Entity - Represents individual items in an order
 */
export class OrderItem extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.productId = data.productId || null;
    this.productName = data.productName || '';
    this.productPrice = data.productPrice || 0;
    this.quantity = data.quantity || 1;
    this.unit = data.unit || 'piece';
  }

  // Domain validation
  isValid() {
    return this.validateProductId() && this.validateQuantity() && this.validatePrice();
  }

  validateProductId() {
    return this.productId !== null;
  }

  validateQuantity() {
    return this.quantity > 0;
  }

  validatePrice() {
    return this.productPrice > 0;
  }

  // Business rules
  lineTotal() {
    return this.productPrice * this.quantity;
  }

  // Getters
  getProductId() {
    return this.productId;
  }

  getProductName() {
    return this.productName;
  }

  getProductPrice() {
    return this.productPrice;
  }

  getQuantity() {
    return this.quantity;
  }

  getUnit() {
    return this.unit;
  }

  // Convert to plain object
  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      productId: this.productId,
      productName: this.productName,
      productPrice: this.productPrice,
      quantity: this.quantity,
      unit: this.unit,
      lineTotal: this.lineTotal()
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new OrderItem(data);
  }
}
