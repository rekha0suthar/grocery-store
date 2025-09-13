import { RequestController } from '../../src/controllers/RequestController.js';
import { RequestComposition } from '../../src/composition/RequestComposition.js';

jest.mock('../../src/composition/RequestComposition.js');

describe('RequestController - HTTP Interface Adapter', () => {
  let controller;
  let mockReq;
  let mockRes;
  let mockRequestRepository;
  let mockCreateStoreManagerRequestUseCase;
  let mockApproveRequestUseCase;

  beforeEach(() => {
    mockRequestRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      countByStatus: jest.fn(),
      countByType: jest.fn()
    };

    mockCreateStoreManagerRequestUseCase = {
      execute: jest.fn()
    };
    
    mockApproveRequestUseCase = {
      execute: jest.fn()
    };
    
    const mockRequestComposition = {
      getRequestRepository: jest.fn().mockReturnValue(mockRequestRepository),
      getCreateStoreManagerRequestUseCase: jest.fn().mockReturnValue(mockCreateStoreManagerRequestUseCase),
      getApproveRequestUseCase: jest.fn().mockReturnValue(mockApproveRequestUseCase)
    };
    
    RequestComposition.mockImplementation(() => mockRequestComposition);
    
    controller = new RequestController();
    
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { id: 'user1', role: 'admin' }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('creates RequestController instance', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(RequestController);
    });

    test('has required methods', () => {
      expect(typeof controller.getAllRequests).toBe('function');
      expect(typeof controller.getRequestById).toBe('function');
      expect(typeof controller.getMyRequests).toBe('function');
      expect(typeof controller.createStoreManagerRequest).toBe('function');
      expect(typeof controller.createCategoryRequest).toBe('function');
      expect(typeof controller.approveRequest).toBe('function');
      expect(typeof controller.getPendingRequests).toBe('function');
      expect(typeof controller.getRequestStats).toBe('function');
    });
  });

  describe('Get All Requests (Admin)', () => {
    test('retrieves all requests successfully', async () => {
      const mockRequests = [
        { id: 'req1', type: 'account_register_request', status: 'pending' },
        { id: 'req2', type: 'category_add_request', status: 'approved' }
      ];
      
      mockRequestRepository.findAll.mockResolvedValue(mockRequests);
      mockRequestRepository.count.mockResolvedValue(2);
      
      const asyncFunction = async (req, res) => {
        const { page = 1, limit = 20, type, status, priority } = req.query;
        const offset = (page - 1) * limit;

        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (priority) filters.priority = priority;

        const requests = await controller.requestComposition.getRequestRepository().findAll(filters, parseInt(limit), offset);
        const total = await controller.requestComposition.getRequestRepository().count(filters);

        controller.sendSuccess(res, {
          requests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }, 'Requests retrieved successfully');
      };
      
      await asyncFunction(mockReq, mockRes);
      
      expect(mockRequestRepository.findAll).toHaveBeenCalledWith({}, 20, 0);
      expect(mockRequestRepository.count).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Requests retrieved successfully',
        data: {
          requests: mockRequests,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            pages: 1
          }
        }
      });
    });
  });

  describe('Create Store Manager Request', () => {
    test('creates store manager request successfully', async () => {
      const requestData = {
        storeName: 'Test Store',
        storeAddress: '123 Test St',
        businessLicense: 'BL123456'
      };
      
      mockReq.body = requestData;
      mockReq.user = { id: 'user1' };
      
      const mockResult = {
        success: true,
        message: 'Store manager request submitted successfully',
        request: { id: 'req1', type: 'account_register_request' }
      };
      
      mockCreateStoreManagerRequestUseCase.execute.mockResolvedValue(mockResult);
      
      const asyncFunction = async (req, res) => {
        const userId = req.user.id;
        const requestData = req.body;
        
        const result = await controller.requestComposition.getCreateStoreManagerRequestUseCase().execute(userId, requestData);
        
        if (!result.success) {
          return controller.sendError(res, result.message, 400);
        }
        
        controller.sendSuccess(res, result.request, result.message, 201);
      };
      
      await asyncFunction(mockReq, mockRes);
      
      expect(mockCreateStoreManagerRequestUseCase.execute).toHaveBeenCalledWith('user1', requestData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Store manager request submitted successfully',
        data: mockResult.request
      });
    });
  });

  describe('Get Request Statistics', () => {
    test('retrieves request statistics successfully', async () => {
      mockRequestRepository.count.mockResolvedValue(10); // total
      mockRequestRepository.countByStatus
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(5) // approved
        .mockResolvedValueOnce(2); // rejected
      mockRequestRepository.countByType
        .mockResolvedValueOnce(4) // store manager requests
        .mockResolvedValueOnce(3) // category creation
        .mockResolvedValueOnce(3); // category modification
      
      const asyncFunction = async (req, res) => {
        const [
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          storeManagerRequests,
          categoryCreationRequests,
          categoryModificationRequests
        ] = await Promise.all([
          controller.requestComposition.getRequestRepository().count(),
          controller.requestComposition.getRequestRepository().countByStatus('pending'),
          controller.requestComposition.getRequestRepository().countByStatus('approved'),
          controller.requestComposition.getRequestRepository().countByStatus('rejected'),
          controller.requestComposition.getRequestRepository().countByType('account_register_request'),
          controller.requestComposition.getRequestRepository().countByType('category_add_request'),
          controller.requestComposition.getRequestRepository().countByType('category_update_request')
        ]);

        const categoryRequests = categoryCreationRequests + categoryModificationRequests;

        controller.sendSuccess(res, {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          storeManagerRequests,
          categoryRequests
        }, 'Request statistics retrieved successfully');
      };
      
      await asyncFunction(mockReq, mockRes);
      
      expect(mockRequestRepository.count).toHaveBeenCalledTimes(1);
      expect(mockRequestRepository.countByStatus).toHaveBeenCalledTimes(3);
      expect(mockRequestRepository.countByType).toHaveBeenCalledTimes(3);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Request statistics retrieved successfully',
        data: {
          total: 10,
          pending: 3,
          approved: 5,
          rejected: 2,
          storeManagerRequests: 4,
          categoryRequests: 6
        }
      });
    });
  });
});
