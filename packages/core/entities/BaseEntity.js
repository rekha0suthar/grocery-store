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

  // Generic business rules - accepts time injection for testing
  updateTimestamp(now = new Date()) {
    this.updatedAt = now;
  }

  activate(now = new Date()) {
    this.isActive = true;
    this.updateTimestamp(now);
  }

  deactivate(now = new Date()) {
    this.isActive = false;
    this.updateTimestamp(now);
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

  // Create from plain object - Date-safe rehydration
  static fromJSON(data) {
    const entity = new this(data.id ?? null);
    
    // Rehydrate Dates explicitly
    entity.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    entity.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    entity.isActive = data.isActive ?? true;
    
    // Assign the rest safely
    for (const key of Object.keys(data)) {
      if (!(key in entity)) {
        entity[key] = data[key];
      }
    }
    
    return entity;
  }
}
