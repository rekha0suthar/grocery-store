import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService.js';

// System initialization thunks
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

// Authentication thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // console.log('Login response:', response.data);
      
      const responseData = response.data?.data || response.data;
      
      if (responseData.success === false) {
        return _rejectWithValue(responseData.message || 'Login failed');
      }
      
      return responseData;
    } catch (error) {
      // console.error('Login error:', error);
      return _rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue: _rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      // console.log('Register response:', response.data);
      
      const responseData = response.data?.data || response.data;
      
      if (responseData.success === false) {
        return _rejectWithValue(responseData.message || 'Registration failed');
      }
      
      // Handle different registration types
      if (userData.role === 'store_manager') {
        // Store manager registration creates a pending request
        return { 
          success: true, 
          message: responseData.message || 'Store manager registration submitted for approval',
          user: responseData.user,
          profile: responseData.profile,
          request: responseData.request,
          requiresApproval: true
        };
      } else {
        // Regular registration (customer/admin) with immediate login
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
      // console.error('Registration error:', error);
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
      // Even if logout fails, we should clear local state
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
      
      // Check if the response indicates failure
      if (responseData.success === false) {
        return _rejectWithValue(responseData.message || 'Profile update failed');
      }
      
      return responseData;
    } catch (error) {
      return _rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

// Store manager management thunks (admin-only)
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
  
  // System initialization state
  systemInitialized: null, // null = unknown, true = initialized, false = needs initialization
  initializationLoading: false,
  
  // Store manager requests state (admin-only)
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
      // System initialization
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
        
        // Auto-login the first admin
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
      
      // Login
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
      
      // Registration
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Only auto-login for non-store-manager registrations
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
      
      // Logout
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
      
      // Profile update
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      
      // Store manager requests (admin-only)
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
        // Update the request in the list
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
