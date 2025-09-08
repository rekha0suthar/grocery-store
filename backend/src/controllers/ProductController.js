import { BaseController } from './BaseController.js';
import { ProductComposition } from '../composition/ProductComposition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class ProductController extends BaseController {
  constructor() {
    super();
    this.productComposition = new ProductComposition();
  }

  getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, category, featured, inStock, search } = req.query;
    const offset = (page - 1) * limit;

    let products;

    if (search) {
      products = await this.productComposition.getManageProductUseCase().execute('searchProducts', {
        query: search,
        limit: parseInt(limit),
        offset
      });
    } else if (category) {
      products = await this.productComposition.getManageProductUseCase().execute('findByCategory', {
        categoryId: category,
        limit: parseInt(limit),
        offset
      });
    } else {
      const filters = {};
      if (featured !== undefined) filters.featured = featured;
      if (inStock !== undefined) filters.inStock = inStock;
      
      products = await this.productComposition.getManageProductUseCase().execute('getAllProducts', {
        page: parseInt(page),
        limit: parseInt(limit),
        ...filters
      });
    }

    this.sendSuccess(res, products, 'Products retrieved successfully');
  });

  getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const product = await this.productComposition.getManageProductUseCase().execute('getProductById', { id });
    
    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, product, 'Product retrieved successfully');
  });

  createProduct = asyncHandler(async (req, res) => {
    const productData = req.body;
    
    const product = await this.productComposition.getCreateProductUseCase().execute('createProduct', productData);
    
    this.sendSuccess(res, product, 'Product created successfully', 201);
  });

  updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const product = await this.productComposition.getManageProductUseCase().execute('updateProduct', {
      id,
      ...updateData
    });
    
    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, product, 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const success = await this.productComposition.getManageProductUseCase().execute('deleteProduct', { id });
    
    if (!success) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, null, 'Product deleted successfully');
  });

  updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    
    const product = await this.productComposition.getUpdateProductStockUseCase().execute('updateStock', {
      productId: id,
      stock
    });
    
    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }
    
    this.sendSuccess(res, product, 'Stock updated successfully');
  });

  searchProducts = asyncHandler(async (req, res) => {
    const { q: query, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    if (!query) {
      return this.sendError(res, 'Search query is required', 400);
    }
    
    const products = await this.productComposition.getManageProductUseCase().execute('searchProducts', {
      query,
      limit: parseInt(limit),
      offset
    });
    
    this.sendSuccess(res, products, 'Search results retrieved successfully');
  });

  getLowStockProducts = asyncHandler(async (req, res) => {
    const products = await this.productComposition.getManageProductUseCase().execute('getLowStockProducts');
    
    this.sendSuccess(res, products, 'Low stock products retrieved successfully');
  });
}
