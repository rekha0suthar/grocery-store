import { ConfigController } from '../../src/controllers/ConfigController.js';
import config from '../../src/config/appConfig.js';

// Mock dependencies
jest.mock('../../src/config/appConfig.js', () => ({
  getFrontendConfig: jest.fn(),
  getApiUrl: jest.fn(),
  getFrontendUrl: jest.fn(),
  isDevelopment: jest.fn(),
  isProduction: jest.fn(),
  isStaging: jest.fn(),
  environment: 'test'
}));

describe('ConfigController - HTTP Interface Adapter', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Create controller
    controller = new ConfigController();
    
    // Mock Express objects
    mockReq = {
      body: {},
      query: {},
      params: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('test-user-agent')
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Get Configuration', () => {
    test('returns configuration successfully', async () => {
      const mockConfig = {
        features: { search: true },
        limits: { maxProducts: 100 }
      };
      
      config.getFrontendConfig.mockReturnValue(mockConfig);
      config.getApiUrl.mockReturnValue('http://localhost:3000');
      config.getFrontendUrl.mockReturnValue('http://localhost:3001');
      config.isDevelopment.mockReturnValue(true);
      config.isProduction.mockReturnValue(false);
      config.isStaging.mockReturnValue(false);
      
      await controller.getConfig(mockReq, mockRes, mockNext);
      
      expect(config.getFrontendConfig).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Configuration retrieved successfully',
        data: expect.objectContaining({
          features: mockConfig.features,
          limits: mockConfig.limits,
          client: expect.objectContaining({
            ip: '127.0.0.1',
            isMobile: false
          })
        })
      });
    });
  });

  describe('Get Health', () => {
    test('returns health status successfully', async () => {
      config.getApiUrl.mockReturnValue('http://localhost:3000');
      
      await controller.getHealth(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health check successful',
        data: expect.objectContaining({
          status: 'healthy',
          environment: 'test'
        })
      });
    });
  });

  describe('Get Environment', () => {
    test('returns environment information successfully', async () => {
      const mockConfig = {
        features: { search: true },
        limits: { maxProducts: 100 }
      };
      
      config.getFrontendConfig.mockReturnValue(mockConfig);
      config.getApiUrl.mockReturnValue('http://localhost:3000');
      config.getFrontendUrl.mockReturnValue('http://localhost:3001');
      config.isDevelopment.mockReturnValue(true);
      config.isProduction.mockReturnValue(false);
      config.isStaging.mockReturnValue(false);
      
      await controller.getEnvironment(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Environment information retrieved',
        data: expect.objectContaining({
          name: 'test',
          isDevelopment: true,
          features: mockConfig.features
        })
      });
    });
  });
});
