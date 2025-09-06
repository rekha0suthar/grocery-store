import jwt from 'jsonwebtoken';
import { AuthenticationComposition } from '../composition/AuthenticationComposition.js';
import { validationResult } from 'express-validator';
import appConfig from '../config/appConfig.js';

/**
 * Auth Controller - Interface Adapter
 * 
 * This controller adapts HTTP requests/responses to use cases.
 * It contains NO business logic - only data transformation and HTTP concerns.
 */
export class AuthController {
  constructor() {
    // Use composition root to get use cases with all dependencies wired
    this.authComposition = new AuthenticationComposition();
    this.authenticateUserUseCase = this.authComposition.getAuthenticateUserUseCase();
    this.createUserUseCase = this.authComposition.getCreateUserUseCase();
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

      // Execute use case
      const result = await this.createUserUseCase.execute({
        email,
        name,
        password,
        role,
        phone,
        address
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      // Generate JWT token (HTTP concern)
      const token = this.generateToken(result.user);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: result.user,
        token
      });

    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
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

      // Execute use case
      const result = await this.authenticateUserUseCase.execute({
        email,
        password
      });

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message
        });
      }

      // Generate JWT token (HTTP concern)
      const token = this.generateToken(result.user);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // ===== HTTP-SPECIFIC CONCERNS =====
  
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, appConfig.getJWTSecret(), {
      expiresIn: appConfig.getJWTExpiration()
    });
  }

  async verifyToken(req, res, next) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, appConfig.getJWTSecret());
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }
}
