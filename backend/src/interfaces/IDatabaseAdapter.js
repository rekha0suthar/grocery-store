/**
 * Database Adapter Interface
 * Follows Dependency Inversion Principle - depend on abstractions, not concretions
 */
export class IDatabaseAdapter {
  async connect() {
    throw new Error('connect() method must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect() method must be implemented');
  }

  async query(text, params = []) {
    throw new Error('query() method must be implemented');
  }

  async findById(collection, id) {
    throw new Error('findById() method must be implemented');
  }

  async findAll(collection, filters = {}, limit = 100, offset = 0) {
    throw new Error('findAll() method must be implemented');
  }

  async create(collection, data) {
    throw new Error('create() method must be implemented');
  }

  async update(collection, id, data) {
    throw new Error('update() method must be implemented');
  }

  async delete(collection, id) {
    throw new Error('delete() method must be implemented');
  }

  async count(collection, filters = {}) {
    throw new Error('count() method must be implemented');
  }
}
