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
    const userData = req.body;
    
    const result = await this.authComposition.getInitializeSystemUseCase().execute(userData);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }

    // Generate token for the first admin
    const tokenData = await this.jwtProvider.generateToken(result.user);
    
    this.sendSuccess(res, {
      user: result.user,
      ...tokenData
    }, result.message, 201);
  });

  // Check if system needs initialization
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
      // Check if admin already exists
      const adminPolicy = this.authComposition.getAdminManagementPolicy();
      const canCreate = await adminPolicy.canCreateAdmin(userData);
      
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
    
    const user = await this.authComposition.getCreateUserUseCase().execute('updateUser', {
      id: userId,
      ...updateData
    });
    
    this.sendSuccess(res, user, 'Profile updated successfully');
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
    const { requestId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'
    const adminUser = req.user;
    
    let result;
    
    if (action === 'approve') {
      result = await this.authComposition.getManageStoreManagerRequestsUseCase().approveRequest(requestId, adminUser);
    } else if (action === 'reject') {
      result = await this.authComposition.getManageStoreManagerRequestsUseCase().rejectRequest(requestId, adminUser, reason);
    } else {
      return this.sendError(res, 'Invalid action. Must be "approve" or "reject"', 400);
    }
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.request, result.message);
  });
}
