import { RequestRepository } from '../../repositories/RequestRepository.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { CategoryRepository } from '../../repositories/CategoryRepository.js';
import { Request } from '../../entities/Request.js';
import { User } from '../../entities/User.js';
import { Category } from '../../entities/Category.js';
import appConfig from '../../config/appConfig.js';

/**
 * Approve Request Use Case - Business Logic
 * Handles request approval by admin
 */
export class ApproveRequestUseCase {
  constructor() {
    this.requestRepository = new RequestRepository(appConfig.getDatabaseType());
    this.userRepository = new UserRepository(appConfig.getDatabaseType());
    this.categoryRepository = new CategoryRepository(appConfig.getDatabaseType());
  }

  async execute(requestId, adminId, approvalData) {
    try {
      // Input validation
      if (!requestId || !adminId) {
        return {
          success: false,
          message: 'Request ID and admin ID are required',
          request: null
        };
      }

      // Get request
      const requestData = await this.requestRepository.findById(requestId);
      if (!requestData) {
        return {
          success: false,
          message: 'Request not found',
          request: null
        };
      }

      const request = Request.fromJSON(requestData);

      // Check if request is pending
      if (request.status !== 'pending') {
        return {
          success: false,
          message: 'Request is not pending',
          request: null
        };
      }

      // Get admin user
      const adminData = await this.userRepository.findById(adminId);
      if (!adminData) {
        return {
          success: false,
          message: 'Admin not found',
          request: null
        };
      }

      const admin = User.fromJSON(adminData);
      if (!admin.isAdmin()) {
        return {
          success: false,
          message: 'Only admins can approve requests',
          request: null
        };
      }

      // Process approval based on request type
      let result;
      switch (request.type) {
        case 'store_manager_approval':
          result = await this.approveStoreManagerRequest(request, adminId);
          break;
        case 'category_creation':
          result = await this.approveCategoryCreation(request, adminId);
          break;
        case 'category_modification':
          result = await this.approveCategoryModification(request, adminId);
          break;
        default:
          return {
            success: false,
            message: 'Unknown request type',
            request: null
          };
      }

      return result;

    } catch (error) {
      console.error('Request approval error:', error);
      return {
        success: false,
        message: 'Failed to approve request',
        request: null,
        error: error.message
      };
    }
  }

  async approveStoreManagerRequest(request, adminId) {
    // Update user role
    await this.userRepository.update(request.requestedBy, { role: 'store_manager' });

    // Update request status
    const updatedRequest = await this.requestRepository.update(request.id, {
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Store manager request approved successfully',
      request: Request.fromJSON(updatedRequest)
    };
  }

  async approveCategoryCreation(request, adminId) {
    const categoryData = request.requestData;
    
    // Create category
    const category = new Category({
      name: categoryData.name,
      description: categoryData.description,
      slug: categoryData.slug,
      imageUrl: categoryData.imageUrl,
      parentId: categoryData.parentId,
      sortOrder: categoryData.sortOrder,
      isVisible: true
    });

    const createdCategory = await this.categoryRepository.create(category.toJSON());

    // Update request status
    const updatedRequest = await this.requestRepository.update(request.id, {
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Category creation request approved successfully',
      request: Request.fromJSON(updatedRequest),
      category: Category.fromJSON(createdCategory)
    };
  }

  async approveCategoryModification(request, adminId) {
    const categoryData = request.requestData;
    
    // Update category
    const updatedCategory = await this.categoryRepository.update(
      categoryData.categoryId,
      {
        name: categoryData.name,
        description: categoryData.description,
        imageUrl: categoryData.imageUrl,
        sortOrder: categoryData.sortOrder,
        isVisible: categoryData.isVisible
      }
    );

    // Update request status
    const updatedRequest = await this.requestRepository.update(request.id, {
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Category modification request approved successfully',
      request: Request.fromJSON(updatedRequest),
      category: Category.fromJSON(updatedCategory)
    };
  }
}
