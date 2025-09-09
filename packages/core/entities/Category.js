import { BaseEntity } from './BaseEntity.js';

export class Category extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.name = data.name || '';
    this.description = data.description || '';
    this.slug = data.slug || '';
    this.imageUrl = data.imageUrl || '';
    this.parentId = data.parentId || null;
    this.sortOrder = data.sortOrder || 0;
    this.isVisible = data.isVisible !== undefined ? data.isVisible : true;
    
    // Generate slug if not provided
    this.slug = data.slug || this.generateSlug(data.name || '');
  }

  isValid() {
    return this.validateName() && this.validateSlug();
  }

  validateName() {
    return !!(this.name && this.name.trim().length >= 2);
  }

  validateSlug() {
    if (!this.slug) {
      this.generateSlug();
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(this.slug);
  }

  isRootCategory() {
    return !this.parentId;
  }

  isSubCategory() {
    return !!this.parentId;
  }

  canHaveProducts() {
    return this.isVisible && this.isActive;
  }

  generateSlug(name = this.name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Getters
  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getSlug() {
    return this.slug;
  }

  getParentId() {
    return this.parentId;
  }

  getSortOrder() {
    return this.sortOrder;
  }

  getIsVisible() {
    return this.isVisible;
  }

  getImageUrl() {
    return this.imageUrl;
  }

  // Setters
  setName(name) {
    this.name = name;
    this.updatedAt = new Date();
  }

  setDescription(description) {
    this.description = description;
    this.updatedAt = new Date();
  }

  setSlug(slug) {
    this.slug = slug;
    this.updatedAt = new Date();
  }

  setParentId(parentId) {
    this.parentId = parentId;
    this.updatedAt = new Date();
  }

  setSortOrder(sortOrder) {
    this.sortOrder = sortOrder;
    this.updatedAt = new Date();
  }

  setIsVisible(isVisible) {
    this.isVisible = isVisible;
    this.updatedAt = new Date();
  }

  setImage(imageUrl) {
    this.imageUrl = imageUrl;
    this.updatedAt = new Date();
  }

  getImage() {
    return this.imageUrl;
  }

  hasImage() {
    return !!(this.imageUrl && this.imageUrl.trim().length > 0);
  }

  clearImage() {
    this.imageUrl = '';
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      description: this.description,
      slug: this.slug,
      imageUrl: this.imageUrl,
      parentId: this.parentId,
      sortOrder: this.sortOrder,
      isVisible: this.isVisible
    };
  }

  toPersistence() {
    return this.toJSON();
  }

  static fromJSON(data) {
    return new Category(data);
  }
}
