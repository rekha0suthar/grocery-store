import { BaseController } from './BaseController.js';
import { ProductComposition } from '../composition/ProductComposition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class ProductController extends BaseController {
  constructor() {
    super();
    this.productComposition = new ProductComposition();
  }

  getAllProducts = asyncHandler(async (req, res) => {
    const { 
      limit = 5, // Reduced default limit to save quota
      cursor, // Document ID to start after
      category, 
      featured, 
      inStock, 
      search 
    } = req.query;

    try {
      let products;

      if (search) {
        // For search, we'll use the legacy method but with reduced limit
        products = await this.productComposition.getManageProductUseCase().execute('searchProducts', {
          query: search,
          limit: Math.min(parseInt(limit), 10), // Cap search results
          offset: 0
        });
      } else if (featured === 'true') {
        products = await this.productComposition.getManageProductUseCase().execute('getFeaturedProducts', {
          limit: Math.min(parseInt(limit), 5),
          cursor
        });
      } else if (category) {
        products = await this.productComposition.getManageProductUseCase().execute('findByCategory', {
          categoryId: category,
          limit: Math.min(parseInt(limit), 10),
          cursor
        });
      } else {
        const filters = {};
        if (inStock !== undefined) filters.inStock = inStock;
        
        products = await this.productComposition.getManageProductUseCase().execute('getAllProducts', {
          limit: Math.min(parseInt(limit), 10), // Cap at 10 to save quota
          cursor,
          ...filters
        });
      }

      this.sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error) {
      // Handle quota exceeded error gracefully
      if (error.message.includes('quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return this.sendError(res, 'Service temporarily unavailable due to high demand. Please try again later.', 503);
      }
      throw error;
    }
  });

  getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      const product = await this.productComposition.getManageProductUseCase().execute('getProductById', { id });
      
      if (!product) {
        return this.sendError(res, 'Product not found', 404);
      }

      this.sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
      if (error.message.includes('quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return this.sendError(res, 'Service temporarily unavailable. Please try again later.', 503);
      }
      throw error;
    }
  });

  createProduct = asyncHandler(async (req, res) => {
    const productData = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const product = await this.productComposition.getCreateProductUseCase().execute(productData, userRole, userId);
    
    this.sendSuccess(res, product, 'Product created successfully', 201);
  });

  updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const product = await this.productComposition.getManageProductUseCase().execute('updateProduct', {
      id,
      ...updateData,
      userRole,
      userId
    });
    
    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, product, 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const result = await this.productComposition.getManageProductUseCase().execute('deleteProduct', { 
      id, 
      userRole, 
      userId 
    });
    
    if (!result) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, result, 'Product deleted successfully');
  });

  updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stock, operation } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const product = await this.productComposition.getManageProductUseCase().execute('updateStock', {
      id,
      stock,
      operation,
      userRole,
      userId
    });
    
    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, product, 'Stock updated successfully');
  });

  addImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const product = await this.productComposition.getManageProductUseCase().execute('addImage', {
      id,
      imageUrl,
      userRole,
      userId
    });
    
    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, product, 'Image added successfully');
  });

  removeImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const product = await this.productComposition.getManageProductUseCase().execute('removeImage', {
      id,
      imageUrl,
      userRole,
      userId
    });
    
    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, product, 'Image removed successfully');
  });

  searchProducts = asyncHandler(async (req, res) => {
    const { q: query, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const products = await this.productComposition.getManageProductUseCase().execute('searchProducts', {
      query,
      limit: parseInt(limit),
      offset
    });
    
    this.sendSuccess(res, products, 'Search results retrieved successfully');
  });

  getLowStockProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const products = await this.productComposition.getManageProductUseCase().execute('getLowStockProducts', {
      limit: parseInt(limit),
      offset
    });
    
    this.sendSuccess(res, products, 'Low stock products retrieved successfully');
  });

  getFeaturedProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    
    const products = await this.productComposition.getManageProductUseCase().execute('getFeaturedProducts', {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    this.sendSuccess(res, products, 'Featured products retrieved successfully');
  });
}
