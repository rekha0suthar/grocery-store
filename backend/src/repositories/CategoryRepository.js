import { BaseRepository } from './BaseRepository.js';
import { Category } from '@grocery-store/core/entities';

export class CategoryRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super('categories', databaseAdapter);
  }

  async create(categoryData) {
    const category = new Category(categoryData);
    const result = await super.create(category.toPersistence());
    return Category.fromJSON(result);
  }

  async update(id, categoryData) {
    const result = await super.update(id, categoryData);
    return result ? Category.fromJSON(result) : null;
  }

  async findById(id) {
    const result = await super.findById(id);
    return result ? Category.fromJSON(result) : null;
  }

  async findAll(filters = {}, limit = 100, offset = 0) {
    const results = await super.findAll(filters, limit, offset);
    return results.map(category => Category.fromJSON(category));
  }

  async findBySlug(slug) {
    const result = await this.findByField('slug', slug);
    return result ? Category.fromJSON(result) : null;
  }

  async findRootCategories(limit = 100, offset = 0) {
    const results = await this.findAll({ parentId: null, isVisible: true }, limit, offset);
    return results;
  }

  async findByParent(parentId, limit = 100, offset = 0) {
    const results = await this.findAll({ parentId, isVisible: true }, limit, offset);
    return results;
  }

  async findVisible(limit = 100, offset = 0) {
    const results = await this.findAll({ isVisible: true }, limit, offset);
    return results;
  }

  async hasProducts(categoryId) {
    const count = await this.db.count('products', { categoryId });
    return count > 0;
  }

  async hasSubcategories(categoryId) {
    const subcategories = await this.findAll({ parentId: categoryId }, 1, 0);
    return subcategories.length > 0;
  }

  async getCategoryTree() {
    const categories = await this.findAll({ isVisible: true }, 1000, 0);
    
    // Build tree structure in memory
    const categoryMap = new Map();
    const rootCategories = [];
    
    categories.forEach(category => {
      const categoryObj = { ...category.toJSON(), children: [] };
      categoryMap.set(category.id, categoryObj);
    });
    
    categories.forEach(category => {
      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId).children.push(categoryMap.get(category.id));
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });
    
    return rootCategories.map(cat => Category.fromJSON(cat));
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
