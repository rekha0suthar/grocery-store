import { StoreManagerApprovalPolicy } from '../../services/StoreManagerApprovalPolicy.js';

export class ManageStoreManagerRequestsUseCase {
  constructor(userRepository, requestRepository, storeManagerProfileRepository, clock = null) {
    this.userRepository = userRepository;
    this.requestRepository = requestRepository;
    this.storeManagerProfileRepository = storeManagerProfileRepository;
    this.policy = new StoreManagerApprovalPolicy(clock);
  }

  
  async getPendingRequests(adminUserId) {
    try {
      const admin = await this.userRepository.findById(adminUserId);
      if (!admin) {
        return { 
          success: false, 
          message: 'Admin user not found' 
        };
      }

      const canView = this.policy.canViewStoreManagerRequests(admin);
      if (!canView.canView) {
        return { 
          success: false, 
          message: canView.reason 
        };
      }

      const allRequests = await this.requestRepository.findAll();
      const pendingRequests = this.policy.getPendingStoreManagerRequests(allRequests);

      return {
        success: true,
        requests: pendingRequests,
        message: `Found ${pendingRequests.length} pending store manager requests`
      };

    } catch (error) {
      console.error('GetPendingRequests error:', error);
      return { 
        success: false, 
        message: 'Failed to retrieve pending requests' 
      };
    }
  }

  async approveRequest(requestId, adminUserId) {
    try {
      const admin = await this.userRepository.findById(adminUserId);
      if (!admin) {
        return { 
          success: false, 
          message: 'Admin user not found' 
        };
      }

      const canApprove = this.policy.canApproveStoreManagerRequests(admin);
      if (!canApprove.canApprove) {
        return { 
          success: false, 
          message: canApprove.reason 
        };
      }

      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        return { 
          success: false, 
          message: 'Request not found' 
        };
      }

      const profile = await this.storeManagerProfileRepository.findByUserId(request.requestedBy);
      if (!profile) {
        return { 
          success: false, 
          message: 'Store manager profile not found' 
        };
      }

      const result = this.policy.approveStoreManagerRequest(request, profile, admin);
      
      if (result.success) {
        await this.requestRepository.update(request.id, request.toPersistence());
        await this.storeManagerProfileRepository.update(profile.id, profile.toPersistence());
      }

      return result;

    } catch (error) {
      console.error('ApproveRequest error:', error);
      return { 
        success: false, 
        message: 'Failed to approve request' 
      };
    }
  }

  async rejectRequest(requestId, adminUserId, reason = '') {
    try {
      const admin = await this.userRepository.findById(adminUserId);
      if (!admin) {
        return { 
          success: false, 
          message: 'Admin user not found' 
        };
      }

      const canApprove = this.policy.canApproveStoreManagerRequests(admin);
      if (!canApprove.canApprove) {
        return { 
          success: false, 
          message: canApprove.reason 
        };
      }

      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        return { 
          success: false, 
          message: 'Request not found' 
        };
      }

      const requestRejected = request.reject(admin.id, reason, 'Store manager request rejected by admin');
      
      if (!requestRejected) {
        return { 
          success: false, 
          message: 'Failed to reject request' 
        };
      }

      await this.requestRepository.update(request.id, request.toPersistence());

      return { 
        success: true, 
        message: 'Store manager request has been rejected' 
      };

    } catch (error) {
      console.error('RejectRequest error:', error);
      return { 
        success: false, 
        message: 'Failed to reject request' 
      };
    }
  }

  
  async getSystemStatus(adminUserId) {
    try {
      const admin = await this.userRepository.findById(adminUserId);
      if (!admin) {
        return { 
          success: false, 
          message: 'Admin user not found' 
        };
      }

      if (!admin.isAdmin()) {
        return { 
          success: false, 
          message: 'Only administrators can view system status' 
        };
      }

      const allUsers = await this.userRepository.findAll();
      const status = this.policy.getSystemStatus(allUsers);

      return {
        success: true,
        status: status,
        message: 'System status retrieved successfully'
      };

    } catch (error) {
      console.error('GetSystemStatus error:', error);
      return { 
        success: false, 
        message: 'Failed to retrieve system status' 
      };
    }
  }
}
