import { Cart } from '../../../entities/Cart.js';
import { CartItem } from '../../../entities/CartItem.js';

// Test builders for cleaner tests
const aProduct = (overrides = {}) => ({
  id: 'prod-1',
  name: 'Apple',
  getCurrentPrice: () => 2.50,
  unit: 'kg',
  ...overrides
});

const aCartItem = (overrides = {}) => new CartItem({
  productId: 'prod-1',
  productName: 'Apple',
  productPrice: 2.50,
  quantity: 1,
  unit: 'kg',
  ...overrides
});

const aCart = (overrides = {}) => new Cart({
  userId: 'user-123',
  items: [],
  ...overrides
});

describe('Cart Entity - Core Domain Rules', () => {
  describe('Creation and Validation', () => {
    test('creates cart with valid user ID', () => {
      const cart = aCart();
      
      expect(cart.isValid()).toBe(true);
      expect(cart.userId).toBe('user-123');
      expect(cart.items).toEqual([]);
    });

    test('rejects cart without user ID', () => {
      const cart = aCart({ userId: null });
      expect(cart.isValid()).toBe(false);
    });

    test('validates cart items', () => {
      const cart = aCart();
      const validItem = aCartItem();
      const invalidItem = new CartItem({ productId: '', productName: '', productPrice: -1, quantity: 0 });
      
      cart.items = [validItem];
      expect(cart.isValid()).toBe(true);
      
      cart.items = [invalidItem];
      expect(cart.isValid()).toBe(false);
    });
  });

  describe('Cart Operations - No Recursion', () => {
    test('adds new item to cart', () => {
      const cart = aCart();
      const product = aProduct();
      
      const result = cart.addItem(product, 2);
      expect(result).toBe(true);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
    });

    test('increments existing item quantity', () => {
      const cart = aCart();
      const product = aProduct();
      
      cart.addItem(product, 1);
      cart.addItem(product, 2);
      
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
    });

    test('does not merge lines with different unit prices', () => {
      const cart = aCart();
      const existingItem = aCartItem({ productPrice: 100, quantity: 1 });
      cart.items = [existingItem];
      
      const product = aProduct({ getCurrentPrice: () => 90 });
      cart.addItem(product, 1);
      
      expect(cart.items).toHaveLength(2);
      expect(cart.items[0].productPrice).toBe(100);
      expect(cart.items[1].productPrice).toBe(90);
    });

    test('rejects incomplete product snapshot', () => {
      const cart = aCart();
      const incompleteProduct = { id: 'prod-1' }; // Missing name, getCurrentPrice, unit
      
      const result = cart.addItem(incompleteProduct, 1);
      expect(result).toBe(false);
    });

    test('rejects invalid quantity', () => {
      const cart = aCart();
      const product = aProduct();
      
      expect(cart.addItem(product, 0)).toBe(false);
      expect(cart.addItem(product, -1)).toBe(false);
    });

    test('removes item from cart', () => {
      const cart = aCart();
      const product = aProduct();
      
      cart.addItem(product, 1);
      expect(cart.items).toHaveLength(1);
      
      cart.removeItem('prod-1');
      expect(cart.items).toHaveLength(0);
    });

    test('updates item quantity', () => {
      const cart = aCart();
      const product = aProduct();
      
      cart.addItem(product, 1);
      cart.updateItemQuantity('prod-1', 5);
      
      expect(cart.items[0].quantity).toBe(5);
    });

    test('removes item when quantity set to zero', () => {
      const cart = aCart();
      const product = aProduct();
      
      cart.addItem(product, 1);
      cart.updateItemQuantity('prod-1', 0);
      
      expect(cart.items).toHaveLength(0);
    });

    test('clears all items from cart', () => {
      const cart = aCart();
      const product1 = aProduct({ id: 'prod-1' });
      const product2 = aProduct({ id: 'prod-2' });
      
      cart.addItem(product1, 1);
      cart.addItem(product2, 1);
      expect(cart.items).toHaveLength(2);
      
      cart.clearItems();
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('Total Calculations - Consistent Strategy', () => {
    test('calculates subtotal correctly', () => {
      const cart = aCart();
      const product1 = aProduct({ id: 'prod-1', getCurrentPrice: () => 10 });
      const product2 = aProduct({ id: 'prod-2', getCurrentPrice: () => 20 });
      
      cart.addItem(product1, 2);
      cart.addItem(product2, 1);
      
      expect(cart.getSubtotal()).toBe(40); // 2*10 + 1*20
    });

    test('calculates final amount with discount', () => {
      const cart = aCart();
      const product = aProduct({ getCurrentPrice: () => 100 });
      
      cart.addItem(product, 1);
      cart.applyDiscount(10);
      
      expect(cart.getFinalAmount()).toBe(90);
    });

    test('final amount never goes negative', () => {
      const cart = aCart();
      const product = aProduct({ getCurrentPrice: () => 10 });
      
      cart.addItem(product, 1);
      cart.applyDiscount(20);
      
      expect(cart.getFinalAmount()).toBe(0);
    });

    test('recomputes totals after operations', () => {
      const cart = aCart();
      const product = aProduct({ getCurrentPrice: () => 10 });
      
      cart.addItem(product, 2);
      expect(cart.getTotalAmount()).toBe(20);
      
      cart.addItem(product, 1);
      expect(cart.getTotalAmount()).toBe(30);
    });

    test('handles large discount then new items added', () => {
      const cart = aCart();
      const product1 = aProduct({ id: 'prod-1', getCurrentPrice: () => 10 });
      const product2 = aProduct({ id: 'prod-2', getCurrentPrice: () => 20 });
      
      cart.addItem(product1, 1);
      cart.applyDiscount(15); // Large discount
      cart.addItem(product2, 1);
      
      expect(cart.getFinalAmount()).toBe(15); // 30 - 15
    });
  });

  describe('Discount Management', () => {
    test('applies discount', () => {
      const cart = aCart();
      
      cart.applyDiscount(10);
      expect(cart.getDiscountAmount()).toBe(10);
    });

    test('removes discount', () => {
      const cart = aCart();
      
      cart.applyDiscount(10);
      cart.removeDiscount();
      expect(cart.getDiscountAmount()).toBe(0);
    });
  });

  describe('CartItem Entity - No Recursion', () => {
    test('creates valid cart item', () => {
      const item = aCartItem();
      
      expect(item.isValid()).toBe(true);
      expect(item.productId).toBe('prod-1');
      expect(item.quantity).toBe(1);
    });

    test('rejects invalid cart item', () => {
      const item = new CartItem({
        productId: '',
        productName: '',
        productPrice: -1,
        quantity: 0
      });
      
      expect(item.isValid()).toBe(false);
    });

    test('updates quantity correctly', () => {
      const item = aCartItem();
      
      item.setQuantity(5);
      expect(item.quantity).toBe(5);
    });

    test('prevents negative quantity', () => {
      const item = aCartItem();
      
      expect(item.setQuantity(-1)).toBe(false);
      expect(item.quantity).toBe(1); // Original quantity unchanged
    });
  });

  describe('JSON Serialization - Contract-based', () => {
    test('serializes cart with correct derived values', () => {
      const cart = aCart();
      const product = aProduct({ getCurrentPrice: () => 10 });
      
      cart.addItem(product, 2);
      cart.applyDiscount(5);
      
      const json = cart.toJSON();
      expect(json.totalAmount).toBe(20);
      expect(json.discountAmount).toBe(5);
      expect(json.items).toHaveLength(1);
    });

    test('deserializes cart correctly', () => {
      const cartData = {
        userId: 'user-456',
        items: [{
          productId: 'prod-2',
          productName: 'Banana',
          productPrice: 1.50,
          quantity: 3,
          unit: 'bunch'
        }],
        totalAmount: 4.50,
        discountAmount: 0
      };
      
      const cart = Cart.fromJSON(cartData);
      expect(cart.userId).toBe('user-456');
      expect(cart.items).toHaveLength(1);
      expect(cart.getTotalAmount()).toBe(4.50);
    });
  });
});
