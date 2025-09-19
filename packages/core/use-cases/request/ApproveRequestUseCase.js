import { DefaultClock } from "../../adapters/DefaultClock.js";
import { Request } from '../../entities/Request.js';


export class ApproveRequestUseCase {
  constructor({ requestRepo, userRepo, categoryRepo, storeManagerProfileRepo }, clock = null) {
    this.requestRepository = requestRepo;
    this.userRepository = userRepo;
    this.categoryRepository = categoryRepo;
    this.storeManagerProfileRepository = storeManagerProfileRepo;
    this.clock = clock || new DefaultClock();
  }

  async execute(requestId, approverId, userRole, action, reason = null) {
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
        return await this.rejectRequest(request, approverId, reason);
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
    
    const updatedRequest = await this.requestRepository.update(request.id, requestEntity.toPersistence());

    if (requestEntity.type === 'account_register_request') {
      await this.approveStoreManagerRegistration(requestEntity);
    } else if (requestEntity.type === 'category_create_request') {
      await this.createCategory(requestEntity);
    } else if (requestEntity.type === 'category_update_request') {
      await this.modifyCategory(requestEntity);
    } else if (requestEntity.type === 'category_delete_request') {
      await this.deleteCategory(requestEntity);
    }

    return {
      success: true,
      message: 'Request approved successfully',
      request: updatedRequest
    };
  }

  async rejectRequest(request, approverId, reason) {
    const requestEntity = request instanceof Request ? request : Request.fromJSON(request);
    requestEntity.reject(approverId, reason);
    
    const updatedRequest = await this.requestRepository.update(request.id, requestEntity.toPersistence());

    return {
      success: true,
      message: 'Request rejected successfully',
      request: updatedRequest
    };
  }

  async approveStoreManagerRegistration(request) {
    const user = await this.userRepository.findById(request.requestedBy);
    if (!user) {
      throw new Error('User not found for store manager registration');
    }

    const profile = await this.storeManagerProfileRepository.findByUserId(user.id);
    if (!profile) {
      throw new Error('Store manager profile not found');
    }

    profile.approve(request.approvedBy);
    await this.storeManagerProfileRepository.update(profile.id, profile.toPersistence());
  }

  async createCategory(request) {
    const categoryData = request.requestData;
    await this.categoryRepository.create(categoryData);
  }

  async modifyCategory(request) {
    const categoryData = request.requestData;
    const categoryId = categoryData.originalCategory?.id || categoryData.id;
    if (!categoryId) {
      throw new Error('Category ID not found in request data');
    }
    
    const { originalCategory: _originalCategory, ...updateData } = categoryData;
    await this.categoryRepository.update(categoryId, updateData);
  }

  async deleteCategory(request) {
    const categoryData = request.requestData;
    const categoryId = categoryData.originalCategory?.id || categoryData.id;
    if (!categoryId) {
      throw new Error('Category ID not found in request data');
    }
    await this.categoryRepository.delete(categoryId);
  }
}
