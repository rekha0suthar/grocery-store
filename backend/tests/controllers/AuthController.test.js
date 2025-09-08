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
      
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(
        'createUser',
        userData
      );
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
      const loginResult = { user: { id: 'user1', email: 'test@example.com' }, token: 'jwt-token' };
      
      mockReq.body = loginData;
      mockAuthenticateUserUseCase.execute.mockResolvedValue(loginResult);
      
      await controller.login(mockReq, mockRes, mockNext);
      
      expect(mockAuthenticateUserUseCase.execute).toHaveBeenCalledWith(
        'authenticateUser',
        loginData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: loginResult
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
