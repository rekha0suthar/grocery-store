/**
 * Base Entity - Generic domain object
 * This is the most fundamental layer in Clean Architecture
 * Completely project-agnostic
 */
export class BaseEntity {
  constructor(id = null) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isActive = true;
  }

  // Generic validation methods
  isValid() {
    return true; // Override in child classes
  }

  // Generic business rules
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  activate() {
    this.isActive = true;
    this.updateTimestamp();
  }

  deactivate() {
    this.isActive = false;
    this.updateTimestamp();
  }

  // Getters
  getId() {
    return this.id;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  getIsActive() {
    return this.isActive;
  }

  // Setters
  setId(id) {
    this.id = id;
    return this;
  }

  // Convert to plain object (for database operations)
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }

  // Create from plain object
  static fromJSON(data) {
    const entity = new this();
    Object.assign(entity, data);
    return entity;
  }

  // Generic validation helpers
  static validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`${fieldName} is required`);
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  static validateMinLength(value, minLength, fieldName) {
    if (value && value.length < minLength) {
      throw new Error(`${fieldName} must be at least ${minLength} characters`);
    }
  }

  static validateMaxLength(value, maxLength, fieldName) {
    if (value && value.length > maxLength) {
      throw new Error(`${fieldName} must be at most ${maxLength} characters`);
    }
  }
}
