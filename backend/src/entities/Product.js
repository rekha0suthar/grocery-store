import { BaseEntity } from './BaseEntity.js';

/**
 * Product Entity - Represents grocery products
 * Store managers can add products, admins can manage everything
 */
export class Product extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.name = data.name || '';
    this.description = data.description || '';
    this.price = data.price || 0;
    this.categoryId = data.categoryId || data.category_id || null;
    this.sku = data.sku || '';
    this.barcode = data.barcode || '';
    this.unit = data.unit || 'piece'; // piece, kg, liter, etc.
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
    this.addedBy = data.addedBy || data.added_by || null; // User ID who added the product
  }

  // Domain validation
  isValid() {
    return this.validateName() && 
           this.validatePrice() && 
           this.validateStock() && 
           this.validateSku() &&
           this.validateCategory();
  }

  validateName() {
    return this.name && this.name.trim().length >= 2;
  }

  validatePrice() {
    return this.price >= 0;
  }

  validateStock() {
    return this.stock >= 0 && this.stock <= this.maxStock;
  }

  validateSku() {
    return this.sku && this.sku.trim().length >= 3;
  }

  validateCategory() {
    return this.categoryId !== null;
  }

  validateDiscount() {
    if (this.discountPrice && this.discountPrice > 0) {
      return this.discountPrice < this.price;
    }
    return true;
  }

  // Business rules
  isInStock() {
    return this.stock > 0;
  }

  isLowStock() {
    return this.stock <= this.minStock;
  }

  isAvailable() {
    return this.isActive && this.isVisible && this.isInStock();
  }

  canPurchase(quantity) {
    return this.isAvailable() && quantity <= this.stock && quantity > 0;
  }

  isOnDiscount() {
    if (!this.discountPrice || this.discountPrice <= 0) return false;
    
    const now = new Date();
    const startDate = this.discountStartDate ? new Date(this.discountStartDate) : null;
    const endDate = this.discountEndDate ? new Date(this.discountEndDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  }

  getCurrentPrice() {
    return this.isOnDiscount() ? this.discountPrice : this.price;
  }

  getDiscountPercentage() {
    if (!this.isOnDiscount()) return 0;
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }

  isExpired() {
    if (!this.expiryDate) return false;
    return new Date() > new Date(this.expiryDate);
  }

  // Business operations
  reduceStock(quantity) {
    if (this.canPurchase(quantity)) {
      this.stock -= quantity;
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  addStock(quantity) {
    if (quantity > 0 && (this.stock + quantity) <= this.maxStock) {
      this.stock += quantity;
      this.updateTimestamp();
      return true;
    }
    return false;
  }

  setStock(quantity) {
    if (quantity >= 0 && quantity <= this.maxStock) {
      this.stock = quantity;
      this.updateTimestamp();
      return true;
    }
    return false;
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

  getBarcode() {
    return this.barcode;
  }

  getUnit() {
    return this.unit;
  }

  getStock() {
    return this.stock;
  }

  getMinStock() {
    return this.minStock;
  }

  getMaxStock() {
    return this.maxStock;
  }

  getImages() {
    return this.images;
  }

  getTags() {
    return this.tags;
  }

  getIsVisible() {
    return this.isVisible;
  }

  getIsFeatured() {
    return this.isFeatured;
  }

  getAddedBy() {
    return this.addedBy;
  }

  // Setters
  setName(name) {
    this.name = name.trim();
    this.updateTimestamp();
    return this;
  }

  setDescription(description) {
    this.description = description.trim();
    this.updateTimestamp();
    return this;
  }

  setPrice(price) {
    this.price = parseFloat(price) || 0;
    this.updateTimestamp();
    return this;
  }

  setCategoryId(categoryId) {
    this.categoryId = categoryId;
    this.updateTimestamp();
    return this;
  }

  setSku(sku) {
    this.sku = sku.trim().toUpperCase();
    this.updateTimestamp();
    return this;
  }

  setBarcode(barcode) {
    this.barcode = barcode;
    this.updateTimestamp();
    return this;
  }

  setUnit(unit) {
    this.unit = unit;
    this.updateTimestamp();
    return this;
  }

  setMinStock(minStock) {
    this.minStock = parseInt(minStock) || 0;
    this.updateTimestamp();
    return this;
  }

  setMaxStock(maxStock) {
    this.maxStock = parseInt(maxStock) || 1000;
    this.updateTimestamp();
    return this;
  }

  setImages(images) {
    this.images = Array.isArray(images) ? images : [];
    this.updateTimestamp();
    return this;
  }

  addImage(imageUrl) {
    if (imageUrl && !this.images.includes(imageUrl)) {
      this.images.push(imageUrl);
      this.updateTimestamp();
    }
    return this;
  }

  removeImage(imageUrl) {
    this.images = this.images.filter(img => img !== imageUrl);
    this.updateTimestamp();
    return this;
  }

  setTags(tags) {
    this.tags = Array.isArray(tags) ? tags : [];
    this.updateTimestamp();
    return this;
  }

  addTag(tag) {
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updateTimestamp();
    }
    return this;
  }

  setIsVisible(isVisible) {
    this.isVisible = isVisible;
    this.updateTimestamp();
    return this;
  }

  setIsFeatured(isFeatured) {
    this.isFeatured = isFeatured;
    this.updateTimestamp();
    return this;
  }

  setDiscount(discountPrice, startDate = null, endDate = null) {
    this.discountPrice = parseFloat(discountPrice) || null;
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

  setAddedBy(userId) {
    this.addedBy = userId;
    this.updateTimestamp();
    return this;
  }

  // Convert to plain object
  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      name: this.name,
      description: this.description,
      price: this.price,
      currentPrice: this.getCurrentPrice(),
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
      discountPercentage: this.getDiscountPercentage(),
      isOnDiscount: this.isOnDiscount(),
      nutritionInfo: this.nutritionInfo,
      allergens: this.allergens,
      expiryDate: this.expiryDate,
      manufacturer: this.manufacturer,
      countryOfOrigin: this.countryOfOrigin,
      addedBy: this.addedBy
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new Product(data);
  }
}
