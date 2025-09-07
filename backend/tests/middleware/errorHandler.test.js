import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Error Handler Middleware - Error Processing', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent'
      }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('General Error Handling', () => {
    test('handles generic errors', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });

    test('handles errors without message', () => {
      const error = new Error();
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
          error: '',
          stack: error.stack 
        })
      });
    });
  });

  describe('Validation Error Handling', () => {
    test('handles validation errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.statusCode = 400;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });

    test('handles validation errors with details', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.statusCode = 400;
      error.details = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 8 characters' }
      ];
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        details: error.details,
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });
  });

  describe('Authentication Error Handling', () => {
    test('handles authentication errors', () => {
      const error = new Error('Invalid credentials');
      error.name = 'AuthenticationError';
      error.statusCode = 401;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });

    test('handles authorization errors', () => {
      const error = new Error('Insufficient permissions');
      error.name = 'AuthorizationError';
      error.statusCode = 403;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });
  });

  describe('Resource Error Handling', () => {
    test('handles not found errors', () => {
      const error = new Error('Resource not found');
      error.name = 'NotFoundError';
      error.statusCode = 404;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });

    test('handles conflict errors', () => {
      const error = new Error('Resource already exists');
      error.name = 'ConflictError';
      error.statusCode = 409;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource already exists',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });
  });

  describe('Database Error Handling', () => {
    test('handles database connection errors', () => {
      const error = new Error('Database connection failed');
      error.name = 'DatabaseError';
      error.statusCode = 503;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection failed',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });

    test('handles database constraint errors', () => {
      const error = new Error('Duplicate entry');
      error.name = 'DatabaseError';
      error.statusCode = 400;
      error.code = 'ER_DUP_ENTRY';
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate entry',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });
  });

  describe('JWT Error Handling', () => {
    test('handles JWT token errors', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      error.statusCode = 401;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });

    test('handles JWT expiration errors', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      error.statusCode = 401;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });
  });

  describe('Rate Limiting Error Handling', () => {
    test('handles rate limiting errors', () => {
      const error = new Error('Too many requests');
      error.name = 'RateLimitError';
      error.statusCode = 429;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many requests',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    });
  });

  describe('Environment-based Error Details', () => {
    test('includes error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: 'Test error',
        stack: 'Error stack trace'
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    test('excludes error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Status Code Handling', () => {
    test('uses custom status code when provided', () => {
      const error = new Error('Custom error');
      error.statusCode = 422;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(422);
    });

    test('defaults to 500 when no status code provided', () => {
      const error = new Error('Generic error');
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test('handles invalid status codes gracefully', () => {
      const error = new Error('Invalid status code');
      error.statusCode = 999; // Invalid status code
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(999);
    });
  });

  describe('Error Response Structure', () => {
    test('maintains consistent error response structure', () => {
      const error = new Error('Test error');
      error.statusCode = 400;
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      const responseCall = mockRes.json.mock.calls[0][0];
      
      expect(responseCall).toHaveProperty('success', false);
      expect(responseCall).toHaveProperty('message');
      expect(typeof responseCall.message).toBe('string');
    });

    test('includes additional error properties when available', () => {
      const error = new Error('Test error');
      error.statusCode = 400;
      error.details = { field: 'email', code: 'INVALID_FORMAT' };
      error.timestamp = new Date().toISOString();
      
      errorHandler(error, mockReq, mockRes, mockNext);
      
      const responseCall = mockRes.json.mock.calls[0][0];
      
      expect(responseCall).toHaveProperty('success', false);
      expect(responseCall).toHaveProperty('message', 'Test error');
      expect(responseCall).toHaveProperty('details', error.details);
    });
  });
});
