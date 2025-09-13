import { BaseController } from './BaseController.js';
import { RequestComposition } from '../composition/RequestComposition.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class RequestController extends BaseController {
  constructor() {
    super();
    this.requestComposition = new RequestComposition();
  }

  getAllRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type, status, priority } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    const requests = await this.requestComposition.getRequestRepository().findAll(filters, parseInt(limit), offset);
    const total = await this.requestComposition.getRequestRepository().count(filters);

    this.sendSuccess(res, {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Requests retrieved successfully');
  });

  getRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const request = await this.requestComposition.getRequestRepository().findById(id);
    
    if (!request) {
      return this.sendNotFound(res, 'Request not found');
    }
    
    this.sendSuccess(res, request, 'Request retrieved successfully');
  });

  getMyRequests = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;

    const filters = { requestedBy: userId };
    if (type) filters.type = type;
    if (status) filters.status = status;

    const requests = await this.requestComposition.getRequestRepository().findAll(filters, parseInt(limit), offset);
    const total = await this.requestComposition.getRequestRepository().count(filters);

    this.sendSuccess(res, {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Your requests retrieved successfully');
  });

  createStoreManagerRequest = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const requestData = req.body;
    
    const result = await this.requestComposition.getCreateStoreManagerRequestUseCase().execute(userId, requestData);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.request, result.message, 201);
  });

  createCategoryRequest = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type, requestData } = req.body;
    
    if (!['category_add_request', 'category_update_request', 'category_delete_request'].includes(type)) {
      return this.sendError(res, 'Invalid request type', 400);
    }

    const request = {
      type,
      status: 'pending',
      requestedBy: userId,
      requestData,
      priority: 'normal',
      notes: ''
    };

    const createdRequest = await this.requestComposition.getRequestRepository().create(request);
    
    this.sendSuccess(res, createdRequest, 'Category request submitted successfully', 201);
  });

  approveRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const approverId = req.user.id;
    const userRole = req.user.role;
    const { action } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return this.sendError(res, 'Invalid action. Must be "approve" or "reject"', 400);
    }

    const result = await this.requestComposition.getApproveRequestUseCase().execute(id, approverId, userRole, action);
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.request, result.message);
  });

  getPendingRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type, priority } = req.query;
    const offset = (page - 1) * limit;

    const filters = { status: 'pending' };
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const requests = await this.requestComposition.getRequestRepository().findAll(filters, parseInt(limit), offset);
    const total = await this.requestComposition.getRequestRepository().count(filters);

    this.sendSuccess(res, {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Pending requests retrieved successfully');
  });

  getRequestStats = asyncHandler(async (req, res) => {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      categoryAddRequests,
      categoryUpdateRequests,
      categoryDeleteRequests
    ] = await Promise.all([
      this.requestComposition.getRequestRepository().count(),
      this.requestComposition.getRequestRepository().countByStatus('pending'),
      this.requestComposition.getRequestRepository().countByStatus('approved'),
      this.requestComposition.getRequestRepository().countByStatus('rejected'),
      this.requestComposition.getRequestRepository().countByType('account_register_request'),
      this.requestComposition.getRequestRepository().countByType('category_add_request'),
      this.requestComposition.getRequestRepository().countByType('category_update_request'),
      this.requestComposition.getRequestRepository().countByType('category_delete_request')
    ]);

    const categoryRequests = categoryAddRequests + categoryUpdateRequests + categoryDeleteRequests;

    this.sendSuccess(res, {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      accountRegisterRequests: categoryAddRequests,
      categoryRequests
    }, 'Request statistics retrieved successfully');
  });
}
