import { BaseEntity } from './BaseEntity.js';

export class Product extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
    this.name = data.name || '';
    this.description = data.description || '';
    this.price = data.price || 0;
    this.categoryId = data.categoryId || data.category_id || null;
    this.sku = data.sku || '';
    this.barcode = data.barcode || '';
    this.unit = data.unit || 'piece';
    this.weight = data.weight || 0;
    this.dimensions = data.dimensions || { length: 0, width: 0, height: 0 };
    this.stock = data.stock || 0;
    this.minStock = data.minStock || data.min_stock || 0;
    this.maxStock = data.maxStock || data.max_stock || 1000;
    this.images = data.images || [];
    this.tags = data.tags || [];
    this.isVisible = data.isVisible !== undefined ? data.isVisible : (data.is_visible !== undefined ? data.is_visible : true);
    this.isFeatured = data.isFeatured || data.is_featured || false;
    this.discountPrice = data.discountPrice || data.discount_price || null;
    this.discountStartDate = data.discountStartDate || data.discount_start_date || null;
    this.discountEndDate = data.discountEndDate || data.discount_end_date || null;
    this.nutritionInfo = data.nutritionInfo || data.nutrition_info || {};
    this.allergens = data.allergens || [];
    this.expiryDate = data.expiryDate || data.expiry_date || null;
    this.manufacturer = data.manufacturer || '';
    this.countryOfOrigin = data.countryOfOrigin || data.country_of_origin || '';
    this.addedBy = data.addedBy || data.added_by || null;
  }

  isValid() {
    return this.validateName() && this.validatePrice() && this.validateSku() && this.validateStock();
  }

  validateName() {
    return !!(this.name && this.name.trim().length > 0);
  }

  validatePrice() {
    return this.price > 0;
  }

  validateSku() {
    return !!(this.sku && this.sku.trim().length > 0);
  }

  validateStock() {
    return this.stock >= 0;
  }

  validateCategory() {
    return this.categoryId !== null;
  }

  isAvailable() {
    return this.isVisible && this.stock > 0;
  }

  isLowStock() {
    return this.stock <= this.minStock;
  }

  isOutOfStock() {
    return this.stock === 0;
  }

  canPurchase(quantity) {
    if (quantity <= 0) return false;
    return this.isAvailable() && this.stock >= quantity;
  }

  isOnDiscount(now = null) {
    if (!this.discountPrice || this.discountPrice <= 0) return false;

    const startDate = this.discountStartDate ? this.clock.createDate(this.discountStartDate) : null;
    const endDate = this.discountEndDate ? this.clock.createDate(this.discountEndDate) : null;

    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;

    return true;
  }

  isExpired(now = null) {
    return this.expiryDate ? now > this.clock.createDate(this.expiryDate) : false;
  }

  getCurrentPrice(now = null) {
    return this.isOnDiscount(now) ? this.discountPrice : this.price;
  }

  reduceStock(quantity) {
    if (quantity <= 0) return false;
    if (this.stock < quantity) return false;

    this.stock -= quantity;
    this.updateTimestamp();
    return true;
  }

  addStock(quantity) {
    if (quantity <= 0) return false;

    this.stock += quantity;
    this.updateTimestamp();
    return true;
  }

  setStock(quantity) {
    if (quantity < 0) return false;

    this.stock = quantity;
    this.updateTimestamp();
    return true;
  }

  changePrice(newPrice) {
    if (newPrice <= 0) {
      throw new Error('Price must be positive');
    }
    this.price = newPrice;
    this.updateTimestamp();
    return this;
  }

  scheduleDiscount(discountPrice, startDate, endDate) {
    if (discountPrice <= 0) {
      throw new Error('Discount price must be positive');
    }
    if (startDate && endDate && startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    this.discountPrice = discountPrice;
    this.discountStartDate = startDate;
    this.discountEndDate = endDate;
    this.updateTimestamp();
    return this;
  }

  removeDiscount() {
    this.discountPrice = null;
    this.discountStartDate = null;
    this.discountEndDate = null;
    this.updateTimestamp();
    return this;
  }

  makeVisible() {
    this.isVisible = true;
    this.updateTimestamp();
    return this;
  }

  makeHidden() {
    this.isVisible = false;
    this.updateTimestamp();
    return this;
  }

  // Image Management Methods
  addImage(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Image URL must be a valid string');
    }
    if (!this.images.includes(imageUrl)) {
      this.images.push(imageUrl);
      this.updateTimestamp();
    }
    return this;
  }

  removeImage(imageUrl) {
    const index = this.images.indexOf(imageUrl);
    if (index > -1) {
      this.images.splice(index, 1);
      this.updateTimestamp();
    }
    return this;
  }

  setImages(imageUrls) {
    if (!Array.isArray(imageUrls)) {
      throw new Error('Images must be an array');
    }
    this.images = imageUrls.filter(url => typeof url === 'string');
    this.updateTimestamp();
    return this;
  }

  getImages() {
    return [...this.images]; // Return a copy to prevent external modification
  }

  getPrimaryImage() {
    return this.images.length > 0 ? this.images[0] : null;
  }

  hasImages() {
    return this.images.length > 0;
  }

  clearImages() {
    this.images = [];
    this.updateTimestamp();
    return this;
  }

  // Getters
  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getPrice() {
    return this.price;
  }

  getCategoryId() {
    return this.categoryId;
  }

  getSku() {
    return this.sku;
  }

  getStock() {
    return this.stock;
  }

  getUnit() {
    return this.unit;
  }

  getIsVisible() {
    return this.isVisible;
  }

  getIsFeatured() {
    return this.isFeatured;
  }

  getDiscountPrice() {
    return this.discountPrice;
  }

  getExpiryDate() {
    return this.expiryDate;
  }

  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      name: this.name,
      description: this.description,
      price: this.price,
      categoryId: this.categoryId,
      sku: this.sku,
      barcode: this.barcode,
      unit: this.unit,
      weight: this.weight,
      dimensions: this.dimensions,
      stock: this.stock,
      minStock: this.minStock,
      maxStock: this.maxStock,
      images: this.images,
      tags: this.tags,
      isVisible: this.isVisible,
      isFeatured: this.isFeatured,
      discountPrice: this.discountPrice,
      discountStartDate: this.discountStartDate,
      discountEndDate: this.discountEndDate,
      nutritionInfo: this.nutritionInfo,
      allergens: this.allergens,
      expiryDate: this.expiryDate,
      manufacturer: this.manufacturer,
      countryOfOrigin: this.countryOfOrigin,
      addedBy: this.addedBy
    };
  }

  toPersistence() {
    return this.toJSON();
  }

  static fromJSON(data) {
    return new Product(data);
  }
}
