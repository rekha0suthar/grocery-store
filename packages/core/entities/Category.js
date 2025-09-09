import { BaseEntity } from './BaseEntity.js';

export class Category extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
    this.name = data.name || '';
    this.description = data.description || '';
    this.slug = data.slug || '';
    this.imageUrl = data.imageUrl || '';
    this.parentId = data.parentId || null;
    this.sortOrder = data.sortOrder || 0;
    this.isVisible = data.isVisible !== undefined ? data.isVisible : true;
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
    this.updateTimestamp();
  }

  setDescription(description) {
    this.description = description;
    this.updateTimestamp();
  }

  setSlug(slug) {
    this.slug = slug;
    this.updateTimestamp();
  }

  setParentId(parentId) {
    this.parentId = parentId;
    this.updateTimestamp();
  }

  setSortOrder(sortOrder) {
    this.sortOrder = sortOrder;
    this.updateTimestamp();
  }

  setIsVisible(isVisible) {
    this.isVisible = isVisible;
    this.updateTimestamp();
  }

  setImage(imageUrl) {
    this.imageUrl = imageUrl;
    this.updateTimestamp();
  }

  getImage() {
    return this.imageUrl;
  }

  hasImage() {
    return !!(this.imageUrl && this.imageUrl.trim().length > 0);
  }

  clearImage() {
    this.imageUrl = '';
    this.updateTimestamp();
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

  static fromJSON(data, clock = null) {
    return new Category(data, clock);
  }
}
