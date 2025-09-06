/**
 * Base Entity - Core domain object for all entities
 * Database-independent base class
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
}
