import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import appConfig from '../config/appConfig.js';
import { validationResult } from 'express-validator';

export class AuthController {
  constructor() {
    this.userRepository = new UserRepository(appConfig.getDatabaseType());
  }

  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, name, password, role = 'customer', phone, address } = req.body;

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const userData = {
        email,
        name,
        password: passwordHash,
        role,
        phone,
        address,
        isEmailVerified: false,
        isPhoneVerified: false
      };

      const user = await this.userRepository.create(userData);
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        appConfig.get('jwt.secret'),
        { expiresIn: appConfig.get('jwt.expiresIn') }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: this.sanitizeUser(user), token }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.userRepository.incrementLoginAttempts(user.id);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      await this.userRepository.resetLoginAttempts(user.id);
      await this.userRepository.updateLastLogin(user.id);

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        appConfig.get('jwt.secret'),
        { expiresIn: appConfig.get('jwt.expiresIn') }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: { user: this.sanitizeUser(user), token }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user: this.sanitizeUser(user) }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
