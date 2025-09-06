import { BaseController } from './BaseController.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class ProductController extends BaseController {
  constructor() {
    super();
    this.productRepository = new ProductRepository();
  }

  getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, category, featured, inStock, search } = req.query;
    const offset = (page - 1) * limit;

    let products;

    if (search) {
      products = await this.productRepository.searchProducts(search, parseInt(limit), offset);
    } else if (category) {
      products = await this.productRepository.findByCategory(category, parseInt(limit), offset);
    } else if (featured === 'true') {
      products = await this.productRepository.findFeatured(parseInt(limit));
    } else if (inStock === 'true') {
      products = await this.productRepository.findInStock(parseInt(limit), offset);
    } else {
      products = await this.productRepository.findAll(parseInt(limit), offset);
    }

    return this.sendSuccess(res, {
      products: products.map(product => product.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length
      }
    }, 'Products retrieved successfully');
  });

  getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await this.productRepository.findById(id);

    if (!product) {
      return this.sendNotFound(res, 'Product not found');
    }

    return this.sendSuccess(res, product.toJSON(), 'Product retrieved successfully');
  });

  createProduct = asyncHandler(async (req, res) => {
    const productData = {
      ...req.body,
      addedBy: req.user.id
    };

    const product = await this.productRepository.create(productData);
    return this.sendSuccess(res, product.toJSON(), 'Product created successfully', 201);
  });

  updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      return this.sendNotFound(res, 'Product not found');
    }

    // Check permissions (only admin or the user who added the product can update)
    if (req.user.role !== 'admin' && existingProduct.addedBy !== req.user.id) {
      return this.sendForbidden(res, 'You can only update products you added');
    }

    const updatedProduct = await this.productRepository.update(id, updateData);
    return this.sendSuccess(res, updatedProduct.toJSON(), 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      return this.sendNotFound(res, 'Product not found');
    }

    // Check permissions (only admin or the user who added the product can delete)
    if (req.user.role !== 'admin' && existingProduct.addedBy !== req.user.id) {
      return this.sendForbidden(res, 'You can only delete products you added');
    }

    await this.productRepository.delete(id);
    return this.sendSuccess(res, null, 'Product deleted successfully');
  });

  updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return this.sendError(res, 'Stock must be a non-negative number', 400);
    }

    const updatedProduct = await this.productRepository.updateStock(id, stock);
    if (!updatedProduct) {
      return this.sendNotFound(res, 'Product not found');
    }

    return this.sendSuccess(res, updatedProduct.toJSON(), 'Stock updated successfully');
  });

  getLowStockProducts = asyncHandler(async (req, res) => {
    const products = await this.productRepository.findLowStock();
    return this.sendSuccess(res, {
      products: products.map(product => product.toJSON())
    }, 'Low stock products retrieved successfully');
  });

  searchProducts = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return this.sendError(res, 'Search query is required', 400);
    }

    const products = await this.productRepository.searchProducts(q, parseInt(limit), offset);
    return this.sendSuccess(res, {
      products: products.map(product => product.toJSON()),
      query: q,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length
      }
    }, 'Search results retrieved successfully');
  });
}
