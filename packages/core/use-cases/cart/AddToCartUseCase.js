import { CartRepository } from '../../repositories/CartRepository.js';
import { ProductRepository } from '../../repositories/ProductRepository.js';
import { Cart } from '../../entities/Cart.js';
import { CartItem } from '../../entities/CartItem.js';
import appConfig from '../../config/appConfig.js';

/**
 * Add to Cart Use Case - Business Logic
 * Handles adding products to cart with validation
 */
export class AddToCartUseCase {
  constructor() {
    this.cartRepository = new CartRepository(appConfig.getDatabaseType());
    this.productRepository = new ProductRepository(appConfig.getDatabaseType());
  }

  async execute(userId, productId, quantity) {
    try {
      // Input validation
      if (!userId || !productId || !quantity) {
        return {
          success: false,
          message: 'User ID, product ID, and quantity are required',
          cart: null
        };
      }

      if (quantity <= 0) {
        return {
          success: false,
          message: 'Quantity must be greater than 0',
          cart: null
        };
      }

      // Get product
      const productData = await this.productRepository.findById(productId);
      if (!productData) {
        return {
          success: false,
          message: 'Product not found',
          cart: null
        };
      }

      const product = Product.fromJSON(productData);

      // Check product availability
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
          message: `Only ${product.stock} items available in stock`,
          cart: null
        };
      }

      // Get or create cart
      let cartData = await this.cartRepository.findByUserId(userId);
      let cart;

      if (!cartData) {
        // Create new cart
        cart = new Cart({ userId, items: [] });
        cartData = await this.cartRepository.create(cart.toJSON());
        cart = Cart.fromJSON(cartData);
      } else {
        cart = Cart.fromJSON(cartData);
      }

      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex >= 0) {
        // Update existing item
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (product.stock < newQuantity) {
          return {
            success: false,
            message: `Only ${product.stock} items available in stock`,
            cart: null
          };
        }

        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        const cartItem = new CartItem({
          productId: product.id,
          productName: product.name,
          productPrice: product.getCurrentPrice(),
          quantity,
          unit: product.unit
        });

        cart.items.push(cartItem);
      }

      // Update cart totals
      cart.calculateTotals();

      // Save cart
      const updatedCart = await this.cartRepository.update(cart.id, cart.toJSON());

      return {
        success: true,
        message: 'Product added to cart successfully',
        cart: Cart.fromJSON(updatedCart)
      };

    } catch (error) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        message: 'Failed to add product to cart',
        cart: null,
        error: error.message
      };
    }
  }
}
