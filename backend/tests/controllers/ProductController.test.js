import { ProductController } from '../../src/controllers/ProductController.js';

// Mock dependencies
jest.mock('../../src/composition/ProductComposition.js');

import { ProductComposition } from '../../src/composition/ProductComposition.js';

describe('ProductController - HTTP Interface Adapter', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;
  let mockCreateProductUseCase;
  let mockManageProductUseCase;

  beforeEach(() => {
    // Mock use cases
    mockCreateProductUseCase = {
      execute: jest.fn()
    };
    
    mockManageProductUseCase = {
      execute: jest.fn()
    };
    
    // Mock composition
    const mockProductComposition = {
      getCreateProductUseCase: jest.fn().mockReturnValue(mockCreateProductUseCase),
      getManageProductUseCase: jest.fn().mockReturnValue(mockManageProductUseCase)
    };
    
    ProductComposition.mockImplementation(() => mockProductComposition);
    
    // Create controller
    controller = new ProductController();
    
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
    test('creates ProductController instance', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(ProductController);
    });

    test('has required methods', () => {
      expect(typeof controller.getAllProducts).toBe('function');
      expect(typeof controller.getProductById).toBe('function');
      expect(typeof controller.createProduct).toBe('function');
      expect(typeof controller.updateProduct).toBe('function');
      expect(typeof controller.deleteProduct).toBe('function');
      expect(typeof controller.updateStock).toBe('function');
      expect(typeof controller.searchProducts).toBe('function');
    });
  });

  describe('Get All Products', () => {
    test('retrieves products successfully', async () => {
      const mockProducts = [
        { id: 'prod1', name: 'Product 1', price: 10 },
        { id: 'prod2', name: 'Product 2', price: 20 }
      ];
      
      mockManageProductUseCase.execute.mockResolvedValue(mockProducts);
      
      await controller.getAllProducts(mockReq, mockRes, mockNext);
      
      expect(mockManageProductUseCase.execute).toHaveBeenCalledWith(
        'getAllProducts',
        { limit: 20, offset: 0, filters: { featured: undefined, inStock: undefined } }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Products retrieved successfully',
        data: mockProducts
      });
    });
  });

  describe('Create Product', () => {
    test('creates product successfully', async () => {
      const productData = { name: 'New Product', price: 15, sku: 'NEW001' };
      const createdProduct = { id: 'prod1', ...productData };
      
      mockReq.body = productData;
      mockCreateProductUseCase.execute.mockResolvedValue(createdProduct);
      
      await controller.createProduct(mockReq, mockRes, mockNext);
      
      expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith(
        'createProduct',
        productData
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product created successfully',
        data: createdProduct
      });
    });
  });

  describe('Get Product by ID', () => {
    test('retrieves product successfully', async () => {
      const product = { id: 'prod1', name: 'Test Product', price: 10 };
      
      mockReq.params = { id: 'prod1' };
      mockManageProductUseCase.execute.mockResolvedValue(product);
      
      await controller.getProductById(mockReq, mockRes, mockNext);
      
      expect(mockManageProductUseCase.execute).toHaveBeenCalledWith(
        'getProductById',
        { id: 'prod1' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      });
    });
  });
});
