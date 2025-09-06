import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BaseController } from './BaseController.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class AuthController extends BaseController {
  constructor() {
    super();
    this.userRepository = new UserRepository();
  }

  register = asyncHandler(async (req, res) => {
    const { email, name, password, role = 'customer', phone, address } = req.body;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return this.sendError(res, 'User already exists with this email', 409);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      email,
      name,
      password: passwordHash,
      role,
      phone,
      address
    };

    const user = await this.userRepository.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return this.sendSuccess(res, {
      user: user.toJSON(),
      token
    }, 'User registered successfully', 201);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return this.sendError(res, 'Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return this.sendError(res, 'Account is temporarily locked. Please try again later.', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Increment login attempts
      await this.userRepository.updateLoginAttempts(user.id, user.loginAttempts + 1);
      return this.sendError(res, 'Invalid email or password', 401);
    }

    // Reset login attempts and update last login
    await this.userRepository.resetLoginAttempts(user.id);
    await this.userRepository.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return this.sendSuccess(res, {
      user: user.toJSON(),
      token
    }, 'Login successful');
  });

  getProfile = asyncHandler(async (req, res) => {
    return this.sendSuccess(res, req.user.toJSON(), 'Profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      return this.sendNotFound(res, 'User not found');
    }

    return this.sendSuccess(res, updatedUser.toJSON(), 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user with password
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return this.sendNotFound(res, 'User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return this.sendError(res, 'Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.update(userId, { password: newPasswordHash });

    return this.sendSuccess(res, null, 'Password changed successfully');
  });
}
