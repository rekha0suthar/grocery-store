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
        profile: result.profile,
        request: result.request
      }, result.message, 201);
      
    } else if (role === 'admin') {
      const existingUsers = await this.authComposition.userRepository.findAll();
      
      const adminPolicy = this.authComposition.getAdminManagementPolicy();
      const canCreate = adminPolicy.canCreateAdmin(existingUsers);
      
      if (!canCreate.canCreate) {
        return this.sendError(res, canCreate.reason, 400);
      }

      const user = await this.authComposition.getCreateUserUseCase().execute(userData);
      
      if (!user.success) {
        return this.sendError(res, user.message, 400);
      }
      
      const tokenData = await this.jwtProvider.generateToken(user.user);
      
      this.sendSuccess(res, {
        user: user.user,
        ...tokenData
      }, 'Admin registered successfully', 201);
      
    } else {
      const user = await this.authComposition.getCreateUserUseCase().execute(userData);
      
      if (!user.success) {
        return this.sendError(res, user.message, 400);
      }
      
      const tokenData = await this.jwtProvider.generateToken(user.user);
      
      this.sendSuccess(res, {
        user: user.user,
        ...tokenData
      }, 'User registered successfully', 201);
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
    console.log('updateData', updateData);
    console.log('userId', userId);
    const result = await this.authComposition.getUpdateUserUseCase().execute(userId, updateData);
    console.log('result', result);
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.user, result.message);
  });

  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { newPassword } = req.body;
    
    const user = await this.authComposition.getCreateUserUseCase().execute('updateUser', {
      id: userId,
      password: newPassword
    });
    
    this.sendSuccess(res, user, 'Password changed successfully');
  });

  getPendingStoreManagerRequests = asyncHandler(async (req, res) => {
    const adminUserId = req.user.id;
    const result = await this.authComposition.getManageStoreManagerRequestsUseCase().execute('getPendingRequests', adminUserId);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, { requests: result.requests }, result.message);
  });

  approveStoreManagerRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action, reason } = req.body;
    const adminUserId = req.user.id;
    
    const result = await this.authComposition.getManageStoreManagerRequestsUseCase().execute('approveRequest', {
      requestId,
      adminUserId,
      action,
      reason
    });
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result, result.message);
  });
}
