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

  register = asyncHandler(async (req, res) => {
    const userData = req.body;
    
    const user = await this.authComposition.getCreateUserUseCase().execute(userData);
    
    this.sendSuccess(res, user, 'User registered successfully', 201);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const authResult = await this.authComposition.getAuthenticateUserUseCase().execute({
      email,
      password
    });
    
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
}
