import { BaseController } from './BaseController.js';
import { CategoryComposition } from '../composition/CategoryComposition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class CategoryController extends BaseController {
  constructor() {
    super();
    this.categoryComposition = new CategoryComposition();
  }

  getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const categories = await this.categoryComposition.getManageCategoryUseCase().execute('getAllCategories', {
      limit: parseInt(limit),
      offset
    });

    this.sendSuccess(res, categories, 'Categories retrieved successfully');
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const category = await this.categoryComposition.getManageCategoryUseCase().execute('getCategoryById', { id });
    
    if (!category) {
      return this.sendNotFound(res, 'Category not found');
    }
    
    this.sendSuccess(res, category, 'Category retrieved successfully');
  });

  createCategory = asyncHandler(async (req, res) => {
    const categoryData = req.body;
    
    const category = await this.categoryComposition.getManageCategoryUseCase().execute('createCategory', categoryData);
    
    this.sendSuccess(res, category, 'Category created successfully', 201);
  });

  updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const category = await this.categoryComposition.getManageCategoryUseCase().execute('updateCategory', {
      id,
      ...updateData
    });
    
    if (!category) {
      return this.sendNotFound(res, 'Category not found');
    }
    
    this.sendSuccess(res, category, 'Category updated successfully');
  });

  deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const success = await this.categoryComposition.getManageCategoryUseCase().execute('deleteCategory', { id });
    
    if (!success) {
      return this.sendNotFound(res, 'Category not found');
    }
    
    this.sendSuccess(res, null, 'Category deleted successfully');
  });

  getCategoryTree = asyncHandler(async (req, res) => {
    const categories = await this.categoryComposition.getManageCategoryUseCase().execute('getCategoryTree');
    
    this.sendSuccess(res, categories, 'Category tree retrieved successfully');
  });

}
