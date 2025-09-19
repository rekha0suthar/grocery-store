import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requestService } from '../../services/requestService.js';

export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await requestService.getRequests(params);
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
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create request');
    }
  }
);

export const createCategoryRequest = createAsyncThunk(
  'requests/createCategoryRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await requestService.createCategoryRequest(requestData);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category request');
    }
  }
);

export const approveRequest = createAsyncThunk(
  'requests/approveRequest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await requestService.approveRequest(id);
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
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject request');
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'requests/fetchMyRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await requestService.getMyRequests(params);
      const requests = response.data?.data?.requests || response.data?.requests || [];
      const pagination = response.data?.pagination || {};
      return { requests, pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my requests');
    }
  }
);

const initialState = {
  requests: [],
  myRequests: [],
  currentRequest: null,
  loading: false,
  createLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createStoreManagerRequest.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createStoreManagerRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        state.requests.unshift(action.payload);
      })
      .addCase(createStoreManagerRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createCategoryRequest.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createCategoryRequest.fulfilled, (state, action) => {
        state.createLoading = false;
        state.requests.unshift(action.payload);
      })
      .addCase(createCategoryRequest.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(approveRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.requests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(rejectRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.requests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchMyRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload.requests;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentRequest } = requestSlice.actions;
export default requestSlice.reducer;
