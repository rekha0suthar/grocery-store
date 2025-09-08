import { BaseRepository } from './BaseRepository.js';
import { Category } from '@grocery-store/core/entities';

export class CategoryRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super('categories', databaseAdapter);
  }

  async findBySlug(slug) {
    return await this.findByField('slug', slug);
  }

  async findRootCategories(limit = 100, offset = 0) {
    return await this.findAll({ parentId: null, isVisible: true }, limit, offset);
  }

  async findByParent(parentId, limit = 100, offset = 0) {
    return await this.findAll({ parentId, isVisible: true }, limit, offset);
  }

  async findVisible(limit = 100, offset = 0) {
    return await this.findAll({ isVisible: true }, limit, offset);
  }

  async hasProducts(categoryId) {
    // Note: This would need a more complex query in Firestore
    // For now, we'll return false as a placeholder
    return false;
  }

  async hasSubcategories(categoryId) {
    const subcategories = await this.findAll({ parentId: categoryId }, 1, 0);
    return subcategories.length > 0;
  }

  async getCategoryTree() {
    // Note: This is a simplified implementation for Firestore
    // Firestore doesn't support recursive queries natively
    const categories = await this.findAll({ isVisible: true }, 1000, 0);
    
    // Build tree structure in memory
    const categoryMap = new Map();
    const rootCategories = [];
    
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });
    
    categories.forEach(category => {
      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId).children.push(categoryMap.get(category.id));
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });
    
    return rootCategories;
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
