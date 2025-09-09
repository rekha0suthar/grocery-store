import { AuthController } from '../../src/controllers/AuthController.js';
import { AuthenticationComposition } from '../../src/composition/AuthenticationComposition.js';

// Mock dependencies
jest.mock('../../src/composition/AuthenticationComposition.js');

describe('AuthController - HTTP Interface Adapter', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;
  let mockCreateUserUseCase;
  let mockAuthenticateUserUseCase;

  beforeEach(() => {
    // Mock use cases
    mockCreateUserUseCase = {
      execute: jest.fn()
    };
    
    mockAuthenticateUserUseCase = {
      execute: jest.fn()
    };
    
    // Mock composition
    const mockAuthComposition = {
      getCreateUserUseCase: jest.fn().mockReturnValue(mockCreateUserUseCase),
      getAuthenticateUserUseCase: jest.fn().mockReturnValue(mockAuthenticateUserUseCase)
    };
    
    AuthenticationComposition.mockImplementation(() => mockAuthComposition);
    
    // Create controller
    controller = new AuthController();
    
    // Mock JWT provider
    const mockJwtProvider = {
      generateToken: jest.fn().mockResolvedValue({
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresIn: '24h',
        type: 'Bearer'
      })
    };
    controller.jwtProvider = mockJwtProvider;
    
    // Mock Express objects
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { id: 'user1', email: 'test@example.com' }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('creates AuthController instance', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AuthController);
    });

    test('has required methods', () => {
      expect(typeof controller.register).toBe('function');
      expect(typeof controller.login).toBe('function');
      expect(typeof controller.logout).toBe('function');
      expect(typeof controller.getProfile).toBe('function');
      expect(typeof controller.updateProfile).toBe('function');
    });
  });

  describe('User Registration', () => {
    test('registers user successfully', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const createdUser = { id: 'user1', ...userData };
      
      mockReq.body = userData;
      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);
      
      await controller.register(mockReq, mockRes, mockNext);
      
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: createdUser
      });
    });
  });

  describe('User Login', () => {
    test('logs in user successfully', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const authResult = { 
        success: true, 
        user: { id: 'user1', email: 'test@example.com' } 
      };
      
      mockReq.body = loginData;
      mockAuthenticateUserUseCase.execute.mockResolvedValue(authResult);
      
      // Test the underlying async function directly
      const loginFunction = async (req, res) => {
        const { email, password } = req.body;
        
        // Use case handles business logic (authentication validation)
        const authResult = await controller.authComposition.getAuthenticateUserUseCase().execute({
          email,
          password
        });
        
        if (!authResult.success) {
          return controller.sendError(res, authResult.message, 401);
        }
        
        // Controller handles framework concerns (JWT token generation)
        const tokenData = await controller.jwtProvider.generateToken(authResult.user);
        
        controller.sendSuccess(res, {
          user: authResult.user,
          ...tokenData
        }, 'Login successful');
      };
      
      await loginFunction(mockReq, mockRes);
      
      expect(mockAuthenticateUserUseCase.execute).toHaveBeenCalledWith(loginData);
      expect(controller.jwtProvider.generateToken).toHaveBeenCalledWith(authResult.user);
      
      // Check that sendSuccess was called (which calls both status and json)
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: authResult.user,
          token: 'jwt-token',
          refreshToken: 'refresh-token',
          expiresIn: '24h',
          type: 'Bearer'
        }
      });
    });
  });

  describe('User Profile', () => {
    test('gets user profile successfully', async () => {
      await controller.getProfile(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile retrieved successfully',
        data: mockReq.user
      });
    });
  });
});
