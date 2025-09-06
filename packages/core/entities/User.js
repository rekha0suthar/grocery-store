import { BaseEntity } from './BaseEntity.js';

/**
 * User Entity - Enterprise-wide business rules
 * 
 * This entity contains ONLY business rules that would apply
 * across the entire enterprise, regardless of application.
 * 
 * NO infrastructure concerns, NO framework dependencies
 */
export class User extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.email = data.email || '';
    this.name = data.name || '';
    this.password = data.password || '';
    this.role = data.role || 'customer';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.isEmailVerified = data.isEmailVerified || false;
    this.isPhoneVerified = data.isPhoneVerified || false;
    this.lastLoginAt = data.lastLoginAt || null;
    this.loginAttempts = data.loginAttempts || 0;
    this.lockedUntil = data.lockedUntil || null;
  }

  // ===== ENTERPRISE-WIDE BUSINESS RULES =====
  
  // Role-based permissions (enterprise-wide rules)
  isAdmin() {
    return this.role === 'admin';
  }

  isStoreManager() {
    return this.role === 'store_manager';
  }

  isCustomer() {
    return this.role === 'customer';
  }

  canManageUsers() {
    return this.isAdmin();
  }

  canManageProducts() {
    return this.isAdmin() || this.isStoreManager();
  }

  canManageCategories() {
    return this.isAdmin();
  }

  canApproveStoreManagers() {
    return this.isAdmin();
  }

  canPlaceOrders() {
    return this.isCustomer() || this.isStoreManager() || this.isAdmin();
  }

  canViewOrders() {
    return true; // All users can view their own orders
  }

  canViewAllOrders() {
    return this.isAdmin() || this.isStoreManager();
  }

  // Account security rules (enterprise-wide)
  isAccountLocked() {
    if (!this.lockedUntil) return false;
    return this.lockedUntil > new Date();
  }

  shouldLockAccount() {
    return this.loginAttempts >= 5;
  }

  getLockoutDuration() {
    return 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  }

  incrementLoginAttempts() {
    this.loginAttempts += 1;
    if (this.shouldLockAccount()) {
      this.lockedUntil = new Date(Date.now() + this.getLockoutDuration());
    }
  }

  resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockedUntil = null;
  }

  // Business validation rules (enterprise-wide)
  isValid() {
    return this.validateEmail() && this.validateName() && this.validateRole();
  }

  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validateName() {
    return this.name && this.name.trim().length >= 2;
  }

  validateRole() {
    const validRoles = ['admin', 'store_manager', 'customer'];
    return validRoles.includes(this.role);
  }

  validatePhone() {
    if (!this.phone) return true; // Phone is optional
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(this.phone);
  }

  // Business rules for password requirements
  validatePassword(password) {
    if (!password) return false;
    return password.length >= 8;
  }

  // Business rules for account status
  isActive() {
    return !this.isAccountLocked();
  }

  isVerified() {
    return this.isEmailVerified;
  }

  // ===== PURE BUSINESS LOGIC METHODS =====
  
  // These methods contain business rules without side effects
  getDisplayName() {
    return this.name || this.email;
  }

  getRoleDisplayName() {
    const roleNames = {
      admin: 'Administrator',
      store_manager: 'Store Manager',
      customer: 'Customer'
    };
    return roleNames[this.role] || 'Unknown';
  }

  // Business rule: what information can this user see about others?
  canViewUserDetails(otherUser) {
    if (this.isAdmin()) return true;
    if (this.id === otherUser.id) return true;
    return false;
  }

  // Business rule: what information can this user edit about others?
  canEditUserDetails(otherUser) {
    if (this.isAdmin()) return true;
    if (this.id === otherUser.id && !otherUser.isAdmin()) return true;
    return false;
  }

  // ===== DATA TRANSFORMATION (PURE) =====
  
  // Convert to plain object for serialization
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      phone: this.phone,
      address: this.address,
      isEmailVerified: this.isEmailVerified,
      isPhoneVerified: this.isPhoneVerified,
      lastLoginAt: this.lastLoginAt,
      loginAttempts: this.loginAttempts,
      lockedUntil: this.lockedUntil,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new User(data);
  }

  // Sanitize for public display (remove sensitive data)
  toPublicJSON() {
    const json = this.toJSON();
    delete json.password;
    delete json.loginAttempts;
    delete json.lockedUntil;
    return json;
  }
}
