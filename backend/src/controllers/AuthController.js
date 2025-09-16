import { BaseController } from './BaseController.js';
import { AuthenticationComposition } from '../composition/AuthenticationComposition.js';
import { JWTAuthProvider } from '../plugins/auth/JWTAuthProvider.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class AuthController extends BaseController {
  constructor() {
    super();
    this.authComposition = new AuthenticationComposition();
    this.jwtProvider = new JWTAuthProvider();
  }

  // System initialization endpoint
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

  checkInitialization = asyncHandler(async (req, res) => {
    const status = await this.authComposition.getInitializeSystemUseCase().checkInitializationStatus();
    this.sendSuccess(res, status, 'System status retrieved successfully');
  });

  // Register endpoint with role-based logic
  register = asyncHandler(async (req, res) => {
    const userData = req.body;
    const { role = 'customer' } = userData;
    
    let result;
    
    if (role === 'store_manager') {
      // Use store manager registration with approval workflow
      result = await this.authComposition.getRegisterStoreManagerUseCase().execute(userData);
      
      if (!result.success) {
        return this.sendError(res, result.message, 400);
      }

      // For store managers, return success without token (they need approval first)
      this.sendSuccess(res, {
        user: result.user,
        profile: result.profile,
        request: result.request
      }, result.message, 201);
      
    } else if (role === 'admin') {
      // Get existing users first
      const existingUsers = await this.authComposition.userRepository.findAll();
      
      // Check if admin already exists
      const adminPolicy = this.authComposition.getAdminManagementPolicy();
      const canCreate = adminPolicy.canCreateAdmin(existingUsers);
      
      if (!canCreate.canCreate) {
        return this.sendError(res, canCreate.reason, 400);
      }

      // Use regular user creation for admin
      const user = await this.authComposition.getCreateUserUseCase().execute(userData);
      
      // Generate token for admin
      const tokenData = await this.jwtProvider.generateToken(user);
      
      this.sendSuccess(res, {
        user,
        ...tokenData
      }, 'Admin registered successfully', 201);
      
    } else {
      // Regular customer registration
      const user = await this.authComposition.getCreateUserUseCase().execute(userData);
      
      // Generate token for customer
      const tokenData = await this.jwtProvider.generateToken(user);
      
      this.sendSuccess(res, {
        user,
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

  // Admin-only endpoints for managing store manager requests
  getPendingStoreManagerRequests = asyncHandler(async (req, res) => {
    const adminUser = req.user;
    
    const result = await this.authComposition.getManageStoreManagerRequestsUseCase().getPendingRequests(adminUser);
    
    if (!result.success) {
      return this.sendError(res, result.message, 403);
    }
    
    this.sendSuccess(res, result.requests, 'Pending store manager requests retrieved successfully');
  });

  approveStoreManagerRequest = asyncHandler(async (req, res) => {
    const adminUser = req.user;
    const { requestId } = req.params;
    const { action, reason } = req.body;
    
    const result = await this.authComposition.getManageStoreManagerRequestsUseCase().approveRequest(
      adminUser, 
      requestId, 
      action, 
      reason
    );
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.request, result.message);
  });
}
