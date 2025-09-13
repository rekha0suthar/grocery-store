import { Request } from '../entities/Request.js';
import { StoreManagerProfile } from '../entities/StoreManagerProfile.js';
import { AdminManagementPolicy } from './AdminManagementPolicy.js';

export class StoreManagerApprovalPolicy {
  constructor(clock = null) {
    this.clock = clock;
    this.adminPolicy = new AdminManagementPolicy(clock);
  }

  canRegisterAsStoreManager(userData, existingUsers = []) {
    const adminCheck = this.adminPolicy.canRegisterStoreManager(existingUsers);
    if (!adminCheck.canRegister) {
      return adminCheck;
    }

    if (!userData.email || !userData.name) {
      return { canRegister: false, reason: 'Email and name are required' };
    }

    return { canRegister: true };
  }

  createStoreManagerApprovalRequest(userData, requestedBy) {
    const requestData = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      storeName: userData.storeName || 'TBD',
      storeAddress: userData.storeAddress || 'TBD',
      role: 'store_manager'
    };

    return new Request({
      type: 'account_register_request',
      status: 'pending',
      requestedBy: requestedBy,
      requestData: requestData,
      priority: 'normal'
    }, this.clock);
  }

  createStoreManagerProfile(userId, storeData = {}) {
    return new StoreManagerProfile({
      userId: userId,
      isApproved: false,
      storeName: storeData.storeName || 'TBD',
      storeAddress: storeData.storeAddress || 'TBD'
    }, this.clock);
  }

  canUserLogin(user, profile = null) {
    if (user.isAccountLocked()) {
      return { 
        canLogin: false, 
        reason: 'Your account is temporarily locked due to multiple failed login attempts.' 
      };
    }

    if (user.isAdmin() || user.isCustomer()) {
      return { canLogin: true };
    }

    if (user.isStoreManager()) {
      if (!profile) {
        return { 
          canLogin: false, 
          reason: 'Store manager profile not found. Please contact support.' 
        };
      }

      if (!profile.canLogin()) {
        return { 
          canLogin: false, 
          reason: 'Your store manager account is pending approval. Please wait for an administrator to approve your request.' 
        };
      }

      return { canLogin: true };
    }

    return { canLogin: true };
  }

  canViewStoreManagerRequests(user) {
    return this.adminPolicy.canViewStoreManagerRequests(user);
  }

  canApproveStoreManagerRequests(user) {
    return this.adminPolicy.canApproveStoreManagerRequests(user);
  }

  approveStoreManager(profile, approver) {
    const canApprove = this.canApproveStoreManagerRequests(approver);
    if (!canApprove.canApprove) {
      return { success: false, message: canApprove.reason };
    }

    try {
      profile.approve(approver.id);
      return { 
        success: true, 
        message: 'Store manager has been successfully approved and can now login' 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  rejectStoreManager(profile, approver) {
    const canApprove = this.canApproveStoreManagerRequests(approver);
    if (!canApprove.canApprove) {
      return { success: false, message: canApprove.reason };
    }

    try {
      if (profile.isApproved) {
        profile.revokeApproval();
        return { 
          success: true, 
          message: 'Store manager approval has been revoked' 
        };
      } else {
        return { 
          success: true, 
          message: 'Store manager was already not approved' 
        };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }


  approveStoreManagerRequest(request, profile, approver) {
    const canApprove = this.canApproveStoreManagerRequests(approver);
    if (!canApprove.canApprove) {
      return { success: false, message: canApprove.reason };
    }

    if (!request.isStoreManagerApprovalRequest()) {
      return { success: false, message: 'Invalid request type for store manager approval' };
    }

    if (!request.canBeReviewed()) {
      return { success: false, message: 'Request cannot be reviewed in its current state' };
    }

    const requestApproved = request.approve(approver.id, 'Store manager approved by admin');
    
    if (!requestApproved) {
      return { success: false, message: 'Failed to approve request' };
    }

    const profileResult = this.approveStoreManager(profile, approver);
    
    if (!profileResult.success) {
      request.status = 'pending';
      request.reviewedBy = null;
      request.reviewedAt = null;
      return profileResult;
    }

    return { 
      success: true, 
      message: 'Store manager request and profile have been successfully approved' 
    };
  }

  getApprovalStatusMessage(user, profile = null) {
    if (!user.isStoreManager()) {
      return 'User is not a store manager';
    }

    if (!profile) {
      return 'Store manager profile not found';
    }

    if (profile.isApproved) {
      return 'Store manager account is approved and active';
    }

    return 'Store manager account is pending approval from an administrator';
  }

  getPendingStoreManagerRequests(requests) {
    return requests.filter(request => 
      request.isStoreManagerApprovalRequest() && 
      request.isPending()
    );
  }

  getSystemStatus(existingUsers = []) {
    return this.adminPolicy.getSystemStatus(existingUsers);
  }
}
