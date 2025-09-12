import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (!existingItem) {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.images?.[0] || product.image || '',
          stock: product.stock,
          category: product.category,
          addedAt: new Date().toISOString()
        });
        state.totalItems = state.items.length;
      }
    },
    
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      state.totalItems = state.items.length;
    },
    
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
    },
    
    toggleWishlistItem: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        state.items = state.items.filter(item => item.id !== product.id);
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.images?.[0] || product.image || '',
          stock: product.stock,
          category: product.category,
          addedAt: new Date().toISOString()
        });
      }
      state.totalItems = state.items.length;
    }
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, toggleWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer; 