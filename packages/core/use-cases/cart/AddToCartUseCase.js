import { Cart } from '../../entities/Cart.js';
import { CartItem } from '../../entities/CartItem.js';
import { Product } from '../../entities/Product.js';


export class AddToCartUseCase {
  /**
   * @param {{ cartRepo: { findByUserId(userId):Promise<Cart>, create(data):Promise<Cart>, update(id, data):Promise<Cart> }, productRepo: { findById(id):Promise<Product> } }} deps
   */
  constructor({ cartRepo, productRepo }) {
    this.cartRepository = cartRepo;
    this.productRepository = productRepo;
  }

  async execute(userId, productId, quantity) {
    try {
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

      const productData = await this.productRepository.findById(productId);
      if (!productData) {
        return {
          success: false,
          message: 'Product not found',
          cart: null
        };
      }

      const product = Product.fromJSON(productData);

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

      let cartData = await this.cartRepository.findByUserId(userId);
      let cart;

      if (!cartData) {
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
