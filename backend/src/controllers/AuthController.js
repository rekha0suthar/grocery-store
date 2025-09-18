import { BaseController } from './BaseController.js';
import { AuthenticationComposition } from '../composition/AuthenticationComposition.js';
import { JWTAuthProvider } from '../plugins/auth/JWTAuthProvider.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class AuthController extends BaseController {
  constructor() {
    super();
    this.authComposition = new AuthenticationComposition();
    this.jwtProvider = new JWTAuthProvider({ secret: process.env.JWT_SECRET });
  }

  checkInitializationStatus = asyncHandler(async (req, res) => {
    const status = await this.authComposition.getInitializeSystemUseCase().execute('checkInitializationStatus');
    this.sendSuccess(res, status, 'System status retrieved successfully');
  });

  initializeSystem = asyncHandler(async (req, res) => {
    const adminData = req.body;
    const result = await this.authComposition.getInitializeSystemUseCase().execute(adminData);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    const tokenData = await this.jwtProvider.generateToken(result.user);
    
    this.sendSuccess(res, {
      user: result.user,
      ...tokenData
    }, result.message, 201);
  });

  register = asyncHandler(async (req, res) => {
    const userData = req.body;
    const { role = 'customer' } = userData;
    
    if (userData.firstName && userData.lastName) {
      userData.name = `${userData.firstName} ${userData.lastName}`;
    }
    
    let result;
    
    if (role === 'store_manager') {
      result = await this.authComposition.getRegisterStoreManagerUseCase().execute(userData);
      
      if (!result.success) {
        return this.sendError(res, result.message, 400);
      }
      
      this.sendSuccess(res, {
        user: result.user,
        requiresApproval: true
      }, result.message, 201);
    } else {
      result = await this.authComposition.getRegisterUserUseCase().execute(userData);
      
      if (!result.success) {
        return this.sendError(res, result.message, 400);
      }
      
      const tokenData = await this.jwtProvider.generateToken(result.user);
      
      this.sendSuccess(res, {
        user: result.user,
        ...tokenData
      }, result.message, 201);
    }
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const authResult = await this.authComposition.getAuthenticateUserWithApprovalUseCase().execute(email, password);
    
    if (!authResult.success) {
      return this.sendError(res, authResult.message, 401);
    }
    
    const tokenData = await this.jwtProvider.generateToken(authResult.user);
    
    this.sendSuccess(res, {
      user: authResult.user,
      ...tokenData
    }, 'Login successful');
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return this.sendError(res, 'Refresh token is required', 400);
    }
    
    try {
      const tokenData = await this.jwtProvider.refreshToken(refreshToken);
      this.sendSuccess(res, tokenData, 'Token refreshed successfully');
    } catch (error) {
      return this.sendError(res, 'Invalid or expired refresh token', 401);
    }
  });

  logout = asyncHandler(async (req, res) => {
    this.sendSuccess(res, null, 'Logout successful');
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    
    this.sendSuccess(res, user, 'Profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    
    const result = await this.authComposition.getUpdateUserUseCase().execute(userId, updateData);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.user, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const result = await this.authComposition.getChangePasswordUseCase().execute(userId, currentPassword, newPassword);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, null, 'Password changed successfully');
  });

  getPendingStoreManagerRequests = asyncHandler(async (req, res) => {
    const result = await this.authComposition.getPendingStoreManagerRequestsUseCase().execute();
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.requests, 'Store manager requests retrieved successfully');
  });

  approveStoreManagerRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action, reason } = req.body;
    
    const result = await this.authComposition.getApproveStoreManagerRequestUseCase().execute(requestId, action, reason);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.request, 'Request processed successfully');
  });
}
