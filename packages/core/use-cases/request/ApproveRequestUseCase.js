import { DefaultClock } from "../../adapters/DefaultClock.js";
import { Request } from '../../entities/Request.js';

export class ApproveRequestUseCase {
  constructor({ requestRepo, userRepo, categoryRepo }, clock = null) {
    this.requestRepository = requestRepo;
    this.userRepository = userRepo;
    this.categoryRepository = categoryRepo;
    this.clock = clock || new DefaultClock();
  }

  async execute(requestId, approverId, userRole, action) {
    try {
      if (!this.canApproveRequest(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to approve request',
          request: null
        };
      }

        const request = await this.requestRepository.findById(requestId);
      if (!request) {
        return {
          success: false,
          message: 'Request not found',
          request: null
        };
      }

      if (!request.canBeReviewed()) {
        return {
          success: false,
          message: 'Request cannot be reviewed in current status',
          request: null
        };
      }

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
    const requestEntity = request instanceof Request ? request : Request.fromJSON(request);
    requestEntity.approve(approverId);
    
    const updatedRequest = await this.requestRepository.update(request.id, requestEntity.toJSON());

    await this.executeApprovedRequest(request);

    return {
      success: true,
      message: 'Request approved successfully',
      request: Request.fromJSON(updatedRequest)
    };
  }

  async rejectRequest(request, approverId) {
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
      case 'account_register_request':
        await this.promoteToStoreManager(request);
        break;
      case 'category_add_request':
        await this.createCategory(request);
        break;
      case 'category_update_request':
      case 'category_delete_request':
        await this.deleteCategory(request);
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

  async deleteCategory(request) {
    const categoryData = request.requestData;
    await this.categoryRepository.delete(categoryData.id);
  }
}
