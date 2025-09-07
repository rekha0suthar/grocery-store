import { Request } from '../../entities/Request.js';
import { User } from '../../entities/User.js';

/**
 * Create Store Manager Request Use Case - Business Logic
 * Handles store manager approval requests
 */
export class CreateStoreManagerRequestUseCase {
  /**
   * @param {{ requestRepo: { findByUserAndType(userId, type, status):Promise<Request>, create(data):Promise<Request> }, userRepo: { findById(id):Promise<User> } }} deps
   */
  constructor({ requestRepo, userRepo }) {
    this.requestRepository = requestRepo;
    this.userRepository = userRepo;
  }

  async execute(userId, requestData) {
    try {
      // Input validation
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required',
          request: new Request({})
        };
      }

      // Validate request data
      if (!requestData || !requestData.storeName) {
        return {
          success: false,
          message: 'Store name is required',
          request: new Request({})
        };
      }

      if (!requestData.storeAddress) {
        return {
          success: false,
          message: 'Store address is required',
          request: new Request({})
        };
      }

      if (!requestData.businessLicense) {
        return {
          success: false,
          message: 'Business license is required',
          request: new Request({})
        };
      }

      // Get user
      const userData = await this.userRepository.findById(userId);
      if (!userData) {
        return {
          success: false,
          message: 'User not found',
          request: new Request({})
        };
      }

      const user = User.fromJSON(userData);

      // Check if user is already a store manager or admin
      if (user.role === 'store_manager' || user.role === 'admin') {
        return {
          success: false,
          message: 'User already has store manager privileges',
          request: new Request({})
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
          request: new Request({})
        };
      }

      // Create request
      const request = new Request({
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: userId,
        requestData: {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          reason: requestData.reason || '',
          experience: requestData.experience || '',
          storeName: requestData.storeName || '',
          storeAddress: requestData.storeAddress || '',
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
        request: new Request({}),
        error: error.message
      };
    }
  }
}
