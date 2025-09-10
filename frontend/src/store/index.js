import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import productSlice from './slices/productSlice.js';
import categorySlice from './slices/categorySlice.js';
import cartSlice from './slices/cartSlice.js';
import requestSlice from './slices/requestSlice.js';
import uiSlice from './slices/uiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    categories: categorySlice,
    cart: cartSlice,
    requests: requestSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Export types for TypeScript (if using TypeScript)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
