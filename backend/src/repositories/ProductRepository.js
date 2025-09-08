import { BaseRepository } from './BaseRepository.js';
import { Product } from '@grocery-store/core/entities';

export class ProductRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super('products', databaseAdapter);
  }

  async findByCategory(categoryId, limit = 100, offset = 0) {
    return await this.findAll({ categoryId, isVisible: true }, limit, offset);
  }

  async findFeatured(limit = 20) {
    return await this.findAll({ isFeatured: true, isVisible: true }, limit, 0);
  }

  async findInStock(limit = 100, offset = 0) {
    return await this.findAll({ isVisible: true }, limit, offset);
  }

  async findLowStock() {
    // Note: This would need a more complex query in Firestore
    // For now, we'll get all products and filter in memory
    const products = await this.findAll({ isVisible: true }, 1000, 0);
    return products.filter(product => product.stock <= product.minStock);
  }

  async searchProducts(searchTerm, limit = 50, offset = 0) {
    // Note: Firestore doesn't support full-text search natively
    // This is a simplified implementation
    const products = await this.findAll({ isVisible: true }, 1000, 0);
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.slice(offset, offset + limit);
  }

  async findBySku(sku) {
    return await this.findByField('sku', sku);
  }

  async updateStock(id, newStock) {
    return await this.update(id, { stock: newStock });
  }

  async reduceStock(id, quantity) {
    const product = await this.findById(id);
    if (!product || product.stock < quantity) {
      return null;
    }
    return await this.update(id, { stock: product.stock - quantity });
  }

  async addStock(id, quantity) {
    const product = await this.findById(id);
    if (!product) {
      return null;
    }
    return await this.update(id, { stock: product.stock + quantity });
  }
}