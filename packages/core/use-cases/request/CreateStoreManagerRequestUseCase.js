import { RequestRepository } from '../../repositories/RequestRepository.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { Request } from '../../entities/Request.js';
import appConfig from '../../config/appConfig.js';

/**
 * Create Store Manager Request Use Case - Business Logic
 * Handles store manager approval requests
 */
export class CreateStoreManagerRequestUseCase {
  constructor() {
    this.requestRepository = new RequestRepository(appConfig.getDatabaseType());
    this.userRepository = new UserRepository(appConfig.getDatabaseType());
  }

  async execute(userId, requestData) {
    try {
      // Input validation
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required',
          request: null
        };
      }

      // Get user
      const userData = await this.userRepository.findById(userId);
      if (!userData) {
        return {
          success: false,
          message: 'User not found',
          request: null
        };
      }

      const user = User.fromJSON(userData);

      // Check if user is already a store manager or admin
      if (user.role === 'store_manager' || user.role === 'admin') {
        return {
          success: false,
          message: 'User already has store manager privileges',
          request: null
        };
      }

      // Check for existing pending request
      const existingRequest = await this.requestRepository.findByUserAndType(
        userId, 
        'store_manager_approval', 
        'pending'
      );

      if (existingRequest) {
        return {
          success: false,
          message: 'You already have a pending store manager request',
          request: null
        };
      }

      // Create request
      const request = new Request({
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: userId,
        requestData: {
          reason: requestData.reason || '',
          experience: requestData.experience || '',
          storeName: requestData.storeName || '',
          businessLicense: requestData.businessLicense || ''
        },
        priority: 'normal',
        notes: requestData.notes || ''
      });

      // Save request
      const createdRequest = await this.requestRepository.create(request.toJSON());

      return {
        success: true,
        message: 'Store manager request submitted successfully',
        request: Request.fromJSON(createdRequest)
      };

    } catch (error) {
      console.error('Store manager request creation error:', error);
      return {
        success: false,
        message: 'Failed to submit store manager request',
        request: null,
        error: error.message
      };
    }
  }
}
