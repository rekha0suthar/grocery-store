import { ProductRepository } from '../../repositories/ProductRepository.js';
import { Product } from '../../entities/Product.js';
import appConfig from '../../config/appConfig.js';

/**
 * Update Product Stock Use Case - Business Logic
 * Handles stock updates with business rules
 */
export class UpdateProductStockUseCase {
  constructor() {
    this.productRepository = new ProductRepository(appConfig.getDatabaseType());
  }

  async execute(productId, stockChange, operation, userRole) {
    try {
      // Authorization check
      if (!this.canUpdateStock(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to update stock',
          product: null
        };
      }

      // Get current product
      const currentProduct = await this.productRepository.findById(productId);
      if (!currentProduct) {
        return {
          success: false,
          message: 'Product not found',
          product: null
        };
      }

      const product = Product.fromJSON(currentProduct);

      // Calculate new stock
      let newStock;
      switch (operation) {
        case 'add':
          newStock = product.stock + stockChange;
          break;
        case 'subtract':
          newStock = product.stock - stockChange;
          break;
        case 'set':
          newStock = stockChange;
          break;
        default:
          return {
            success: false,
            message: 'Invalid operation. Use add, subtract, or set',
            product: null
          };
      }

      // Validate new stock
      if (newStock < 0) {
        return {
          success: false,
          message: 'Stock cannot be negative',
          product: null
        };
      }

      // Update stock
      const updatedProduct = await this.productRepository.update(productId, { stock: newStock });

      // Check for low stock alert
      const alert = this.checkLowStockAlert(Product.fromJSON(updatedProduct));

      return {
        success: true,
        message: 'Stock updated successfully',
        product: Product.fromJSON(updatedProduct),
        alert
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

  checkLowStockAlert(product) {
    if (product.stock <= product.minStock) {
      return {
        type: 'low_stock',
        message: `Product "${product.name}" is running low on stock (${product.stock} remaining)`,
        severity: product.stock === 0 ? 'critical' : 'warning'
      };
    }
    return null;
  }
}
