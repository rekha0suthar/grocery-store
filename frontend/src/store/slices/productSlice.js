import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService.js';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params);
      const products = response.data?.data?.products || response.data?.products || [];
      const pagination = response.data?.data?.pagination || response.data?.pagination || {};
      return { products, pagination, isInitialLoad: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const loadMoreProducts = createAsyncThunk(
  'products/loadMoreProducts',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPage = state.products.pagination?.page || 1;
      const nextPage = currentPage + 1;
      
      const response = await productService.getProducts({
        ...params,
        page: nextPage
      });
      
      const products = response.data?.data?.products || response.data?.products || [];
      const pagination = response.data?.data?.pagination || response.data?.pagination || {};
      
      return { products, pagination, isInitialLoad: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load more products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      const product = response.data?.data?.product || response.data?.product || response.data;
      return product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(searchParams);
      const products = response.data?.data?.products || response.data?.products || [];
      const pagination = response.data?.data?.pagination || response.data?.pagination || {};
      return { products, pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(productData);
      const product = response.data?.data?.product || response.data?.product || response.data;
      return product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, productData);
      const product = response.data?.data?.product || response.data?.product || response.data;
      return product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    searchResults: [],
    loading: false,
    loadingMore: false,
    searchLoading: false,
    isSearchActive: false,
    error: null,
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      pages: 0,
      hasMore: false
    }
  },
  reducers: {
    clearProducts: (state) => {
      state.products = [];
      state.searchResults = [];
      state.isSearchActive = false;
      state.pagination = {
        page: 1,
        limit: 5,
        total: 0,
        pages: 0,
        hasMore: false
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.isSearchActive = false;
      state.searchLoading = false;
    },
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 5,
        total: 0,
        pages: 0,
        hasMore: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = {
          ...action.payload.pagination,
          hasMore: action.payload.pagination.page < action.payload.pagination.pages
        };
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadMoreProducts.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreProducts.fulfilled, (state, action) => {
        state.loadingMore = false;
        
        // Filter out any duplicate products by ID
        const existingIds = new Set(state.products.map(p => p.id));
        const newProducts = action.payload.products.filter(p => !existingIds.has(p.id));
        
        state.products = [...state.products, ...newProducts];
        state.pagination = {
          ...action.payload.pagination,
          hasMore: action.payload.pagination.page < action.payload.pagination.pages
        };
        state.error = null;
      })
      .addCase(loadMoreProducts.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
        state.isSearchActive = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.id !== action.payload);
      });
  }
});

export const { clearProducts, clearCurrentProduct, clearError, clearSearch, resetPagination } = productSlice.actions;
export default productSlice.reducer;
