import { BaseController } from './BaseController.js';
import { AuthenticationComposition } from '../composition/AuthenticationComposition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class AuthController extends BaseController {
  constructor() {
    super();
    this.authComposition = new AuthenticationComposition();
  }

  register = asyncHandler(async (req, res) => {
    const userData = req.body;
    
    const user = await this.authComposition.getCreateUserUseCase().execute('createUser', userData);
    
    this.sendSuccess(res, user, 'User registered successfully', 201);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const result = await this.authComposition.getAuthenticateUserUseCase().execute('authenticateUser', {
      email,
      password
    });
    
    this.sendSuccess(res, result, 'Login successful');
  });

  logout = asyncHandler(async (req, res) => {
    // In a real implementation, you might invalidate the token
    this.sendSuccess(res, null, 'Logout successful');
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = req.user; // Set by auth middleware
    
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
    const { currentPassword, newPassword } = req.body;
    
    // For now, we'll use the updateUser use case to change password
    // In a real implementation, you might want a dedicated changePassword use case
    const user = await this.authComposition.getCreateUserUseCase().execute('updateUser', {
      id: userId,
      password: newPassword
    });
    
    this.sendSuccess(res, user, 'Password changed successfully');
  });
}
