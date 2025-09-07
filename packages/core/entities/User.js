import { BaseEntity } from './BaseEntity.js';

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
  }

  isAdmin() {
    return this.role === 'admin';
  }

  isStoreManager() {
    return this.role === 'store_manager';
  }

  isCustomer() {
    return this.role === 'customer';
  }

  verifyEmail() {
    if (this.isEmailVerified) {
      throw new Error('Email already verified');
    }
    this.isEmailVerified = true;
    this.updateTimestamp();
  }

  verifyPhone() {
    if (this.isPhoneVerified) {
      throw new Error('Phone already verified');
    }
    this.isPhoneVerified = true;
    this.updateTimestamp();
  }

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

  isVerified() {
    return this.isEmailVerified;
  }

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
      lastLoginAt: this.lastLoginAt
    };
  }

  toPersistence() {
    return {
      ...this.toJSON(),
      password: this.password
    };
  }

  static fromJSON(data) {
    return new User(data);
  }

  toPublicJSON() {
    return this.toJSON();
  }
}
