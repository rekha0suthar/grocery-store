import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.productId === product.id);
      
      // Check if product has stock information
      if (product.stock !== undefined && product.stock <= 0) {
        // Product is out of stock
        return;
      }
      
      if (existingItem) {
        // Check if adding this quantity would exceed stock
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock !== undefined && newQuantity > product.stock) {
          // Limit to available stock
          existingItem.quantity = product.stock;
        } else {
          existingItem.quantity = newQuantity;
        }
      } else {
        // Check if requested quantity exceeds stock
        const requestedQuantity = product.stock !== undefined 
          ? Math.min(quantity, product.stock) 
          : quantity;
          
        if (requestedQuantity > 0) {
          const cartItem = {
          productId: product.id,
          productName: product.name,
            productPrice: product.price,
            quantity: requestedQuantity,
            imageUrl: product.images?.[0] || product.image || '',
            stock: product.stock, // Store stock info for reference
          };
        state.items.push(cartItem);
        }
      }
      
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
    },
    
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.productId !== productId);
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.productId !== productId);
        } else {
          // Check if new quantity exceeds stock
          const maxQuantity = item.stock !== undefined ? item.stock : quantity;
          item.quantity = Math.min(quantity, maxQuantity);
        }
        
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
    
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    openCart: (state) => {
      state.isOpen = true;
    },
    
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;
