import { asyncHandler } from '../middleware/errorHandler.js';
import { BaseController } from './BaseController.js';
import { CategoryComposition } from '../composition/CategoryComposition.js';

export class CategoryController extends BaseController {
  constructor() {
    super();
    this.categoryComposition = new CategoryComposition();
  }

  getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await this.categoryComposition.getManageCategoryUseCase().execute('getAllCategories', {
      limit: parseInt(limit),
      offset
    });

    return res.status(result.success ? 200 : 400).json(result);
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const result = await this.categoryComposition.getManageCategoryUseCase().execute('getCategoryById', { id });
    
    return res.status(result.success ? 200 : 400).json(result);
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
