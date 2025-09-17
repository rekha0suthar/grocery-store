import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
  clearAuth,
  clearError,
  setCredentials,
  checkInitializationStatus,
  initializeSystem,
} from '../../store/slices/authSlice.js';
import { mockUser, mockAdmin } from '../utils/test-utils.js';

jest.mock('../../services/authService.js', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    checkInitializationStatus: jest.fn(),
    initializeSystem: jest.fn(),
  },
}));

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    systemInitialized: null,
    initializationLoading: false,
    pendingRequests: [],
    requestsLoading: false,
    requestsError: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle clearAuth', () => {
    const previousState = {
      ...initialState,
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
    };

    const state = authReducer(previousState, clearAuth());
    
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle clearError', () => {
    const previousState = {
      ...initialState,
      error: 'Some error',
    };

    const state = authReducer(previousState, clearError());
    
    expect(state.error).toBeNull();
  });

  it('should handle setCredentials', () => {
    const credentials = {
      user: mockUser,
      token: 'test-token',
      refreshToken: 'refresh-token',
    };

    const state = authReducer(initialState, setCredentials(credentials));
    
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('test-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.isAuthenticated).toBe(true);
  });

  describe('loginUser', () => {
    it('should handle loginUser.pending', () => {
      const action = { type: loginUser.pending.type };
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginUser.fulfilled', () => {
      const loginData = {
        user: mockUser,
        token: 'test-token',
        refreshToken: 'refresh-token',
      };
      
      const action = { 
        type: loginUser.fulfilled.type, 
        payload: loginData 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle loginUser.rejected', () => {
      const error = 'Login failed';
      const action = { 
        type: loginUser.rejected.type, 
        payload: error 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('should handle registerUser.pending', () => {
      const action = { type: registerUser.pending.type };
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle registerUser.fulfilled with immediate login', () => {
      const registerData = {
        user: mockUser,
        token: 'test-token',
        refreshToken: 'refresh-token',
        requiresApproval: false,
      };
      
      const action = { 
        type: registerUser.fulfilled.type, 
        payload: registerData 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle registerUser.fulfilled with approval required', () => {
      const registerData = {
        user: mockUser,
        requiresApproval: true,
      };
      
      const action = { 
        type: registerUser.fulfilled.type, 
        payload: registerData 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle registerUser.rejected', () => {
      const error = 'Registration failed';
      const action = { 
        type: registerUser.rejected.type, 
        payload: error 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('logoutUser', () => {
    it('should handle logoutUser.fulfilled', () => {
      const previousState = {
        ...initialState,
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
      };

      const action = { type: logoutUser.fulfilled.type };
      const state = authReducer(previousState, action);
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should handle updateProfile.fulfilled', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const action = { 
        type: updateProfile.fulfilled.type, 
        payload: updatedUser
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.user).toEqual(updatedUser);
    });
  });

  describe('checkInitializationStatus', () => {
    it('should handle checkInitializationStatus.pending', () => {
      const action = { type: checkInitializationStatus.pending.type };
      const state = authReducer(initialState, action);
      
      expect(state.initializationLoading).toBe(true);
    });

    it('should handle checkInitializationStatus.fulfilled', () => {
      const initData = { initialized: true };
      const action = { 
        type: checkInitializationStatus.fulfilled.type, 
        payload: initData 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.initializationLoading).toBe(false);
      expect(state.systemInitialized).toBe(true);
    });

    it('should handle checkInitializationStatus.rejected', () => {
      const error = 'Initialization check failed';
      const action = { 
        type: checkInitializationStatus.rejected.type, 
        payload: error 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.initializationLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('initializeSystem', () => {
    it('should handle initializeSystem.pending', () => {
      const action = { type: initializeSystem.pending.type };
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle initializeSystem.fulfilled', () => {
      const initData = {
        user: mockAdmin,
        token: 'admin-token',
        refreshToken: 'admin-refresh-token',
      };
      
      const action = { 
        type: initializeSystem.fulfilled.type, 
        payload: initData 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.systemInitialized).toBe(true);
      expect(state.user).toEqual(mockAdmin);
      expect(state.token).toBe('admin-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle initializeSystem.rejected', () => {
      const error = 'System initialization failed';
      const action = { 
        type: initializeSystem.rejected.type, 
        payload: error 
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });
});
