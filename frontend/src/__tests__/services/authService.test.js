import { authService } from '../../services/authService.js';
import api from '../../services/api.js';

// Mock the api module
jest.mock('../../services/api.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkInitializationStatus', () => {
    it('should call the correct API endpoint', async () => {
      const mockResponse = { data: { initialized: true } };
      api.get.mockResolvedValue(mockResponse);

      const result = await authService.checkInitializationStatus();

      expect(api.get).toHaveBeenCalledWith('/auth/initialization-status');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('initializeSystem', () => {
    it('should call the correct API endpoint with admin data', async () => {
      const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      };
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.initializeSystem(adminData);

      expect(api.post).toHaveBeenCalledWith('/auth/initialize', adminData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should call the correct API endpoint with credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = { data: { success: true, token: 'jwt-token' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('should call the correct API endpoint with user data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
      };
      const mockResponse = { data: { success: true, user: userData } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear localStorage and call logout endpoint', async () => {
      const mockResponse = { data: { success: true } };
      api.post.mockResolvedValue(mockResponse);

      // Mock localStorage
      const localStorageMock = {
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const result = await authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
    });

    it('should handle logout API failure gracefully', async () => {
      api.post.mockRejectedValue(new Error('API Error'));

      // Mock localStorage
      const localStorageMock = {
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const result = await authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(result).toEqual({ data: { success: true, message: 'Logged out successfully' } });
    });
  });

  describe('getProfile', () => {
    it('should call the correct API endpoint', async () => {
      const mockResponse = { data: { user: { id: '1', name: 'Test User' } } };
      api.get.mockResolvedValue(mockResponse);

      const result = await authService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should call the correct API endpoint with profile data', async () => {
      const profileData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const mockResponse = { data: { success: true } };
      api.put.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(profileData);

      expect(api.put).toHaveBeenCalledWith('/auth/profile', profileData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should call the correct API endpoint with password data', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const mockResponse = { data: { success: true } };
      api.put.mockResolvedValue(mockResponse);

      const result = await authService.changePassword(passwordData);

      expect(api.put).toHaveBeenCalledWith('/auth/change-password', passwordData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPendingStoreManagerRequests', () => {
    it('should call the correct API endpoint', async () => {
      const mockResponse = { data: { requests: [] } };
      api.get.mockResolvedValue(mockResponse);

      const result = await authService.getPendingStoreManagerRequests();

      expect(api.get).toHaveBeenCalledWith('/auth/store-manager-requests');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('approveStoreManagerRequest', () => {
    it('should call the correct API endpoint with request data', async () => {
      const requestId = '123';
      const action = 'approve';
      const reason = 'Good candidate';
      const mockResponse = { data: { success: true } };
      api.put.mockResolvedValue(mockResponse);

      const result = await authService.approveStoreManagerRequest(requestId, action, reason);

      expect(api.put).toHaveBeenCalledWith(`/auth/store-manager-requests/${requestId}`, {
        action,
        reason,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should call the correct API endpoint', async () => {
      const mockResponse = { data: { token: 'new-jwt-token' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(api.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockResponse);
    });
  });
});
