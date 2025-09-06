import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { Category } from '../entities/Category.js';
import appConfig from '../config/appConfig.js';


export class ManageCategoryUseCase {
  constructor() {
    this.categoryRepository = new CategoryRepository(appConfig.getDatabaseType());
  }

  async createCategory(categoryData, userId) {
    try {
      const validation = this.validateCategoryData(categoryData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          category: null
        };
      }

      const existingCategory = await this.categoryRepository.findByName(categoryData.name);
      if (existingCategory) {
        return {
          success: false,
          message: 'Category with this name already exists',
          category: null
        };
      }

      const categoryEntity = new Category({
        ...categoryData,
        isVisible: true
      });

      const createdCategory = await this.categoryRepository.create(categoryEntity.toJSON());

      return {
        success: true,
        message: 'Category created successfully',
        category: Category.fromJSON(createdCategory)
      };

    } catch (error) {
      console.error('Category creation error:', error);
      return {
        success: false,
        message: 'Category creation failed',
        category: null,
        error: error.message
      };
    }
  }

  async updateCategory(categoryId, updateData, userId) {
    try {
      const existingCategory = await this.categoryRepository.findById(categoryId);
      if (!existingCategory) {
        return {
          success: false,
          message: 'Category not found',
          category: null
        };
      }

      const validation = this.validateUpdateData(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          category: null
        };
      }

      const updatedCategory = await this.categoryRepository.update(categoryId, updateData);

      return {
        success: true,
        message: 'Category updated successfully',
        category: Category.fromJSON(updatedCategory)
      };

    } catch (error) {
      console.error('Category update error:', error);
      return {
        success: false,
        message: 'Category update failed',
        category: null,
        error: error.message
      };
    }
  }

  async deleteCategory(categoryId, userId) {
    try {
      const existingCategory = await this.categoryRepository.findById(categoryId);
      if (!existingCategory) {
        return {
          success: false,
          message: 'Category not found',
          category: null
        };
      }

      const productsInCategory = await this.categoryRepository.getProductsInCategory(categoryId);
      if (productsInCategory.length > 0) {
        return {
          success: false,
          message: 'Cannot delete category with existing products',
          category: null
        };
      }

      await this.categoryRepository.update(categoryId, { isVisible: false });

      return {
        success: true,
        message: 'Category deleted successfully',
        category: null
      };

    } catch (error) {
      console.error('Category deletion error:', error);
      return {
        success: false,
        message: 'Category deletion failed',
        category: null,
        error: error.message
      };
    }
  }

  async getCategories(filters = {}, limit = 50, offset = 0) {
    try {
      const categories = await this.categoryRepository.findAll(filters, limit, offset);

      return {
        success: true,
        message: 'Categories retrieved successfully',
        categories: categories.map(category => Category.fromJSON(category)),
        total: categories.length
      };

    } catch (error) {
      console.error('Get categories error:', error);
      return {
        success: false,
        message: 'Failed to retrieve categories',
        categories: [],
        total: 0,
        error: error.message
      };
    }
  }

  async getCategoryTree() {
    try {
      const categories = await this.categoryRepository.findAll({ isVisible: true });
      const categoryTree = this.buildCategoryTree(categories);

      return {
        success: true,
        message: 'Category tree retrieved successfully',
        categories: categoryTree
      };

    } catch (error) {
      console.error('Get category tree error:', error);
      return {
        success: false,
        message: 'Failed to retrieve category tree',
        categories: [],
        error: error.message
      };
    }
  }

  validateCategoryData(categoryData) {
    if (!categoryData || !categoryData.name) {
      return {
        isValid: false,
        message: 'Category name is required'
      };
    }

    if (categoryData.name.length < 2) {
      return {
        isValid: false,
        message: 'Category name must be at least 2 characters long'
      };
    }

    return { isValid: true };
  }

  validateUpdateData(updateData) {
    if (updateData.name && updateData.name.length < 2) {
      return {
        isValid: false,
        message: 'Category name must be at least 2 characters long'
      };
    }

    return { isValid: true };
  }

  buildCategoryTree(categories) {
    const categoryMap = new Map();
    const rootCategories = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });

    return rootCategories;
  }
}
