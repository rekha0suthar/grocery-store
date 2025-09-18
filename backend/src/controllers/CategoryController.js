import { BaseController } from './BaseController.js';
import { CategoryComposition } from '../composition/CategoryComposition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class CategoryController extends BaseController {
  constructor() {
    super();
    this.categoryComposition = new CategoryComposition();
  }

  getAllCategories = asyncHandler(async (req, res) => {
    const { limit = 5, cursor } = req.query; // Reduced default limit

    try {
      const result = await this.categoryComposition.getManageCategoryUseCase().execute('getAllCategories', {
        limit: Math.min(parseInt(limit), 10), // Cap at 10 to save quota
        cursor
      });

      if (result.quotaExceeded) {
        return this.sendError(res, 'Service temporarily unavailable due to high demand. Please try again later.', 503);
      }

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error.message.includes('quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return this.sendError(res, 'Service temporarily unavailable. Please try again later.', 503);
      }
      throw error;
    }
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      const result = await this.categoryComposition.getManageCategoryUseCase().execute('getCategoryById', { id });
      
      if (result.quotaExceeded) {
        return this.sendError(res, 'Service temporarily unavailable. Please try again later.', 503);
      }
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error.message.includes('quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return this.sendError(res, 'Service temporarily unavailable. Please try again later.', 503);
      }
      throw error;
    }
  });

  createCategory = asyncHandler(async (req, res) => {
    const categoryData = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const result = await this.categoryComposition.getManageCategoryUseCase().execute('createCategory', {
      ...categoryData,
      userRole,
      userId
    });
    
    return res.status(result.success ? 201 : 400).json(result);
  });

  updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const result = await this.categoryComposition.getManageCategoryUseCase().execute('updateCategory', {
      id,
      ...updateData,
      userRole,
      userId
    });
    
    return res.status(result.success ? 200 : 400).json(result);
  });

  deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const result = await this.categoryComposition.getManageCategoryUseCase().execute('deleteCategory', { 
      id, 
      userRole, 
      userId 
    });
    
    console.log('DELETE CATEGORY RESULT:', JSON.stringify(result, null, 2));
    return res.status(result.success ? 200 : 400).json(result);
  });

  getCategoryTree = asyncHandler(async (req, res) => {
    const result = await this.categoryComposition.getManageCategoryUseCase().execute('getCategoryTree');
    
    return res.status(result.success ? 200 : 400).json(result);
  });
}
