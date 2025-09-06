import { BaseEntity } from './BaseEntity.js';

/**
 * Category Entity - Represents product categories
 * Only admins can create/modify categories
 */
export class Category extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.name = data.name || '';
    this.description = data.description || '';
    this.slug = data.slug || '';
    this.imageUrl = data.imageUrl || '';
    this.parentId = data.parentId || null; // For subcategories
    this.sortOrder = data.sortOrder || 0;
    this.isVisible = data.isVisible !== undefined ? data.isVisible : true;
  }

  // Domain validation
  isValid() {
    return this.validateName() && this.validateSlug();
  }

  validateName() {
    return this.name && this.name.trim().length >= 2;
  }

  validateSlug() {
    if (!this.slug) {
      this.generateSlug();
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(this.slug);
  }

  // Business rules
  isRootCategory() {
    return !this.parentId;
  }

  isSubCategory() {
    return !!this.parentId;
  }

  canHaveProducts() {
    return this.isVisible && this.isActive;
  }

  // Generate slug from name
  generateSlug() {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    return this.slug;
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

  getImageUrl() {
    return this.imageUrl;
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

  // Setters
  setName(name) {
    this.name = name.trim();
    this.generateSlug(); // Auto-generate slug when name changes
    this.updateTimestamp();
    return this;
  }

  setDescription(description) {
    this.description = description.trim();
    this.updateTimestamp();
    return this;
  }

  setSlug(slug) {
    this.slug = slug.toLowerCase().trim();
    this.updateTimestamp();
    return this;
  }

  setImageUrl(imageUrl) {
    this.imageUrl = imageUrl;
    this.updateTimestamp();
    return this;
  }

  setParentId(parentId) {
    this.parentId = parentId;
    this.updateTimestamp();
    return this;
  }

  setSortOrder(sortOrder) {
    this.sortOrder = parseInt(sortOrder) || 0;
    this.updateTimestamp();
    return this;
  }

  setIsVisible(isVisible) {
    this.isVisible = isVisible;
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
      slug: this.slug,
      imageUrl: this.imageUrl,
      parentId: this.parentId,
      sortOrder: this.sortOrder,
      isVisible: this.isVisible
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new Category(data);
  }
}
