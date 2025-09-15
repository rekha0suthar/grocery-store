import wishlistReducer, { 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist, 
  toggleWishlistItem 
} from '../../../store/slices/wishlistSlice.js';

describe('Wishlist Slice', () => {
  const initialState = {
    items: [],
    totalItems: 0,
  };

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 29.99,
    images: ['image1.jpg', 'image2.jpg'],
    stock: 10,
    category: 'Electronics',
  };

  const mockProductWithoutImages = {
    id: '2',
    name: 'Test Product 2',
    price: 19.99,
    image: 'single-image.jpg',
    stock: 5,
    category: 'Books',
  };

  it('should return the initial state', () => {
    expect(wishlistReducer(undefined, {})).toEqual(initialState);
  });

  describe('addToWishlist', () => {
    it('should add a new product to wishlist', () => {
      const action = addToWishlist(mockProduct);
      const newState = wishlistReducer(initialState, action);
      
      expect(newState.items).toHaveLength(1);
      expect(newState.totalItems).toBe(1);
      expect(newState.items[0]).toMatchObject({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
        imageUrl: mockProduct.images[0],
        stock: mockProduct.stock,
        category: mockProduct.category,
      });
      expect(newState.items[0]).toHaveProperty('addedAt');
    });

    it('should not add duplicate products', () => {
      const stateWithProduct = {
        ...initialState,
        items: [{
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          imageUrl: mockProduct.images[0],
          stock: mockProduct.stock,
          category: mockProduct.category,
          addedAt: '2023-01-01T00:00:00Z'
        }],
        totalItems: 1,
      };
      
      const action = addToWishlist(mockProduct);
      const newState = wishlistReducer(stateWithProduct, action);
      
      expect(newState.items).toHaveLength(1);
      expect(newState.totalItems).toBe(1);
    });

    it('should handle product without images array', () => {
      const action = addToWishlist(mockProductWithoutImages);
      const newState = wishlistReducer(initialState, action);
      
      expect(newState.items[0].imageUrl).toBe(mockProductWithoutImages.image);
    });

    it('should handle product without any images', () => {
      const productWithoutImages = {
        ...mockProduct,
        images: undefined,
        image: undefined,
      };
      
      const action = addToWishlist(productWithoutImages);
      const newState = wishlistReducer(initialState, action);
      
      expect(newState.items[0].imageUrl).toBe('');
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove a product from wishlist', () => {
      const stateWithProducts = {
        ...initialState,
        items: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' },
        ],
        totalItems: 2,
      };
      
      const action = removeFromWishlist('1');
      const newState = wishlistReducer(stateWithProducts, action);
      
      expect(newState.items).toHaveLength(1);
      expect(newState.totalItems).toBe(1);
      expect(newState.items[0].id).toBe('2');
    });

    it('should not affect wishlist if product not found', () => {
      const stateWithProducts = {
        ...initialState,
        items: [{ id: '1', name: 'Product 1' }],
        totalItems: 1,
      };
      
      const action = removeFromWishlist('999');
      const newState = wishlistReducer(stateWithProducts, action);
      
      expect(newState.items).toHaveLength(1);
      expect(newState.totalItems).toBe(1);
    });
  });

  describe('clearWishlist', () => {
    it('should clear all items from wishlist', () => {
      const stateWithProducts = {
        ...initialState,
        items: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' },
        ],
        totalItems: 2,
      };
      
      const action = clearWishlist();
      const newState = wishlistReducer(stateWithProducts, action);
      
      expect(newState.items).toHaveLength(0);
      expect(newState.totalItems).toBe(0);
    });
  });

  describe('toggleWishlistItem', () => {
    it('should add product to wishlist if not present', () => {
      const action = toggleWishlistItem(mockProduct);
      const newState = wishlistReducer(initialState, action);
      
      expect(newState.items).toHaveLength(1);
      expect(newState.totalItems).toBe(1);
      expect(newState.items[0].id).toBe(mockProduct.id);
    });

    it('should remove product from wishlist if already present', () => {
      const stateWithProduct = {
        ...initialState,
        items: [{
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          imageUrl: mockProduct.images[0],
          stock: mockProduct.stock,
          category: mockProduct.category,
          addedAt: '2023-01-01T00:00:00Z'
        }],
        totalItems: 1,
      };
      
      const action = toggleWishlistItem(mockProduct);
      const newState = wishlistReducer(stateWithProduct, action);
      
      expect(newState.items).toHaveLength(0);
      expect(newState.totalItems).toBe(0);
    });

    it('should handle multiple products correctly', () => {
      const stateWithProducts = {
        ...initialState,
        items: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' },
        ],
        totalItems: 2,
      };
      
      // Toggle existing product (should remove)
      const action1 = toggleWishlistItem({ id: '1', name: 'Product 1' });
      const newState1 = wishlistReducer(stateWithProducts, action1);
      expect(newState1.items).toHaveLength(1);
      expect(newState1.totalItems).toBe(1);
      
      // Toggle new product (should add)
      const action2 = toggleWishlistItem({ id: '3', name: 'Product 3' });
      const newState2 = wishlistReducer(newState1, action2);
      expect(newState2.items).toHaveLength(2);
      expect(newState2.totalItems).toBe(2);
    });
  });
});
