import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requestService } from '../../services/requestService.js';

// Async thunks
export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await requestService.getRequests(params);
      // Handle nested response structure: response.data.data.requests
      const requests = response.data?.data?.requests || response.data?.requests || [];
      const pagination = response.data?.pagination || {};
      return { requests, pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

export const fetchRequestById = createAsyncThunk(
  'requests/fetchRequestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await requestService.getRequestById(id);
      // Handle nested response structure
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch request');
    }
  }
);

export const createStoreManagerRequest = createAsyncThunk(
  'requests/createStoreManagerRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await requestService.createStoreManagerRequest(requestData);
      // Handle nested response structure
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create request');
    }
  }
);

export const approveRequest = createAsyncThunk(
  'requests/approveRequest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await requestService.approveRequest(id);
      // Handle nested response structure
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve request');
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'requests/rejectRequest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await requestService.rejectRequest(id);
      // Handle nested response structure
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject request');
    }
  }
);

const initialState = {
  requests: [],
  currentRequest: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Request by ID
      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
        state.error = null;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Store Manager Request
      .addCase(createStoreManagerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStoreManagerRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
        state.error = null;
      })
      .addCase(createStoreManagerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Request
      .addCase(approveRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      })
      // Reject Request
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (state.currentRequest?.id === action.payload.id) {
          state.currentRequest = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentRequest, setPagination } = requestSlice.actions;
export default requestSlice.reducer;
