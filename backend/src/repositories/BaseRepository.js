import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter.js';

/**
 * Base Repository - Refactored to use Database Adapter Pattern
 * Follows Dependency Inversion Principle and Open/Closed Principle
 */
export class BaseRepository {
  constructor(collectionName, databaseAdapter) {
    if (!(databaseAdapter instanceof IDatabaseAdapter)) {
      throw new Error('Database adapter must implement IDatabaseAdapter interface');
    }
    
    this.collectionName = collectionName;
    this.db = databaseAdapter;
  }

  async findById(id) {
    return await this.db.findById(this.collectionName, id);
  }

  async findAll(filters = {}, limit = 100, offset = 0) {
    return await this.db.findAll(this.collectionName, filters, limit, offset);
  }

  async create(data) {
    return await this.db.create(this.collectionName, data);
  }

  async update(id, data) {
    return await this.db.update(this.collectionName, id, data);
  }

  async delete(id) {
    return await this.db.delete(this.collectionName, id);
  }

  async count(filters = {}) {
    return await this.db.count(this.collectionName, filters);
  }

  async exists(id) {
    const result = await this.findById(id);
    return result !== null;
  }

  // Generic query method (works with PostgreSQL, not Firebase)
  async query(text, params = []) {
    if (typeof this.db.query === 'function') {
      return await this.db.query(text, params);
    }
    throw new Error('Query method not supported by this database adapter');
  }
}
