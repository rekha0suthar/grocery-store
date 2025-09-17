import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService.js';

export const checkInitializationStatus = createAsyncThunk(
  'auth/checkInitializationStatus',
  async (_, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.checkInitializationStatus();
      const responseData = response.data?.data || response.data;
      return responseData;
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'Failed to check initialization status');
    }
  }
);

export const initializeSystem = createAsyncThunk(
  'auth/initializeSystem',
  async (adminData, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.initializeSystem(adminData);
      const responseData = response.data?.data || response.data;
      
      if (responseData.success === false) {
        return _rejectWithValue(responseData.message || 'System initialization failed');
      }
      
      return responseData;
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'System initialization failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      const responseData = response.data?.data || response.data;
      
      if (responseData.success === false) {
        return _rejectWithValue(responseData.message || 'Login failed');
      }
      
      return responseData;
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      
      const responseData = response.data?.data || response.data;
      
      if (responseData.success === false) {
        return _rejectWithValue(responseData.message || 'Registration failed');
      }
      
      if (userData.role === 'store_manager') {
        return { 
          success: true, 
          message: responseData.message || 'Store manager registration submitted for approval',
          user: responseData.user,
          profile: responseData.profile,
          request: responseData.request,
          requiresApproval: true
        };
      } else {
        return { 
          success: true, 
          message: responseData.message || 'Registration successful',
          user: responseData.user,
          token: responseData.token,
          refreshToken: responseData.refreshToken,
          requiresApproval: false
        };
      }
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue: _rejectWithValue }) => {
    try {
      await authService.logout();
      return { success: true };
    } catch (error) {
      return { success: true };
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      const responseData = response.data?.data || response.data;
      
      if (responseData.success === false) {
        return _rejectWithValue(responseData.message || 'Profile update failed');
      }
      
      return responseData.data || responseData;
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const getPendingStoreManagerRequests = createAsyncThunk(
  'auth/getPendingStoreManagerRequests',
  async (_, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.getPendingStoreManagerRequests();
      const responseData = response.data?.data || response.data;
      return responseData;
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'Failed to fetch pending requests');
    }
  }
);

export const approveStoreManagerRequest = createAsyncThunk(
  'auth/approveStoreManagerRequest',
  async ({ requestId, action, reason }, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.approveStoreManagerRequest(requestId, action, reason);
      const responseData = response.data?.data || response.data;
      return responseData;
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'Failed to process request');
    }
  }
);

const initialState = {
  user: null,
  token: typeof localStorage !== 'undefined' ? (localStorage.getItem('token') || null) : null,
  refreshToken: typeof localStorage !== 'undefined' ? (localStorage.getItem('refreshToken') || null) : null,
  isAuthenticated: false,
  loading: false,
  error: null,
  
  systemInitialized: null,
  initializationLoading: false,
  
  pendingRequests: [],
  requestsLoading: false,
  requestsError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkInitializationStatus.pending, (state) => {
        state.initializationLoading = true;
      })
      .addCase(checkInitializationStatus.fulfilled, (state, action) => {
        state.initializationLoading = false;
        state.systemInitialized = action.payload.initialized;
      })
      .addCase(checkInitializationStatus.rejected, (state, action) => {
        state.initializationLoading = false;
        state.error = action.payload;
      })
      
      .addCase(initializeSystem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeSystem.fulfilled, (state, action) => {
        state.loading = false;
        state.systemInitialized = true;
        
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          
          localStorage.setItem('token', action.payload.token);
          if (action.payload.refreshToken) {
            localStorage.setItem('refreshToken', action.payload.refreshToken);
          }
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(initializeSystem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        
        if (!action.payload.requiresApproval && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          
          localStorage.setItem('token', action.payload.token);
          if (action.payload.refreshToken) {
            localStorage.setItem('refreshToken', action.payload.refreshToken);
          }
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      
      .addCase(getPendingStoreManagerRequests.pending, (state) => {
        state.requestsLoading = true;
        state.requestsError = null;
      })
      .addCase(getPendingStoreManagerRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(getPendingStoreManagerRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.requestsError = action.payload;
      })
      
      .addCase(approveStoreManagerRequest.pending, (state) => {
        state.requestsLoading = true;
        state.requestsError = null;
      })
      .addCase(approveStoreManagerRequest.fulfilled, (state, action) => {
        state.requestsLoading = false;
        const updatedRequest = action.payload;
        state.pendingRequests = state.pendingRequests.map(request =>
          request.id === updatedRequest.id ? updatedRequest : request
        );
      })
      .addCase(approveStoreManagerRequest.rejected, (state, action) => {
        state.requestsLoading = false;
        state.requestsError = action.payload;
      });
  },
});

export const { clearAuth, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
