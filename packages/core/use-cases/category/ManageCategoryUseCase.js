import { DefaultClock } from "../../adapters/DefaultClock.js";
import { Category } from '../../entities/Category.js';

export class ManageCategoryUseCase {
  constructor({ categoryRepo }, clock = null) {
    this.categoryRepository = categoryRepo;
    this.clock = clock || new DefaultClock();
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

      const slug = categoryData.slug || this.generateSlug(categoryData.name);

      const category = new Category({
        name: categoryData.name,
        description: categoryData.description || '',
        slug: slug,
        imageUrl: categoryData.imageUrl || '',
        parentId: categoryData.parentId || null,
        isActive: true,
        createdBy: userId
      });

      const createdCategory = await this.categoryRepository.create(category.toPersistence());

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

  async updateCategory(categoryId, categoryData, userRole, userId) {
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

      const validation = this.validateCategoryData(categoryData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          category: null
        };
      }

      if (categoryData.name && categoryData.name !== existingCategory.name) {
        const nameConflict = await this.categoryRepository.findByName(categoryData.name);
        if (nameConflict && nameConflict.id !== categoryId) {
          return {
            success: false,
            message: 'Category with this name already exists',
            category: null
          };
        }
      }

      const updatedData = {
        ...existingCategory.toJSON(), // Use toJSON() to get plain object
        ...categoryData,
        updatedAt: this.clock.now(),
        updatedBy: userId
      };

      const updatedCategory = await this.categoryRepository.update(categoryId, updatedData);

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

  async deleteCategory(categoryId, userRole) {
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

      if (this.categoryRepository.hasProducts) {
        const hasProducts = await this.categoryRepository.hasProducts(categoryId);
        if (hasProducts) {
          return {
            success: false,
            message: 'Cannot delete category with existing products',
            category: null
          };
        }
      }

      if (this.categoryRepository.hasSubcategories) {
        const hasSubcategories = await this.categoryRepository.hasSubcategories(categoryId);
        if (hasSubcategories) {
          return {
            success: false,
            message: 'Cannot delete category with subcategories',
            category: null
          };
        }
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

  async getAllCategories(limit = 20, offset = 0) {
    try {
      const page = Math.floor(offset / limit) + 1;
      
      // Get categories and total count in parallel
      const [categoriesData, totalCount] = await Promise.all([
        this.categoryRepository.findAll({}, limit, offset),
        this.categoryRepository.count({})
      ]);
      
      const categories = categoriesData.map(data => Category.fromJSON(data));

      // Add product counts to each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productCount = await this.categoryRepository.getProductCount(category.id);
          // Add productCount to the category object
          const categoryWithCount = category.toJSON();
          categoryWithCount.productCount = productCount;
          return categoryWithCount;
        })
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: 'Categories retrieved successfully',
        categories: categoriesWithCounts,
        pagination: {
          page: page,
          limit: limit,
          total: totalCount,
          pages: totalPages,
          hasMore: page < totalPages
        }
      };
    } catch (error) {
      console.error('Category retrieval error:', error);
      return {
        success: false,
        message: 'Failed to retrieve categories',
        categories: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0,
          pages: 0,
          hasMore: false
        },
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

  async execute(action, params) {
    switch (action) {
      case 'createCategory':
        return await this.createCategory(params, params.userRole, params.userId);
      case 'updateCategory':
        return await this.updateCategory(params.id, params, params.userRole, params.userId);
      case 'deleteCategory':
        return await this.deleteCategory(params.id, params.userRole, params.userId);
      case 'getAllCategories':
        case 'getAllCategoriesWithCursor':
          return await this.getAllCategoriesWithCursor(params);
        return await this.getAllCategories(params.limit, params.offset);
      case 'getCategoryById':
        return await this.getCategoryById(params.id);
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
      
      // Add product counts to each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productCount = await this.categoryRepository.getProductCount(category.id);
          // Add productCount to the category object
          const categoryWithCount = category.toJSON();
          categoryWithCount.productCount = productCount;
          return categoryWithCount;
        })
      );
      
      const categoryMap = new Map();
      const rootCategories = [];
      
      categoriesWithCounts.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });
      
      categoriesWithCounts.forEach(category => {
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

  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  validateCategoryData(categoryData) {
    if (!categoryData.name || categoryData.name.trim().length < 2) {
      return {
        isValid: false,
        message: 'Category name is required'
      };
    }

    if (categoryData.description && categoryData.description.length > 1000) {
      return {
        isValid: false,
        message: 'Category description must be less than 1000 characters'
      };
    }

    if (categoryData.imageUrl && !this.isValidUrl(categoryData.imageUrl)) {
      return {
        isValid: false,
        message: 'Category image URL must be a valid URL'
      };
    }

    return {
      isValid: true,
      message: 'Category data is valid'
    };
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  canManageCategories(userRole) {
    return ['admin', 'store_manager'].includes(userRole);
  }
  // Optimized cursor-based pagination methods
  async getAllCategoriesWithCursor(options = {}) {
    try {
      const {
        filters = {},
        pageSize = 12,
        cursor = null
      } = options;

      // Use the database adapter's optimized cursor method
      const result = await this.categoryRepository.db.findCategoriesWithCursor({
        filters,
        pageSize,
        cursor: cursor ? { id: cursor } : null,
        orderByField: 'createdAt',
        orderDirection: 'desc'
      });

      // Transform items to Category entities and add product counts efficiently
      const categoriesWithCounts = await Promise.all(
        result.items.map(async (data) => {
          const category = Category.fromJSON(data);
          // Only get product count for first page to avoid quota issues
          const productCount = cursor ? 0 : await this.categoryRepository.getProductCount(category.id).catch(() => 0);
          
          const categoryJson = category.toJSON();
          categoryJson.productCount = productCount;
          return categoryJson;
        })
      );

      return {
        success: true,
        message: 'Categories retrieved successfully',
        categories: categoriesWithCounts,
        items: categoriesWithCounts,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        lastDoc: result.lastDoc,
        quotaExceeded: result.quotaExceeded || false
      };

    } catch (error) {
      console.error('Get categories with cursor error:', error);
      return {
        success: false,
        message: 'Failed to retrieve categories',
        categories: [],
        items: [],
        hasNext: false,
        hasPrev: false,
        lastDoc: null,
        quotaExceeded: error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'),
        error: error.message
      };
    }
  }
}
