import { Product } from '../../entities/Product.js';

/**
 * Create Product Use Case - Business Logic
 * Handles product creation with validation and business rules
 */
export class CreateProductUseCase {
  /**
   * @param {{ productRepo: { findBySku(sku):Promise<Product>, create(data):Promise<Product> }, categoryRepo: { findById(id):Promise<Category> } }} deps
   */
  constructor({ productRepo, categoryRepo }) {
    this.productRepository = productRepo;
    this.categoryRepository = categoryRepo;
  }

  async execute(productData, userRole, userId) {
    try {
      // Authorization check
      if (!this.canCreateProduct(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to create product',
          product: null
        };
      }

      // Input validation
      const validation = this.validateProductData(productData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          product: null
        };
      }

      // Check if product with same SKU exists
      const existingProduct = await this.productRepository.findBySku(productData.sku);
      if (existingProduct) {
        return {
          success: false,
          message: 'Product with this SKU already exists',
          product: null
        };
      }

      // Validate category if provided
      if (productData.categoryId) {
        const category = await this.categoryRepository.findById(productData.categoryId);
        if (!category) {
          return {
            success: false,
            message: 'Category not found',
            product: null
          };
        }
      }

      // Create product entity
      const productEntity = new Product({
        ...productData,
        addedBy: userId,
        isVisible: true
      });

      // Validate product entity
      if (!productEntity.isValid()) {
        return {
          success: false,
          message: 'Invalid product data',
          product: null
        };
      }

      // Save product
      const createdProduct = await this.productRepository.create(productEntity.toJSON());

      return {
        success: true,
        message: 'Product created successfully',
        product: Product.fromJSON(createdProduct)
      };

    } catch (error) {
      console.error('Product creation error:', error);
      return {
        success: false,
        message: 'Product creation failed',
        product: null,
        error: error.message
      };
    }
  }

  canCreateProduct(userRole) {
    return ['admin', 'store_manager'].includes(userRole);
  }

  validateProductData(productData) {
    if (!productData) {
      return { isValid: false, message: 'Product data is required' };
    }

    if (!productData.name || productData.name.trim().length === 0) {
      return { isValid: false, message: 'Product name is required' };
    }

    if (!productData.sku || productData.sku.trim().length === 0) {
      return { isValid: false, message: 'Product SKU is required' };
    }

    if (!productData.price || productData.price <= 0) {
      return { isValid: false, message: 'Product price must be greater than 0' };
    }

    if (productData.stock === undefined || productData.stock === null) {
      return { isValid: false, message: 'Product stock is required' };
    }

    if (productData.stock < 0) {
      return { isValid: false, message: 'Product stock cannot be negative' };
    }

    return { isValid: true };
  }
}
