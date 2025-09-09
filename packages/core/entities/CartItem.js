import { BaseEntity } from './BaseEntity.js';

export class CartItem extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.productId = data.productId || data.product_id || '';
    this.productName = data.productName || data.product_name || '';
    this.productPrice = data.productPrice || data.product_price || 0;
    this.quantity = data.quantity || 0;
    this.unit = data.unit || 'piece';
    this.imageUrl = data.imageUrl || data.image_url || '';
    this.notes = data.notes || '';
  }

  isValid() {
    return this.validateProductId() && this.validateProductName() && this.validatePrice() && this.validateQuantity();
  }

  validateProductId() {
    return !!(this.productId && this.productId.trim().length > 0);
  }

  validateProductName() {
    return !!(this.productName && this.productName.trim().length > 0);
  }

  validatePrice() {
    return this.productPrice >= 0;
  }

  validateQuantity() {
    return this.quantity > 0;
  }

  addQuantity(amount) {
    if (amount <= 0) return false;
    this.quantity += amount;
    this.updateTimestamp();
    return true;
  }

  removeQuantity(amount) {
    if (amount <= 0) return false;
    if (this.quantity < amount) return false;
    this.quantity -= amount;
    this.updateTimestamp();
    return true;
  }

  setQuantity(quantity) {
    if (quantity <= 0) return false;
    this.quantity = quantity;
    this.updateTimestamp();
    return true;
  }

  lineTotal() {
    return this.productPrice * this.quantity;
  }

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

  getImageUrl() {
    return this.imageUrl;
  }

  getNotes() {
    return this.notes;
  }

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

  setProductPrice(price) {
    if (price < 0) return false;
    this.productPrice = price;
    this.updateTimestamp();
    return this;
  }

  setUnit(unit) {
    this.unit = unit;
    this.updateTimestamp();
    return this;
  }

  setImageUrl(imageUrl) {
    this.imageUrl = imageUrl;
    this.updateTimestamp();
    return this;
  }

  setNotes(notes) {
    this.notes = notes;
    this.updateTimestamp();
    return this;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      productId: this.productId,
      productName: this.productName,
      productPrice: this.productPrice,
      quantity: this.quantity,
      unit: this.unit,
      imageUrl: this.imageUrl,
      notes: this.notes
    };
  }

  static fromJSON(data) {
    return new CartItem(data);
  }
}
