import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import productSlice from './slices/productSlice.js';
import categorySlice from './slices/categorySlice.js';
import cartSlice from './slices/cartSlice.js';
import requestSlice from './slices/requestSlice.js';
import orderSlice from './slices/orderSlice.js';
import uiSlice from './slices/uiSlice.js';
import wishlistSlice from './slices/wishlistSlice.js';
import addressSlice from './slices/addressSlice.js';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    categories: categorySlice,
    cart: cartSlice,
    requests: requestSlice,
    orders: orderSlice,
    ui: uiSlice,
    wishlist: wishlistSlice,
    addresses: addressSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
