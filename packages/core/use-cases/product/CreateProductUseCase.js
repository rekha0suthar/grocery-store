import { ProductRepository } from '../../repositories/ProductRepository.js';
import { CategoryRepository } from '../../repositories/CategoryRepository.js';
import { Product } from '../../entities/Product.js';
import appConfig from '../../config/appConfig.js';

/**
 * Create Product Use Case - Business Logic
 * Handles product creation with validation and business rules
 */
export class CreateProductUseCase {
  constructor() {
    this.productRepository = new ProductRepository(appConfig.getDatabaseType());
    this.categoryRepository = new CategoryRepository(appConfig.getDatabaseType());
  }

  async execute(productData, userRole, userId) {
    try {
      // Authorization check
      if (!this.canCreateProduct(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to create products',
          product: null
        };
      }

      // Input validation
      const validation = this.validateInput(productData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          product: null
        };
      }

      // Validate category exists
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

      // Check for duplicate SKU
      const existingProduct = await this.productRepository.findBySku(productData.sku);
      if (existingProduct) {
        return {
          success: false,
          message: 'Product with this SKU already exists',
          product: null
        };
      }

      // Create product entity
      const productEntity = new Product({
        ...productData,
        addedBy: userId,
        isVisible: userRole === 'admin' ? productData.isVisible : false // Store managers need approval
      });

      // Save to repository
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

  validateInput(productData) {
    if (!productData || !productData.name || !productData.price || !productData.sku) {
      return {
        isValid: false,
        message: 'Name, price, and SKU are required'
      };
    }

    if (productData.name.trim().length < 2) {
      return {
        isValid: false,
        message: 'Product name must be at least 2 characters long'
      };
    }

    if (productData.price <= 0) {
      return {
        isValid: false,
        message: 'Price must be greater than 0'
      };
    }

    if (productData.stock < 0) {
      return {
        isValid: false,
        message: 'Stock cannot be negative'
      };
    }

    return { isValid: true };
  }
}
