import { BaseEntity } from './BaseEntity.js';
import { CartItem } from './CartItem.js';

export class Cart extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
    this.userId = data.userId || data.user_id || null;
    this.items = (data.items || []).map(item => 
      item instanceof CartItem ? item : new CartItem(item)
    );
    this.totalItems = data.totalItems || data.total_items || 0;
    this.totalAmount = data.totalAmount || data.total_amount || 0;
    this.discountAmount = data.discountAmount || data.discount_amount || 0;
    this.shippingAddress = data.shippingAddress || data.shipping_address || null;
    this.billingAddress = data.billingAddress || data.billing_address || null;
    this.notes = data.notes || '';
    this.couponCode = data.couponCode || data.coupon_code || null;
    this.shippingMethod = data.shippingMethod || data.shipping_method || null;
    this.paymentMethod = data.paymentMethod || data.payment_method || null;
    this.isAbandoned = data.isAbandoned || data.is_abandoned || false;
    this.abandonedAt = data.abandonedAt || data.abandoned_at || null;
    this.lastActivityAt = data.lastActivityAt || data.last_activity_at || this.clock.now();
  }

  isValid() {
    return this.validateUserId() && this.validateItems();
  }

  validateUserId() {
    return this.userId !== null && this.userId.trim().length > 0;
  }

  validateItems() {
    return this.items.every(item => item.isValid());
  }

  addItem(product, quantity = 1) {
    if (!product || quantity <= 0) return false;
    if (!product.id || !product.name || !product.getCurrentPrice || !product.unit) return false;

    const existingItemIndex = this.items.findIndex(item => 
      item.productId === product.id && item.productPrice === product.getCurrentPrice()
    );

    if (existingItemIndex >= 0) {
      this.items[existingItemIndex].addQuantity(quantity);
    } else {
      const cartItem = new CartItem({
        productId: product.id,
        productName: product.name,
        productPrice: product.getCurrentPrice(),
        quantity: quantity,
        unit: product.unit
      });
      this.items.push(cartItem);
    }

    this.recomputeTotals();
    this.updateTimestamp();
    return true;
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.recomputeTotals();
    this.updateTimestamp();
    return true;
  }

  updateItemQuantity(productId, quantity) {
    const item = this.items.find(item => item.productId === productId);
    if (!item) return false;

    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    item.setQuantity(quantity);
    this.recomputeTotals();
    this.updateTimestamp();
    return true;
  }

  clearItems() {
    this.items = [];
    this.recomputeTotals();
    this.updateTimestamp();
    return true;
  }

  applyDiscount(amount) {
    if (amount < 0) return false;
    this.discountAmount = amount;
    this.updateTimestamp();
    return true;
  }

  removeDiscount() {
    this.discountAmount = 0;
    this.updateTimestamp();
    return true;
  }

  recomputeTotals() {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.items.reduce((total, item) => total + item.lineTotal(), 0);
  }

  calculateTotals() {
    this.recomputeTotals();
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.lineTotal(), 0);
  }

  getFinalAmount() {
    return Math.max(0, this.getSubtotal() - this.discountAmount);
  }

  isEmpty() {
    return this.items.length === 0;
  }

  getItemCount() {
    return this.items.length;
  }

  getTotalQuantity() {
    return this.totalItems;
  }

  getTotalAmount() {
    return this.totalAmount;
  }

  getDiscountAmount() {
    return this.discountAmount;
  }

  hasItem(productId) {
    return this.items.some(item => item.productId === productId);
  }

  getItem(productId) {
    return this.items.find(item => item.productId === productId);
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

  setNotes(notes) {
    this.notes = notes;
    this.updateTimestamp();
    return this;
  }

  setCouponCode(code) {
    this.couponCode = code;
    this.updateTimestamp();
    return this;
  }

  setShippingMethod(method) {
    this.shippingMethod = method;
    this.updateTimestamp();
    return this;
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
    this.updateTimestamp();
    return this;
  }

  markAsAbandoned() {
    this.isAbandoned = true;
    this.abandonedAt = this.clock.now();
    this.updateTimestamp();
    return this;
  }

  restoreFromAbandoned() {
    this.isAbandoned = false;
    this.abandonedAt = null;
    this.updateTimestamp();
    return this;
  }

  updateLastActivity() {
    this.lastActivityAt = this.clock.now();
    this.updateTimestamp();
    return this;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      userId: this.userId,
      items: this.items.map(item => item.toJSON()),
      totalItems: this.totalItems,
      totalAmount: this.totalAmount,
      discountAmount: this.discountAmount,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      notes: this.notes,
      couponCode: this.couponCode,
      shippingMethod: this.shippingMethod,
      paymentMethod: this.paymentMethod,
      isAbandoned: this.isAbandoned,
      abandonedAt: this.abandonedAt,
      lastActivityAt: this.lastActivityAt
    };
  }

  static fromJSON(data) {
    return new Cart(data);
  }
}