import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '../../services/addressService.js';

// Async thunks
export const fetchUserAddresses = createAsyncThunk(
  'addresses/fetchUserAddresses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await addressService.getUserAddresses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const saveAddress = createAsyncThunk(
  'addresses/saveAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await addressService.saveAddress(addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await addressService.updateAddress(id, addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (id, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'addresses/setDefaultAddress',
  async (id, { rejectWithValue }) => {
    try {
      await addressService.setDefaultAddress(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
    }
  }
);

const initialState = {
  addresses: [],
  selectedAddressId: null,
  loading: false,
  error: null,
};

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    selectAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    },
    clearSelectedAddress: (state) => {
      state.selectedAddressId = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        // Fix: Extract the data array from the response
        state.addresses = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save address
      .addCase(saveAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
        state.error = null;
      })
      .addCase(saveAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update address
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      // Delete address
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = null;
        }
      })
      // Set default address
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        // Remove default from all addresses
        state.addresses.forEach(addr => addr.isDefault = false);
        // Set new default
        const address = state.addresses.find(addr => addr.id === action.payload);
        if (address) {
          address.isDefault = true;
        }
      });
  },
});

export const { selectAddress, clearSelectedAddress, clearError } = addressSlice.actions;
export default addressSlice.reducer; 