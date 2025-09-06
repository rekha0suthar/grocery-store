import { BaseController } from './BaseController.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class CategoryController extends BaseController {
  constructor() {
    super();
    this.categoryRepository = new CategoryRepository();
  }

  getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, parent, visible } = req.query;
    const offset = (page - 1) * limit;

    let categories;

    if (parent === 'null' || parent === '') {
      categories = await this.categoryRepository.findRootCategories(parseInt(limit), offset);
    } else if (parent) {
      categories = await this.categoryRepository.findByParent(parent, parseInt(limit), offset);
    } else if (visible === 'true') {
      categories = await this.categoryRepository.findVisible(parseInt(limit), offset);
    } else {
      categories = await this.categoryRepository.findAll(parseInt(limit), offset);
    }

    return this.sendSuccess(res, {
      categories: categories.map(category => category.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: categories.length
      }
    }, 'Categories retrieved successfully');
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      return this.sendNotFound(res, 'Category not found');
    }

    return this.sendSuccess(res, category.toJSON(), 'Category retrieved successfully');
  });

  createCategory = asyncHandler(async (req, res) => {
    const categoryData = req.body;
    const category = await this.categoryRepository.create(categoryData);
    return this.sendSuccess(res, category.toJSON(), 'Category created successfully', 201);
  });

  updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCategory = await this.categoryRepository.update(id, updateData);
    if (!updatedCategory) {
      return this.sendNotFound(res, 'Category not found');
    }

    return this.sendSuccess(res, updatedCategory.toJSON(), 'Category updated successfully');
  });

  deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if category has products
    const hasProducts = await this.categoryRepository.hasProducts(id);
    if (hasProducts) {
      return this.sendError(res, 'Cannot delete category with existing products', 400);
    }

    // Check if category has subcategories
    const hasSubcategories = await this.categoryRepository.hasSubcategories(id);
    if (hasSubcategories) {
      return this.sendError(res, 'Cannot delete category with subcategories', 400);
    }

    const deletedCategory = await this.categoryRepository.delete(id);
    if (!deletedCategory) {
      return this.sendNotFound(res, 'Category not found');
    }

    return this.sendSuccess(res, null, 'Category deleted successfully');
  });

  getCategoryTree = asyncHandler(async (req, res) => {
    const tree = await this.categoryRepository.getCategoryTree();
    return this.sendSuccess(res, { tree }, 'Category tree retrieved successfully');
  });
}
