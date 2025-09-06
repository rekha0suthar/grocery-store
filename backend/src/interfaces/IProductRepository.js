import { IRepository } from './IRepository.js';

/**
 * Product Repository Interface - Specific contract for product data access
 * Database-independent interface for product operations
 */
export class IProductRepository extends IRepository {
  /**
   * Find products by category
   * @param {string} categoryId - The category ID
   * @returns {Promise<Array>} Array of products
   */
  async findByCategory(categoryId) {
    throw new Error('findByCategory method must be implemented');
  }

  /**
   * Find products by SKU
   * @param {string} sku - The product SKU
   * @returns {Promise<Object|null>} The found product or null
   */
  async findBySku(sku) {
    throw new Error('findBySku method must be implemented');
  }

  /**
   * Find products by barcode
   * @param {string} barcode - The product barcode
   * @returns {Promise<Object|null>} The found product or null
   */
  async findByBarcode(barcode) {
    throw new Error('findByBarcode method must be implemented');
  }

  /**
   * Find products in stock
   * @returns {Promise<Array>} Array of products in stock
   */
  async findInStock() {
    throw new Error('findInStock method must be implemented');
  }

  /**
   * Find products with low stock
   * @returns {Promise<Array>} Array of products with low stock
   */
  async findLowStock() {
    throw new Error('findLowStock method must be implemented');
  }

  /**
   * Find products by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Promise<Array>} Array of products in price range
   */
  async findByPriceRange(minPrice, maxPrice) {
    throw new Error('findByPriceRange method must be implemented');
  }

  /**
   * Find featured products
   * @returns {Promise<Array>} Array of featured products
   */
  async findFeatured() {
    throw new Error('findFeatured method must be implemented');
  }

  /**
   * Find products on discount
   * @returns {Promise<Array>} Array of products on discount
   */
  async findOnDiscount() {
    throw new Error('findOnDiscount method must be implemented');
  }

  /**
   * Search products by name, description, or tags
   * @param {string} searchTerm - The search term
   * @returns {Promise<Array>} Array of matching products
   */
  async search(searchTerm) {
    throw new Error('search method must be implemented');
  }

  /**
   * Find products by tags
   * @param {Array<string>} tags - Array of tags
   * @returns {Promise<Array>} Array of products with matching tags
   */
  async findByTags(tags) {
    throw new Error('findByTags method must be implemented');
  }

  /**
   * Find products by manufacturer
   * @param {string} manufacturer - The manufacturer name
   * @returns {Promise<Array>} Array of products by manufacturer
   */
  async findByManufacturer(manufacturer) {
    throw new Error('findByManufacturer method must be implemented');
  }

  /**
   * Update product stock
   * @param {string} id - The product ID
   * @param {number} quantity - The quantity to add/subtract
   * @returns {Promise<Object|null>} The updated product or null
   */
  async updateStock(id, quantity) {
    throw new Error('updateStock method must be implemented');
  }

  /**
   * Find products added by specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} Array of products added by user
   */
  async findByAddedBy(userId) {
    throw new Error('findByAddedBy method must be implemented');
  }

  /**
   * Find products by visibility status
   * @param {boolean} isVisible - Visibility status
   * @returns {Promise<Array>} Array of products
   */
  async findByVisibility(isVisible) {
    throw new Error('findByVisibility method must be implemented');
  }

  /**
   * Find products expiring soon
   * @param {number} days - Number of days ahead to check
   * @returns {Promise<Array>} Array of products expiring soon
   */
  async findExpiringSoon(days = 7) {
    throw new Error('findExpiringSoon method must be implemented');
  }

  /**
   * Find expired products
   * @returns {Promise<Array>} Array of expired products
   */
  async findExpired() {
    throw new Error('findExpired method must be implemented');
  }
}
