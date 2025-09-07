import { Cart } from '../../entities/Cart.js';
import { Product } from '../../entities/Product.js';

export class ManageCartUseCase {
  /**
   * @param {{ cartRepo: { findByUserId(userId):Promise<Cart>, create(data):Promise<Cart>, update(id, data):Promise<Cart>, delete(id):Promise<boolean> }, productRepo: { findById(id):Promise<Product> } }} deps
   */
  constructor({ cartRepo, productRepo }) {
    this.cartRepository = cartRepo;
    this.productRepository = productRepo;
  }

  async getCart(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required',
          cart: null
        };
      }

      const cartData = await this.cartRepository.findByUserId(userId);

      if (!cartData) {
        // Create empty cart for user
        const newCart = new Cart({ userId, items: [] });
        const createdCart = await this.cartRepository.create(newCart.toJSON());
        return {
          success: true,
          message: 'Cart retrieved successfully',
          cart: Cart.fromJSON(createdCart)
        };
      }

      return {
        success: true,
        message: 'Cart retrieved successfully',
        cart: Cart.fromJSON(cartData)
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

  async updateCartItem(userId, productId, quantity) {
    try {
      if (!userId || !productId) {
        return {
          success: false,
          message: 'User ID and product ID are required',
          cart: null
        };
      }

      const cartData = await this.cartRepository.findByUserId(userId);
      if (!cartData) {
        return {
          success: false,
          message: 'Cart not found',
          cart: null
        };
      }

      const cart = Cart.fromJSON(cartData);

      if (quantity <= 0) {
        // Remove item from cart
        cart.removeItem(productId);
      } else {
        // Update item quantity
        const productData = await this.productRepository.findById(productId);
        if (!productData) {
          return {
            success: false,
            message: 'Product not found',
            cart: null
          };
        }

        const product = Product.fromJSON(productData);
        if (product.stock < quantity) {
          return {
            success: false,
            message: `Only ${product.stock} items available in stock`,
            cart: null
          };
        }

        cart.updateItemQuantity(productId, quantity);
      }

      cart.calculateTotals();
      const updatedCart = await this.cartRepository.update(cart.id, cart.toJSON());

      return {
        success: true,
        message: 'Cart updated successfully',
        cart: Cart.fromJSON(updatedCart)
      };

    } catch (error) {
      console.error('Update cart error:', error);
      return {
        success: false,
        message: 'Failed to update cart',
        cart: null,
        error: error.message
      };
    }
  }

  async clearCart(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required',
          cart: null
        };
      }

      const cartData = await this.cartRepository.findByUserId(userId);
      if (!cartData) {
        return {
          success: false,
          message: 'Cart not found',
          cart: null
        };
      }

      const cart = Cart.fromJSON(cartData);
      cart.clearItems();

      const updatedCart = await this.cartRepository.update(cart.id, cart.toJSON());

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

  async removeCartItem(userId, productId) {
    try {
      if (!userId || !productId) {
        return {
          success: false,
          message: 'User ID and product ID are required',
          cart: null
        };
      }

      const cartData = await this.cartRepository.findByUserId(userId);
      if (!cartData) {
        return {
          success: false,
          message: 'Cart not found',
          cart: null
        };
      }

      const cart = Cart.fromJSON(cartData);
      const itemExists = cart.items.some(item => item.productId === productId);
      
      if (!itemExists) {
        return {
          success: false,
          message: 'Item not found in cart',
          cart: null
        };
      }

      cart.removeItem(productId);
      cart.calculateTotals();
      const updatedCart = await this.cartRepository.update(cart.id, cart.toJSON());

      return {
        success: true,
        message: 'Item removed from cart successfully',
        cart: Cart.fromJSON(updatedCart)
      };

    } catch (error) {
      console.error('Remove cart item error:', error);
      return {
        success: false,
        message: 'Failed to remove cart item',
        cart: null,
        error: error.message
      };
    }
  }
}
