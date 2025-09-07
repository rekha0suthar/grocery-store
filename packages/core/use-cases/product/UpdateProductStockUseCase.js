import { Product } from '../../entities/Product.js';

/**
 * Update Product Stock Use Case - Business Logic
 * Handles stock updates with business rules
 */
export class UpdateProductStockUseCase {
  /**
   * @param {{ productRepo: { findById(id):Promise<Product>, update(id, data):Promise<Product> } }} deps
   */
  constructor({ productRepo }) {
    this.productRepository = productRepo;
  }

  async execute(productId, stockChange, userRole) {
    try {
      // Authorization check
      if (!this.canUpdateStock(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to update stock',
          product: null
        };
      }

      // Input validation
      if (!productId) {
        return {
          success: false,
          message: 'Product ID is required',
          product: null
        };
      }

      if (typeof stockChange !== 'number') {
        return {
          success: false,
          message: 'Stock change must be a number',
          product: null
        };
      }

      // Get product
      const productData = await this.productRepository.findById(productId);
      if (!productData) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      const product = Product.fromJSON(productData);

      // Calculate new stock
      const newStock = product.stock + stockChange;
      if (newStock < 0) {
        return {
          success: false,
          message: 'Insufficient stock for this operation',
          product: null
        };
      }

      // Update stock
      product.setStock(newStock);

      // Save updated product
      const updatedProduct = await this.productRepository.update(productId, product.toJSON());

      return {
        success: true,
        message: 'Stock updated successfully',
        product: Product.fromJSON(updatedProduct)
      };

    } catch (error) {
      console.error('Stock update error:', error);
      return {
        success: false,
        message: 'Stock update failed',
        product: null,
        error: error.message
      };
    }
  }

  canUpdateStock(userRole) {
    return ['admin', 'store_manager'].includes(userRole);
  }
}
