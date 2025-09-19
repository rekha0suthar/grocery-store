import { IDatabaseAdapter } from '@grocery-store/core/interfaces';

export class BaseRepository {
  constructor(collectionName, databaseAdapter) {
    if (!(databaseAdapter instanceof IDatabaseAdapter)) {
      throw new Error('Database adapter must implement IDatabaseAdapter interface');
    }
    
    this.collectionName = collectionName;
    this.db = databaseAdapter;
    this.database = databaseAdapter; // Add this line for compatibility
    this.databaseAdapter = databaseAdapter;
  }

  async findById(id) {
    return await this.db.findById(this.collectionName, id);
  }

  async findAll(filters = {}, limit = 100, offset = 0) {
    return await this.db.findAll(this.collectionName, filters, limit, offset);
  }

  async findByField(field, value) {
    return await this.db.findByField(this.collectionName, field, value);
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

  async query(text, params = []) {
    if (typeof this.db.query === 'function') {
      return await this.db.query(text, params);
    }
    throw new Error('Query method not supported by this database adapter');
  }
}
