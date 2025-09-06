import { ProductRepository } from '../repositories/ProductRepository.js';
import { Product } from '../entities/Product.js';
import appConfig from '../config/appConfig.js';

/**
 * Manage Product Use Case - Clean Architecture
 * Business logic for product management
 */
export class ManageProductUseCase {
  constructor() {
    this.productRepository = new ProductRepository(appConfig.getDatabaseType());
  }

  async createProduct(productData, userId) {
    try {
      // Input validation
      const validation = this.validateProductData(productData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          product: null
        };
      }

      // Check if SKU already exists
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
        isVisible: true
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

  async updateProduct(productId, updateData, userId) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      // Validate update data
      const validation = this.validateUpdateData(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          product: null
        };
      }

      // Update product
      const updatedProduct = await this.productRepository.update(productId, updateData);

      return {
        success: true,
        message: 'Product updated successfully',
        product: Product.fromJSON(updatedProduct)
      };

    } catch (error) {
      console.error('Product update error:', error);
      return {
        success: false,
        message: 'Product update failed',
        product: null,
        error: error.message
      };
    }
  }

  async deleteProduct(productId, userId) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      // Soft delete (mark as not visible)
      await this.productRepository.update(productId, { isVisible: false });

      return {
        success: true,
        message: 'Product deleted successfully',
        product: null
      };

    } catch (error) {
      console.error('Product deletion error:', error);
      return {
        success: false,
        message: 'Product deletion failed',
        product: null,
        error: error.message
      };
    }
  }

  async getProducts(filters = {}, limit = 50, offset = 0) {
    try {
      const products = await this.productRepository.findAll(filters, limit, offset);
      
      return {
        success: true,
        message: 'Products retrieved successfully',
        products: products.map(product => Product.fromJSON(product)),
        total: products.length
      };

    } catch (error) {
      console.error('Get products error:', error);
      return {
        success: false,
        message: 'Failed to retrieve products',
        products: [],
        total: 0,
        error: error.message
      };
    }
  }

  validateProductData(productData) {
    if (!productData || !productData.name || !productData.price || !productData.sku) {
      return {
        isValid: false,
        message: 'Name, price, and SKU are required'
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

  validateUpdateData(updateData) {
    if (updateData.price && updateData.price <= 0) {
      return {
        isValid: false,
        message: 'Price must be greater than 0'
      };
    }

    if (updateData.stock && updateData.stock < 0) {
      return {
        isValid: false,
        message: 'Stock cannot be negative'
      };
    }

    return { isValid: true };
  }
}
