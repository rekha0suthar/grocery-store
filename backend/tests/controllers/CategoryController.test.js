import { CategoryController } from '../../src/controllers/CategoryController.js';
import { CategoryComposition } from '../../src/composition/CategoryComposition.js';

// Mock dependencies
jest.mock('../../src/composition/CategoryComposition.js');

describe('CategoryController - HTTP Interface Adapter', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;
  let mockManageCategoryUseCase;

  beforeEach(() => {
    // Mock use case
    mockManageCategoryUseCase = {
      execute: jest.fn()
    };
    
    // Mock composition
    const mockCategoryComposition = {
      getManageCategoryUseCase: jest.fn().mockReturnValue(mockManageCategoryUseCase)
    };
    
    CategoryComposition.mockImplementation(() => mockCategoryComposition);
    
    // Create controller
    controller = new CategoryController();
    
    // Mock Express objects
    mockReq = {
      body: {},
      query: {},
      params: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('creates CategoryController instance', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(CategoryController);
    });

    test('has required methods', () => {
      expect(typeof controller.getAllCategories).toBe('function');
      expect(typeof controller.getCategoryById).toBe('function');
      expect(typeof controller.createCategory).toBe('function');
      expect(typeof controller.updateCategory).toBe('function');
      expect(typeof controller.deleteCategory).toBe('function');
    });
  });

  describe('Get All Categories', () => {
    test('retrieves categories successfully', async () => {
      const mockCategories = [
        { id: 'cat1', name: 'Category 1' },
        { id: 'cat2', name: 'Category 2' }
      ];
      
      mockManageCategoryUseCase.execute.mockResolvedValue(mockCategories);
      
      await controller.getAllCategories(mockReq, mockRes, mockNext);
      
      expect(mockManageCategoryUseCase.execute).toHaveBeenCalledWith(
        'getAllCategories',
        { limit: 20, offset: 0 }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Categories retrieved successfully',
        data: mockCategories
      });
    });
  });

  describe('Create Category', () => {
    test('creates category successfully', async () => {
      const categoryData = { name: 'New Category', description: 'A new category' };
      const createdCategory = { id: 'cat1', ...categoryData };
      
      mockReq.body = categoryData;
      mockManageCategoryUseCase.execute.mockResolvedValue(createdCategory);
      
      await controller.createCategory(mockReq, mockRes, mockNext);
      
      expect(mockManageCategoryUseCase.execute).toHaveBeenCalledWith(
        'createCategory',
        categoryData
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Category created successfully',
        data: createdCategory
      });
    });
  });
});
