/**
 * Base Entity - Core domain object for all entities
 * Database-independent base class
 */
import { DefaultClock } from '../adapters/DefaultClock.js';

export class BaseEntity {
  constructor(id = null, clock = null) {
    this.id = id;
    this.clock = clock || new DefaultClock();
    this.createdAt = this.clock.now();
    this.updatedAt = this.clock.now();
    this.isActive = true;
  }

  // Generic validation methods
  isValid() {
    return true; // Override in child classes
  }

  // Generic business rules - uses injected clock
  updateTimestamp(now = null) {
    this.updatedAt = now || this.clock.now();
  }

  activate(now = null) {
    this.isActive = true;
    this.updateTimestamp(now);
  }

  deactivate(now = null) {
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
    this.updateTimestamp();
  }

  setActive(isActive) {
    this.isActive = isActive;
    this.updateTimestamp();
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }

  // Create from plain object - Date-safe rehydration
  static fromJSON(data, clock = null) {
    const entity = new this(data.id ?? null, clock);
    
    // Rehydrate Dates explicitly
    entity.createdAt = data.createdAt ? entity.clock.createDate(data.createdAt) : entity.clock.now();
    entity.updatedAt = data.updatedAt ? entity.clock.createDate(data.updatedAt) : entity.clock.now();
    entity.isActive = data.isActive ?? true;
    
    // Assign the rest safely, excluding clock field
    for (const key of Object.keys(data)) {
      if (!(key in entity) && key !== 'clock') { // Exclude clock field
        entity[key] = data[key];
      }
    }
    
    return entity;
  }
}
