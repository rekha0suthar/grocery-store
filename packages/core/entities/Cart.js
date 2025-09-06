import { BaseEntity } from './BaseEntity.js';

/**
 * Cart Entity - Represents shopping cart
 * Each customer has one cart
 */
export class Cart extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.userId = data.userId || null;
    this.items = data.items || []; // Array of CartItem objects
    this.totalAmount = data.totalAmount || 0;
    this.totalItems = data.totalItems || 0;
    this.discountCode = data.discountCode || null;
    this.discountAmount = data.discountAmount || 0;
    this.shippingAddress = data.shippingAddress || null;
    this.billingAddress = data.billingAddress || null;
    this.paymentMethod = data.paymentMethod || null;
    this.notes = data.notes || '';
  }

  // Domain validation
  isValid() {
    return this.validateUserId() && this.validateItems();
  }

  validateUserId() {
    return this.userId !== null;
  }

  validateItems() {
    return Array.isArray(this.items) && this.items.every(item => item.isValid());
  }

  // Business rules
  isEmpty() {
    return this.items.length === 0;
  }

  hasItems() {
    return this.items.length > 0;
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalAmount() {
    return this.items.reduce((total, item) => total + item.getTotalPrice(), 0);
  }

  getFinalAmount() {
    return Math.max(0, this.getTotalAmount() - this.discountAmount);
  }

  // Cart operations
  addItem(product, quantity = 1) {
    if (!product || quantity <= 0) return false;

    const existingItemIndex = this.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      this.items[existingItemIndex].addQuantity(quantity);
    } else {
      // Add new item
      const cartItem = new CartItem({
        productId: product.id,
        productName: product.name,
        productPrice: product.getCurrentPrice(),
        productImage: product.images[0] || '',
        quantity: quantity,
        unit: product.unit
      });
      this.items.push(cartItem);
    }

    this.updateTotals();
    this.updateTimestamp();
    return true;
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.updateTotals();
    this.updateTimestamp();
    return true;
  }

  updateItemQuantity(productId, quantity) {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      } else {
        item.setQuantity(quantity);
        this.updateTotals();
        this.updateTimestamp();
        return true;
      }
    }
    return false;
  }

  clearCart() {
    this.items = [];
    this.discountCode = null;
    this.discountAmount = 0;
    this.updateTotals();
    this.updateTimestamp();
  }

  updateTotals() {
    this.totalAmount = this.getTotalAmount();
    this.totalItems = this.getItemCount();
  }

  applyDiscount(discountCode, discountAmount) {
    this.discountCode = discountCode;
    this.discountAmount = discountAmount;
    this.updateTimestamp();
  }

  removeDiscount() {
    this.discountCode = null;
    this.discountAmount = 0;
    this.updateTimestamp();
  }

  setShippingAddress(address) {
    this.shippingAddress = address;
    this.updateTimestamp();
  }

  setBillingAddress(address) {
    this.billingAddress = address;
    this.updateTimestamp();
  }

  setPaymentMethod(paymentMethod) {
    this.paymentMethod = paymentMethod;
    this.updateTimestamp();
  }

  setNotes(notes) {
    this.notes = notes;
    this.updateTimestamp();
  }

  // Getters
  getUserId() {
    return this.userId;
  }

  getItems() {
    return this.items;
  }

  getTotalAmount() {
    return this.totalAmount;
  }

  getTotalItems() {
    return this.totalItems;
  }

  getDiscountCode() {
    return this.discountCode;
  }

  getDiscountAmount() {
    return this.discountAmount;
  }

  getFinalAmount() {
    return this.getFinalAmount();
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

  getNotes() {
    return this.notes;
  }

  // Setters
  setUserId(userId) {
    this.userId = userId;
    this.updateTimestamp();
    return this;
  }

  // Convert to plain object
  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      userId: this.userId,
      items: this.items.map(item => item.toJSON()),
      totalAmount: this.totalAmount,
      totalItems: this.totalItems,
      finalAmount: this.getFinalAmount(),
      discountCode: this.discountCode,
      discountAmount: this.discountAmount,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      paymentMethod: this.paymentMethod,
      notes: this.notes
    };
  }

  // Create from plain object
  static fromJSON(data) {
    const cart = new Cart(data);
    cart.items = data.items ? data.items.map(item => CartItem.fromJSON(item)) : [];
    return cart;
  }
}

/**
 * CartItem Entity - Represents individual items in cart
 */
export class CartItem extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.productId = data.productId || null;
    this.productName = data.productName || '';
    this.productPrice = data.productPrice || 0;
    this.productImage = data.productImage || '';
    this.quantity = data.quantity || 1;
    this.unit = data.unit || 'piece';
  }

  // Domain validation
  isValid() {
    return this.validateProductId() && this.validateQuantity();
  }

  validateProductId() {
    return this.productId !== null;
  }

  validateQuantity() {
    return this.quantity > 0;
  }

  // Business rules
  getTotalPrice() {
    return this.productPrice * this.quantity;
  }

  addQuantity(amount) {
    this.quantity += amount;
    this.updateTimestamp();
  }

  subtractQuantity(amount) {
    this.quantity = Math.max(0, this.quantity - amount);
    this.updateTimestamp();
  }

  setQuantity(quantity) {
    this.quantity = Math.max(1, quantity);
    this.updateTimestamp();
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
    return new CartItem(data);
  }
}
