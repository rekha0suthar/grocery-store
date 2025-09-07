import { BaseController } from '../../src/controllers/BaseController.js';

describe('BaseController - HTTP Interface Adapter', () => {
  let controller;
  let mockRes;

  beforeEach(() => {
    controller = new BaseController();
    
    // Mock Express response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Success Responses', () => {
    test('sends success response with default values', () => {
      controller.sendSuccess(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: null
      });
    });

    test('sends success response with custom data', () => {
      const data = { id: '123', name: 'Test' };
      controller.sendSuccess(mockRes, data);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: data
      });
    });

    test('sends success response with custom message', () => {
      const data = { id: '123' };
      const message = 'Resource created successfully';
      controller.sendSuccess(mockRes, data, message);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: data
      });
    });

    test('sends success response with custom status code', () => {
      const data = { id: '123' };
      const message = 'Resource created';
      const statusCode = 201;
      controller.sendSuccess(mockRes, data, message, statusCode);
      
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: data
      });
    });
  });

  describe('Error Responses', () => {
    test('sends error response with default values', () => {
      controller.sendError(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error'
      });
    });

    test('sends error response with custom message', () => {
      const message = 'Validation failed';
      controller.sendError(mockRes, message);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message
      });
    });

    test('sends error response with custom status code', () => {
      const message = 'Internal server error';
      const statusCode = 500;
      controller.sendError(mockRes, message, statusCode);
      
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message
      });
    });

    test('sends error response with details', () => {
      const message = 'Validation failed';
      const statusCode = 400;
      const details = { field: 'email', error: 'Invalid format' };
      controller.sendError(mockRes, message, statusCode, details);
      
      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        details: details
      });
    });
  });

  describe('Validation Error Response', () => {
    test('sends validation error response', () => {
      const errors = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 8 characters' }
      ];
      
      controller.sendValidationError(mockRes, errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    });
  });

  describe('HTTP Status Responses', () => {
    test('sends not found response with default message', () => {
      controller.sendNotFound(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });

    test('sends not found response with custom message', () => {
      const message = 'User not found';
      controller.sendNotFound(mockRes, message);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message
      });
    });

    test('sends unauthorized response with default message', () => {
      controller.sendUnauthorized(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized'
      });
    });

    test('sends unauthorized response with custom message', () => {
      const message = 'Invalid credentials';
      controller.sendUnauthorized(mockRes, message);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message
      });
    });

    test('sends forbidden response with default message', () => {
      controller.sendForbidden(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden'
      });
    });

    test('sends forbidden response with custom message', () => {
      const message = 'Insufficient permissions';
      controller.sendForbidden(mockRes, message);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message
      });
    });
  });

  describe('Async Handler', () => {
    test('handles successful async function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const mockReq = { body: {} };
      const mockNext = jest.fn();
      
      const asyncHandler = controller.asyncHandler(mockFn);
      await asyncHandler(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('handles async function that throws error', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const mockReq = { body: {} };
      const mockNext = jest.fn();
      
      const asyncHandler = controller.asyncHandler(mockFn);
      await asyncHandler(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('handles async function that returns rejected promise', async () => {
      const error = new Error('Promise rejected');
      const mockFn = jest.fn().mockReturnValue(Promise.reject(error));
      const mockReq = { body: {} };
      const mockNext = jest.fn();
      
      const asyncHandler = controller.asyncHandler(mockFn);
      await asyncHandler(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('Response Chain', () => {
    test('maintains response object chain', () => {
      const result = controller.sendSuccess(mockRes);
      
      expect(result).toBe(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('maintains response object chain for errors', () => {
      const result = controller.sendError(mockRes, 'Test error', 500);
      
      expect(result).toBe(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
