import { BaseEntity } from './BaseEntity.js';

/**
 * User Entity - Represents users in the grocery shopping system
 * Supports three roles: admin, store_manager, customer
 */
export class User extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.email = data.email || '';
    this.name = data.name || '';
    this.password = data.password || '';
    this.role = data.role || 'customer'; // admin, store_manager, customer
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.isEmailVerified = data.isEmailVerified || false;
    this.isPhoneVerified = data.isPhoneVerified || false;
    this.lastLoginAt = data.lastLoginAt || null;
    this.loginAttempts = data.loginAttempts || 0;
    this.lockedUntil = data.lockedUntil || null;
  }

  // Domain validation
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

  // Business rules
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

  // Account management
  isAccountLocked() {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  incrementLoginAttempts() {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Lock for 2 hours
    }
    this.updateTimestamp();
  }

  resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockedUntil = null;
    this.updateTimestamp();
  }

  updateLastLogin() {
    this.lastLoginAt = new Date();
    this.updateTimestamp();
  }

  // Getters
  getEmail() {
    return this.email;
  }

  getName() {
    return this.name;
  }

  getRole() {
    return this.role;
  }

  getPhone() {
    return this.phone;
  }

  getAddress() {
    return this.address;
  }

  getIsEmailVerified() {
    return this.isEmailVerified;
  }

  getIsPhoneVerified() {
    return this.isPhoneVerified;
  }

  // Setters
  setEmail(email) {
    this.email = email.toLowerCase().trim();
    this.updateTimestamp();
    return this;
  }

  setName(name) {
    this.name = name.trim();
    this.updateTimestamp();
    return this;
  }

  setPassword(password) {
    this.password = password;
    this.updateTimestamp();
    return this;
  }

  setRole(role) {
    if (['admin', 'store_manager', 'customer'].includes(role)) {
      this.role = role;
      this.updateTimestamp();
    }
    return this;
  }

  setPhone(phone) {
    this.phone = phone;
    this.updateTimestamp();
    return this;
  }

  setAddress(address) {
    this.address = address;
    this.updateTimestamp();
    return this;
  }

  setEmailVerified(verified) {
    this.isEmailVerified = verified;
    this.updateTimestamp();
    return this;
  }

  setPhoneVerified(verified) {
    this.isPhoneVerified = verified;
    this.updateTimestamp();
    return this;
  }

  // Convert to plain object (exclude sensitive data)
  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      email: this.email,
      name: this.name,
      role: this.role,
      phone: this.phone,
      address: this.address,
      isEmailVerified: this.isEmailVerified,
      isPhoneVerified: this.isPhoneVerified,
      lastLoginAt: this.lastLoginAt,
      // Exclude password, loginAttempts, lockedUntil for security
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new User(data);
  }

  // Create user with specific role
  static createAdmin(data) {
    const user = new User(data);
    user.setRole('admin');
    return user;
  }

  static createStoreManager(data) {
    const user = new User(data);
    user.setRole('store_manager');
    return user;
  }

  static createCustomer(data) {
    const user = new User(data);
    user.setRole('customer');
    return user;
  }
}
