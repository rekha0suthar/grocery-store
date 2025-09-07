/**
 * Authorization Policy - Application-specific permission rules
 * 
 * Handles role-based permissions and authorization logic.
 * Configurable and testable with table-driven tests.
 */
export class AuthorizationPolicy {
  constructor() {
    this.permissions = {
      admin: [
        'manageUsers',
        'manageProducts', 
        'manageCategories',
        'approveStoreManagers',
        'placeOrders',
        'viewOrders',
        'viewAllOrders',
        'viewUserDetails',
        'editUserDetails'
      ],
      store_manager: [
        'manageProducts',
        'placeOrders',
        'viewOrders',
        'viewAllOrders',
        'viewUserDetails'
      ],
      customer: [
        'placeOrders',
        'viewOrders'
      ]
    };
  }

  // Check if a role has a specific permission
  can(role, permission) {
    const rolePermissions = this.permissions[role] || [];
    return rolePermissions.includes(permission);
  }

  // Get all permissions for a role
  getPermissions(role) {
    return this.permissions[role] || [];
  }

  // Check if user can perform action on another user
  canViewUserDetails(currentUser, targetUser) {
    // Users can always view their own details
    if (currentUser.id === targetUser.id) {
      return true;
    }
    // Only admins and store managers can view other users' details
    return this.can(currentUser.role, 'viewUserDetails');
  }

  canEditUserDetails(currentUser, targetUser) {
    // Users can edit their own details (except admins can't be edited by non-admins)
    if (currentUser.id === targetUser.id) {
      return !targetUser.isAdmin() || currentUser.isAdmin();
    }
    // Only admins can edit other users' details
    return this.can(currentUser.role, 'editUserDetails');
  }
}
