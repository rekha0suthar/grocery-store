import { BaseEntity } from './BaseEntity.js';

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
    return this.validateUserId() && 
           this.validateItems() && 
           this.validateAmounts() &&
           this.validateAddresses();
  }

  validateUserId() {
    return this.userId !== null;
  }

  validateItems() {
    return Array.isArray(this.items) && this.items.length > 0 && this.items.every(item => item.isValid());
  }

  validateAmounts() {
    return this.totalAmount >= 0 && 
           this.discountAmount >= 0 && 
           this.shippingAmount >= 0 && 
           this.taxAmount >= 0 && 
           this.finalAmount >= 0;
  }

  validateAddresses() {
    return this.shippingAddress !== null && this.billingAddress !== null;
  }

  // Business rules
  canBeCancelled() {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(this.status);
  }

  canBeModified() {
    return this.status === 'pending';
  }

  isPaid() {
    return this.paymentStatus === 'paid';
  }

  isDelivered() {
    return this.status === 'delivered';
  }

  isCancelled() {
    return this.status === 'cancelled';
  }

  isInProgress() {
    const inProgressStatuses = ['confirmed', 'processing', 'shipped'];
    return inProgressStatuses.includes(this.status);
  }

  // Order operations
  confirm() {
    if (this.status === 'pending') {
      this.status = 'confirmed';
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  startProcessing() {
    if (this.status === 'confirmed') {
      this.status = 'processing';
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  ship(trackingNumber = null) {
    if (this.status === 'processing') {
      this.status = 'shipped';
      this.trackingNumber = trackingNumber;
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  deliver() {
    if (this.status === 'shipped') {
      this.status = 'delivered';
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  cancel(reason = '') {
    if (this.canBeCancelled()) {
      this.status = 'cancelled';
      this.cancelledAt = new Date();
      this.cancellationReason = reason;
      this.updateTimestamp();
      return true;
    }
    return false;
  }

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
    this.paymentStatus = 'refunded';
    this.updateTimestamp();
  }

  // Generate unique order number
  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  // Calculate totals
  calculateTotals() {
    this.totalAmount = this.items.reduce((total, item) => total + item.getTotalPrice(), 0);
    this.finalAmount = Math.max(0, this.totalAmount + this.shippingAmount + this.taxAmount - this.discountAmount);
  }

  // Getters
  getOrderNumber() {
    return this.orderNumber;
  }

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

  getDiscountAmount() {
    return this.discountAmount;
  }

  getShippingAmount() {
    return this.shippingAmount;
  }

  getTaxAmount() {
    return this.taxAmount;
  }

  getFinalAmount() {
    return this.finalAmount;
  }

  getShippingAddress() {
    return this.shippingAddress;
  }

  getBillingAddress() {
    return this.billingAddress;
  }

  getPaymentMethod() {
    return this.paymentMethod;
  }

  getPaymentStatus() {
    return this.paymentStatus;
  }

  getPaymentId() {
    return this.paymentId;
  }

  getNotes() {
    return this.notes;
  }

  getDeliveryDate() {
    return this.deliveryDate;
  }

  getDeliveryTimeSlot() {
    return this.deliveryTimeSlot;
  }

  getTrackingNumber() {
    return this.trackingNumber;
  }

  getCancelledAt() {
    return this.cancelledAt;
  }

  getCancellationReason() {
    return this.cancellationReason;
  }

  // Setters
  setUserId(userId) {
    this.userId = userId;
    this.updateTimestamp();
    return this;
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : [];
    this.calculateTotals();
    this.updateTimestamp();
    return this;
  }

  setStatus(status) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (validStatuses.includes(status)) {
      this.status = status;
      this.updateTimestamp();
    }
    return this;
  }

  setDiscountAmount(amount) {
    this.discountAmount = parseFloat(amount) || 0;
    this.calculateTotals();
    this.updateTimestamp();
    return this;
  }

  setShippingAmount(amount) {
    this.shippingAmount = parseFloat(amount) || 0;
    this.calculateTotals();
    this.updateTimestamp();
    return this;
  }

  setTaxAmount(amount) {
    this.taxAmount = parseFloat(amount) || 0;
    this.calculateTotals();
    this.updateTimestamp();
    return this;
  }

  setShippingAddress(address) {
    this.shippingAddress = address;
    this.updateTimestamp();
    return this;
  }

  setBillingAddress(address) {
    this.billingAddress = address;
    this.updateTimestamp();
    return this;
  }

  setPaymentMethod(paymentMethod) {
    this.paymentMethod = paymentMethod;
    this.updateTimestamp();
    return this;
  }

  setNotes(notes) {
    this.notes = notes;
    this.updateTimestamp();
    return this;
  }

  setDeliveryDate(date) {
    this.deliveryDate = date;
    this.updateTimestamp();
    return this;
  }

  setDeliveryTimeSlot(timeSlot) {
    this.deliveryTimeSlot = timeSlot;
    this.updateTimestamp();
    return this;
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
    this.productImage = data.productImage || '';
    this.quantity = data.quantity || 1;
    this.unit = data.unit || 'piece';
    this.totalPrice = data.totalPrice || 0;
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
    return this.productPrice >= 0;
  }

  // Business rules
  getTotalPrice() {
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

  getProductImage() {
    return this.productImage;
  }

  getQuantity() {
    return this.quantity;
  }

  getUnit() {
    return this.unit;
  }

  getTotalPrice() {
    return this.getTotalPrice();
  }

  // Setters
  setProductId(productId) {
    this.productId = productId;
    this.updateTimestamp();
    return this;
  }

  setProductName(productName) {
    this.productName = productName;
    this.updateTimestamp();
    return this;
  }

  setProductPrice(productPrice) {
    this.productPrice = productPrice;
    this.updateTimestamp();
    return this;
  }

  setProductImage(productImage) {
    this.productImage = productImage;
    this.updateTimestamp();
    return this;
  }

  setQuantity(quantity) {
    this.quantity = quantity;
    this.updateTimestamp();
    return this;
  }

  setUnit(unit) {
    this.unit = unit;
    this.updateTimestamp();
    return this;
  }

  // Convert to plain object
  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      productId: this.productId,
      productName: this.productName,
      productPrice: this.productPrice,
      productImage: this.productImage,
      quantity: this.quantity,
      unit: this.unit,
      totalPrice: this.getTotalPrice()
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new OrderItem(data);
  }
}
