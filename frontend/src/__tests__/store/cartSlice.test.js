import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice.js';

describe('Cart Slice', () => {
  const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isOpen: false,
  };

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 10.99,
    stock: 100,
    image: 'test-image.jpg',
    category: 'Test Category',
    description: 'A test product',
    discount: 0,
    isFeatured: true,
  };

  it('should return the initial state', () => {
    expect(cartReducer(undefined, {})).toEqual(initialState);
  });

  describe('addToCart', () => {
    it('should add a new item to cart', () => {
      const action = addToCart({ product: mockProduct, quantity: 1 });
      const state = cartReducer(initialState, action);
      
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({
        productId: mockProduct.id,
        productName: mockProduct.name,
        productPrice: mockProduct.price,
        quantity: 1,
        imageUrl: mockProduct.image,
        stock: mockProduct.stock,
      });
      expect(state.totalItems).toBe(1);
      expect(state.totalPrice).toBe(mockProduct.price);
    });

    it('should update quantity when adding existing item', () => {
      const firstAction = addToCart({ product: mockProduct, quantity: 1 });
      const firstState = cartReducer(initialState, firstAction);
      
      const secondAction = addToCart({ product: mockProduct, quantity: 2 });
      const state = cartReducer(firstState, secondAction);
      
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3);
      expect(state.totalItems).toBe(3);
      expect(state.totalPrice).toBe(mockProduct.price * 3);
    });

    it('should add multiple different items', () => {
      const secondProduct = { ...mockProduct, id: '2', name: 'Second Product', price: 15.99 };
      
      const firstAction = addToCart({ product: mockProduct, quantity: 1 });
      const firstState = cartReducer(initialState, firstAction);
      
      const secondAction = addToCart({ product: secondProduct, quantity: 2 });
      const state = cartReducer(firstState, secondAction);
      
      expect(state.items).toHaveLength(2);
      expect(state.totalItems).toBe(3);
      expect(state.totalPrice).toBe(mockProduct.price + (secondProduct.price * 2));
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      const addAction = addToCart({ product: mockProduct, quantity: 2 });
      const previousState = cartReducer(initialState, addAction);
      
      const removeAction = removeFromCart(mockProduct.id);
      const state = cartReducer(previousState, removeAction);
      
      expect(state.items).toHaveLength(0);
      expect(state.totalItems).toBe(0);
      expect(state.totalPrice).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const addAction = addToCart({ product: mockProduct, quantity: 2 });
      const previousState = cartReducer(initialState, addAction);
      
      const action = updateQuantity({ productId: mockProduct.id, quantity: 5 });
      const state = cartReducer(previousState, action);
      
      expect(state.items[0].quantity).toBe(5);
      expect(state.totalItems).toBe(5);
      expect(state.totalPrice).toBe(mockProduct.price * 5);
    });

    it('should remove item if quantity is 0', () => {
      const addAction = addToCart({ product: mockProduct, quantity: 2 });
      const previousState = cartReducer(initialState, addAction);
      
      const action = updateQuantity({ productId: mockProduct.id, quantity: 0 });
      const state = cartReducer(previousState, action);
      
      expect(state.items).toHaveLength(0);
      expect(state.totalItems).toBe(0);
      expect(state.totalPrice).toBe(0);
    });

    it('should not affect cart if item does not exist', () => {
      const action = updateQuantity({ productId: 'non-existent-id', quantity: 3 });
      const state = cartReducer(initialState, action);
      
      expect(state).toEqual(initialState);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const addAction = addToCart({ product: mockProduct, quantity: 2 });
      const previousState = cartReducer(initialState, addAction);
      
      const clearAction = clearCart();
      const state = cartReducer(previousState, clearAction);
      
      expect(state.items).toHaveLength(0);
      expect(state.totalItems).toBe(0);
      expect(state.totalPrice).toBe(0);
    });
  });

  describe('cart calculations', () => {
    it('should calculate total correctly with multiple items', () => {
      const secondProduct = { ...mockProduct, id: '2', name: 'Second Product', price: 15.00 };
      
      const firstAction = addToCart({ product: mockProduct, quantity: 2 });
      const firstState = cartReducer(initialState, firstAction);
      
      const secondAction = addToCart({ product: secondProduct, quantity: 1 });
      const state = cartReducer(firstState, secondAction);
      
      expect(state.totalPrice).toBeCloseTo(36.98, 2); // (10.99 * 2) + (15.00 * 1)
      expect(state.totalItems).toBe(3);
    });

    it('should handle decimal prices correctly', () => {
      const decimalProduct = { ...mockProduct, id: '2', name: 'Decimal Product', price: 9.99 };
      
      const firstAction = addToCart({ product: mockProduct, quantity: 1 });
      const firstState = cartReducer(initialState, firstAction);
      
      const secondAction = addToCart({ product: decimalProduct, quantity: 2 });
      const state = cartReducer(firstState, secondAction);
      
      expect(state.totalPrice).toBeCloseTo(30.97, 2);
      expect(state.totalItems).toBe(3);
    });
  });
});
