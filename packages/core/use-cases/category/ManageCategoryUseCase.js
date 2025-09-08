import { Category } from '../../entities/Category.js';

/**
 * Manage Category Use Case - Business Logic
 * Handles category creation, updates, and management
 */
export class ManageCategoryUseCase {
  /**
   * @param {{ categoryRepo: { findByName(name):Promise<Category>, findById(id):Promise<Category>, create(data):Promise<Category>, update(id, data):Promise<Category>, findAll(filters, limit, offset):Promise<Category[]> } }} deps
   */
  constructor({ categoryRepo }) {
    this.categoryRepository = categoryRepo;
  }

  async createCategory(categoryData, userRole, userId) {
    try {
      if (!this.canManageCategories(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to manage categories',
          category: null
        };
      }

      if (!categoryData) {
        return {
          success: false,
          message: 'Category data is required',
          category: null
        };
      }

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

      const category = new Category({
        name: categoryData.name,
        description: categoryData.description || '',
        parentId: categoryData.parentId || null,
        isActive: true,
        createdBy: userId
      });

      const createdCategory = await this.categoryRepository.create(category.toJSON());

      return {
        success: true,
        message: 'Category created successfully',
        category: Category.fromJSON(createdCategory)
      };

    } catch (error) {
      console.error('Category creation error:', error);
      return {
        success: false,
        message: 'Failed to create category',
        category: null,
        error: error.message
      };
    }
  }

  async updateCategory(categoryId, updateData, userRole, userId) {
    try {
      if (!this.canManageCategories(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to manage categories',
          category: null
        };
      }

      const existingCategory = await this.categoryRepository.findById(categoryId);
      if (!existingCategory) {
        return {
          success: false,
          message: 'Category not found',
          category: null
        };
      }

      const category = Category.fromJSON(existingCategory);

      // Update category data
      if (updateData.name !== undefined) category.name = updateData.name;
      if (updateData.description !== undefined) category.description = updateData.description;
      if (updateData.parentId !== undefined) category.parentId = updateData.parentId;
      if (updateData.isActive !== undefined) category.isActive = updateData.isActive;

      const validation = this.validateCategoryData(category.toJSON());
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          category: null
        };
      }

      // Check for name conflicts
      if (updateData.name !== undefined && updateData.name !== existingCategory.name) {
        const conflictingCategory = await this.categoryRepository.findByName(updateData.name);
        if (conflictingCategory && conflictingCategory.id !== categoryId) {
          return {
            success: false,
            message: 'Category with this name already exists',
            category: null
          };
        }
      }
      const updatedCategory = await this.categoryRepository.update(categoryId, category.toJSON());

      return {
        success: true,
        message: 'Category updated successfully',
        category: Category.fromJSON(updatedCategory)
      };

    } catch (error) {
      console.error('Category update error:', error);
      return {
        success: false,
        message: 'Failed to update category',
        category: null,
        error: error.message
      };
    }
  }

  async getCategory(categoryId) {
    try {
      const categoryData = await this.categoryRepository.findById(categoryId);
      if (!categoryData) {
        return {
          success: false,
          message: 'Category not found',
          category: null
        };
      }

      return {
        success: true,
        message: 'Category retrieved successfully',
        category: Category.fromJSON(categoryData)
      };

    } catch (error) {
      console.error('Category retrieval error:', error);
      return {
        success: false,
        message: 'Failed to retrieve category',
        category: null,
        error: error.message
      };
    }
  }

  async getAllCategories(filters = {}, limit = 50, offset = 0) {
    try {
      const categoriesData = await this.categoryRepository.findAll(filters, limit, offset);
      const categories = categoriesData.map(data => Category.fromJSON(data));

      return {
        success: true,
        message: 'Categories retrieved successfully',
        categories: categories
      };

    } catch (error) {
      console.error('Categories retrieval error:', error);
      return {
        success: false,
        message: 'Failed to retrieve categories',
        categories: [],
        error: error.message
      };
    }
  }

  async deleteCategory(categoryId, userRole, userId) {
    try {
      if (!this.canManageCategories(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to manage categories',
          category: null
        };
      }

      const existingCategory = await this.categoryRepository.findById(categoryId);
      if (!existingCategory) {
        return {
          success: false,
          message: 'Category not found',
          category: null
        };
      }

      const category = Category.fromJSON(existingCategory);

      // Check if category can be deleted (business rules)
      if (!category.canBeDeleted()) {
        return {
          success: false,
          message: 'Category cannot be deleted due to business constraints',
          category: null
        };
      }

      await this.categoryRepository.delete(categoryId);

      return {
        success: true,
        message: 'Category deleted successfully',
        category: null
      };

    } catch (error) {
      console.error('Category deletion error:', error);
      return {
        success: false,
        message: 'Failed to delete category',
        category: null,
        error: error.message
      };
    }
  }

  async getCategoryById(categoryId) {
    try {
      const categoryData = await this.categoryRepository.findById(categoryId);
      if (!categoryData) {
        return {
          success: false,
          message: 'Category not found',
          category: null
        };
      }

      return {
        success: true,
        message: 'Category retrieved successfully',
        category: Category.fromJSON(categoryData)
      };

    } catch (error) {
      console.error('Category retrieval error:', error);
      return {
        success: false,
        message: 'Failed to retrieve category',
        category: null,
        error: error.message
      };
    }
  }

  validateCategoryData(categoryData) {
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      return {
        isValid: false,
        message: 'Category name is required'
      };
    }

    if (categoryData.name.length > 100) {
      return {
        isValid: false,
        message: 'Category name must be less than 100 characters'
      };
    }

    if (categoryData.description && categoryData.description.length > 500) {
      return {
        isValid: false,
        message: 'Category description must be less than 500 characters'
      };
    }

    return {
      isValid: true,
      message: 'Category data is valid'
    };
  }

  canManageCategories(userRole) {
    return ['admin', 'store_manager'].includes(userRole);
  }

  async execute(action, params = {}) {
    switch (action) {
      case 'getAllCategories':
        return await this.getAllCategories(params.filters, params.limit, params.offset);
      
      case 'getCategoryById':
        return await this.getCategoryById(params.id);
      
      case 'createCategory':
        return await this.createCategory(params, params.userRole, params.userId);
      
      case 'updateCategory':
        return await this.updateCategory(params.id, params, params.userRole, params.userId);
      
      case 'deleteCategory':
        return await this.deleteCategory(params.id, params.userRole, params.userId);
      
      case 'getCategoryTree':
        return await this.getCategoryTree();
      
      default:
        return {
          success: false,
          message: `Unknown action: ${action}`,
          data: null
        };
    }
  }

  async getCategoryTree() {
    try {
      const categoriesData = await this.categoryRepository.findAll({}, 1000, 0);
      const categories = categoriesData.map(data => Category.fromJSON(data));
      
      // Build tree structure
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
      
      return {
        success: true,
        message: 'Category tree retrieved successfully',
        categories: rootCategories
      };
    } catch (error) {
      console.error('Category tree retrieval error:', error);
      return {
        success: false,
        message: 'Failed to retrieve category tree',
        categories: [],
        error: error.message
      };
    }
  }
}
