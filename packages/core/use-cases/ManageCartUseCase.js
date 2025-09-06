import { CartRepository } from '../repositories/CartRepository.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { Cart } from '../entities/Cart.js';
import appConfig from '../config/appConfig.js';

/**
 * Manage Cart Use Case - Clean Architecture
 * Business logic for cart management
 */
export class ManageCartUseCase {
  constructor() {
    this.cartRepository = new CartRepository(appConfig.getDatabaseType());
    this.productRepository = new ProductRepository(appConfig.getDatabaseType());
  }

  async addToCart(userId, productId, quantity = 1) {
    try {
      // Validate quantity
      if (quantity <= 0) {
        return {
          success: false,
          message: 'Quantity must be greater than 0',
          cart: null
        };
      }

      // Check if product exists and is available
      const product = await this.productRepository.findById(productId);
      if (!product) {
        return {
          success: false,
          message: 'Product not found',
          cart: null
        };
      }

      if (!product.isVisible) {
        return {
          success: false,
          message: 'Product is not available',
          cart: null
        };
      }

      if (product.stock < quantity) {
        return {
          success: false,
          message: 'Insufficient stock available',
          cart: null
        };
      }

      // Get or create user's cart
      let cart = await this.cartRepository.findByUserId(userId);
      if (!cart) {
        cart = new Cart({ userId, items: [], totalAmount: 0 });
        cart = await this.cartRepository.create(cart.toJSON());
      } else {
        cart = Cart.fromJSON(cart);
      }

      // Add item to cart
      const result = cart.addItem(productId, quantity, product.price);
      if (!result.success) {
        return {
          success: false,
          message: result.message,
          cart: null
        };
      }

      // Update cart in repository
      const updatedCart = await this.cartRepository.update(cart.id, cart.toJSON());

      return {
        success: true,
        message: 'Item added to cart successfully',
        cart: Cart.fromJSON(updatedCart)
      };

    } catch (error) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        message: 'Failed to add item to cart',
        cart: null,
        error: error.message
      };
    }
  }

  async removeFromCart(userId, productId) {
    try {
      // Get user's cart
      const cart = await this.cartRepository.findByUserId(userId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          cart: null
        };
      }

      const cartEntity = Cart.fromJSON(cart);
      const result = cartEntity.removeItem(productId);
      
      if (!result.success) {
        return {
          success: false,
          message: result.message,
          cart: null
        };
      }

      // Update cart in repository
      const updatedCart = await this.cartRepository.update(cartEntity.id, cartEntity.toJSON());

      return {
        success: true,
        message: 'Item removed from cart successfully',
        cart: Cart.fromJSON(updatedCart)
      };

    } catch (error) {
      console.error('Remove from cart error:', error);
      return {
        success: false,
        message: 'Failed to remove item from cart',
        cart: null,
        error: error.message
      };
    }
  }

  async updateCartItem(userId, productId, quantity) {
    try {
      // Validate quantity
      if (quantity < 0) {
        return {
          success: false,
          message: 'Quantity cannot be negative',
          cart: null
        };
      }

      // Get user's cart
      const cart = await this.cartRepository.findByUserId(userId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          cart: null
        };
      }

      const cartEntity = Cart.fromJSON(cart);

      if (quantity === 0) {
        // Remove item if quantity is 0
        return await this.removeFromCart(userId, productId);
      }

      // Update item quantity
      const result = cartEntity.updateItemQuantity(productId, quantity);
      if (!result.success) {
        return {
          success: false,
          message: result.message,
          cart: null
        };
      }

      // Update cart in repository
      const updatedCart = await this.cartRepository.update(cartEntity.id, cartEntity.toJSON());

      return {
        success: true,
        message: 'Cart item updated successfully',
        cart: Cart.fromJSON(updatedCart)
      };

    } catch (error) {
      console.error('Update cart item error:', error);
      return {
        success: false,
        message: 'Failed to update cart item',
        cart: null,
        error: error.message
      };
    }
  }

  async getCart(userId) {
    try {
      const cart = await this.cartRepository.findByUserId(userId);
      
      if (!cart) {
        return {
          success: true,
          message: 'Cart is empty',
          cart: null
        };
      }

      return {
        success: true,
        message: 'Cart retrieved successfully',
        cart: Cart.fromJSON(cart)
      };

    } catch (error) {
      console.error('Get cart error:', error);
      return {
        success: false,
        message: 'Failed to retrieve cart',
        cart: null,
        error: error.message
      };
    }
  }

  async clearCart(userId) {
    try {
      const cart = await this.cartRepository.findByUserId(userId);
      if (!cart) {
        return {
          success: true,
          message: 'Cart is already empty',
          cart: null
        };
      }

      const cartEntity = Cart.fromJSON(cart);
      cartEntity.clearItems();

      const updatedCart = await this.cartRepository.update(cartEntity.id, cartEntity.toJSON());

      return {
        success: true,
        message: 'Cart cleared successfully',
        cart: Cart.fromJSON(updatedCart)
      };

    } catch (error) {
      console.error('Clear cart error:', error);
      return {
        success: false,
        message: 'Failed to clear cart',
        cart: null,
        error: error.message
      };
    }
  }
}
