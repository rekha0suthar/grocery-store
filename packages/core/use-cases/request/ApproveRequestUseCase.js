import { DefaultClock } from "../../adapters/DefaultClock.js";
import { Request } from '../../entities/Request.js';
import { User } from '../../entities/User.js';
import { Category } from '../../entities/Category.js';


export class ApproveRequestUseCase {
  /**
   * @param {{ requestRepo: { findById(id):Promise<Request>, update(id, data):Promise<Request> }, userRepo: { findById(id):Promise<User>, update(id, data):Promise<User> }, categoryRepo: { findById(id):Promise<Category>, create(data):Promise<Category> } }} deps
   */
  constructor({ requestRepo, userRepo, categoryRepo }, clock = null) {
    this.requestRepository = requestRepo;
    this.userRepository = userRepo;
    this.categoryRepository = categoryRepo;
    this.clock = clock || new DefaultClock();
  }

  async execute(requestId, approverId, userRole, action) {
    try {
      // Authorization check
      if (!this.canApproveRequest(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to approve request',
          request: null
        };
      }

      // Get request
      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        return {
          success: false,
          message: 'Request not found',
          request: null
        };
      }

      // Validate request can be processed
      if (!request.canBeReviewed()) {
        return {
          success: false,
          message: 'Request cannot be reviewed in current status',
          request: null
        };
      }

      // Process based on action
      if (action === 'approve') {
        return await this.approveRequest(request, approverId);
      } else if (action === 'reject') {
        return await this.rejectRequest(request, approverId);
      } else {
        return {
          success: false,
          message: 'Invalid action',
          request: null
        };
      }

    } catch (error) {
      console.error('ApproveRequestUseCase error:', error);
      return {
        success: false,
        message: 'Failed to process request',
        request: null,
        error: error.message
      };
    }
  }

  canApproveRequest(userRole) {
    return ['admin', 'store_manager'].includes(userRole);
  }

  async approveRequest(request, approverId) {
    // Use entity business logic - handle both entity and JSON
    const requestEntity = request instanceof Request ? request : Request.fromJSON(request);
    requestEntity.approve(approverId);
    
    // Update request in repository
    const updatedRequest = await this.requestRepository.update(request.id, requestEntity.toJSON());

    // Execute the approved request
    await this.executeApprovedRequest(request);

    return {
      success: true,
      message: 'Request approved successfully',
      request: Request.fromJSON(updatedRequest)
    };
  }

  async rejectRequest(request, approverId) {
    // Update request status
    const updatedRequest = await this.requestRepository.update(request.id, {
      ...request,
      status: 'rejected',
      rejectedAt: this.clock.now().toISOString(),
      rejectedBy: approverId
    });

    return {
      success: true,
      message: 'Request rejected successfully',
      request: Request.fromJSON(updatedRequest)
    };
  }

  async executeApprovedRequest(request) {
    switch (request.type) {
      case 'store_manager_approval':
        await this.promoteToStoreManager(request);
        break;
      case 'category_creation':
        await this.createCategory(request);
        break;
      case 'category_modification':
        await this.modifyCategory(request);
        break;
      default:
        console.warn(`Unknown request type: ${request.type}`);
    }
  }

  async promoteToStoreManager(request) {
    const user = await this.userRepository.findById(request.requesterId);
    if (user) {
      await this.userRepository.update(user.id, {
        ...user,
        role: 'store_manager'
      });
    }
  }

  async createCategory(request) {
    const categoryData = request.requestData;
    await this.categoryRepository.create(categoryData);
  }

  async modifyCategory(request) {
    const categoryData = request.requestData;
    await this.categoryRepository.update(categoryData.id, categoryData);
  }
}
