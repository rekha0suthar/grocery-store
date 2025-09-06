/**
 * Repository Interface - Contract for data access
 * Database-independent interface that any database implementation must follow
 */
export class IRepository {
  /**
   * Create a new entity
   * @param {Object} entity - The entity to create
   * @returns {Promise<Object>} The created entity
   */
  async create(entity) {
    throw new Error('create method must be implemented');
  }

  /**
   * Find entity by ID
   * @param {string} id - The entity ID
   * @returns {Promise<Object|null>} The found entity or null
   */
  async findById(id) {
    throw new Error('findById method must be implemented');
  }

  /**
   * Find all entities with optional filters
   * @param {Object} filters - Optional filters
   * @param {Object} options - Query options (limit, offset, sort)
   * @returns {Promise<Array>} Array of entities
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('findAll method must be implemented');
  }

  /**
   * Update entity by ID
   * @param {string} id - The entity ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object|null>} The updated entity or null
   */
  async update(id, updates) {
    throw new Error('update method must be implemented');
  }

  /**
   * Delete entity by ID
   * @param {string} id - The entity ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(id) {
    throw new Error('delete method must be implemented');
  }

  /**
   * Count entities with optional filters
   * @param {Object} filters - Optional filters
   * @returns {Promise<number>} Count of entities
   */
  async count(filters = {}) {
    throw new Error('count method must be implemented');
  }

  /**
   * Check if entity exists by ID
   * @param {string} id - The entity ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(id) {
    throw new Error('exists method must be implemented');
  }
}
