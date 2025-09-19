import { BaseController } from './BaseController.js';
import { CategoryComposition } from '../composition/CategoryComposition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class CategoryController extends BaseController {
  constructor() {
    super();
    this.categoryComposition = new CategoryComposition();
  }

  // Optimized getAllCategories method with cursor pagination
  getAllCategories = asyncHandler(async (req, res) => {
    const { 
      limit = 12, 
      cursor, 
      lastDocId,
      parentId,
      activeOnly = 'true' 
    } = req.query;

    try {
      // Parse cursor from lastDocId if provided
      const paginationCursor = cursor || lastDocId;
      const pageSize = Math.min(parseInt(limit), 20); // Cap at 20 for performance

      // Build filters
      const filters = {};
      if (activeOnly === 'true') filters.isActive = true;
      if (parentId !== undefined) filters.parentId = parentId;

      const result = await this.categoryComposition.getManageCategoryUseCase().execute('getAllCategoriesWithCursor', {
        filters,
        pageSize,
        cursor: paginationCursor
      });

      if (result.quotaExceeded) {
        return this.sendError(res, 'Service temporarily unavailable due to high demand. Please try again later.', 503);
      }

      // Transform result for consistent API response
      const response = {
        success: true,
        message: 'Categories retrieved successfully',
        categories: result.items || result.categories || [],
        pagination: {
          hasNext: result.hasNext || false,
          hasPrev: result.hasPrev || false,
          nextCursor: result.lastDoc?.id || null,
          limit: pageSize
        }
      };

      return res.status(200).json(response);
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
