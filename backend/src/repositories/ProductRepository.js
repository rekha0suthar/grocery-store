import { BaseRepository } from './BaseRepository.js';
import { Product } from '@grocery-store/core/entities';

export class ProductRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super('products', databaseAdapter);
  }

  async create(productData) {
    const product = new Product(productData);
    const result = await super.create(product.toPersistence());
    return Product.fromJSON(result);
  }

  async update(id, productData) {
    const result = await super.update(id, productData);
    return result ? Product.fromJSON(result) : null;
  }

  async findById(id) {
    const result = await super.findById(id);
    return result ? Product.fromJSON(result) : null;
  }

  async findAll(filters = {}, limit = 100, offset = 0) {
    const results = await super.findAll(filters, limit, offset);
    return results.map(product => Product.fromJSON(product));
  }

  async findByCategory(categoryId, limit = 100, offset = 0) {
    const results = await this.findAll({ categoryId, isVisible: true }, limit, offset);
    return results;
  }

  async findFeatured(limit = 20) {
    const results = await this.findAll({ isFeatured: true, isVisible: true }, limit, 0);
    return results;
  }

  async findInStock(limit = 100, offset = 0) {
    const results = await this.findAll({ isVisible: true }, limit, offset);
    return results;
  }

  async findLowStock() {
    const products = await this.findAll({ isVisible: true }, 1000, 0);
    return products.filter(product => product.stock <= product.minStock);
  }

  async searchProducts(searchTerm, limit = 50, offset = 0) {
    const products = await this.findAll({ isVisible: true }, 1000, 0);
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.slice(offset, offset + limit);
  }

  async findBySku(sku) {
    const result = await this.findByField('sku', sku);
    return result ? Product.fromJSON(result) : null;
  }

  async updateStock(id, newStock) {
    const result = await this.update(id, { stock: newStock });
    return result;
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
