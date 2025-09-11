import { BaseEntity } from './BaseEntity.js';
import { 
  isValidEmail, 
  isValidName, 
  isValidRole, 
  isValidPhone, 
  isValidAddress 
} from '../contracts/user.validation.js';

export class User extends BaseEntity {
  constructor(data = {}, clock = null) {
    super(data.id, clock);
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

  isAccountLocked() {
    if (!this.lockedUntil) {
      return false;
    }
    return this.clock.now() < this.lockedUntil;
  }

  incrementLoginAttempts() {
    this.loginAttempts += 1;
    this.updateTimestamp();
  }

  resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockedUntil = null;
    this.updateTimestamp();
  }

  lockAccount(lockDurationMs = 15 * 60 * 1000) { // 15 minutes default
    this.lockedUntil = this.clock.now().getTime() + lockDurationMs; // 15 minutes default
    this.updateTimestamp();
  }

  recordLogin() {
    this.lastLoginAt = this.clock.now();
    this.resetLoginAttempts();
    this.updateTimestamp();
  }

  isValid() {
    return this.validateEmail() && 
           this.validateName() && 
           this.validateRole() && 
           this.validatePhone() && 
           this.validateAddress();
  }

  validateEmail() {
    return isValidEmail(this.email);
  }

  validateName() {
    return isValidName(this.name);
  }

  validateRole() {
    return isValidRole(this.role);
  }

  validatePhone() {
    return isValidPhone(this.phone);
  }

  validateAddress() {
    return isValidAddress(this.address);
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
    const baseJson = super.toJSON();

    return {
      ...baseJson,
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
      ...super.toJSON(),
      email: this.email,
      name: this.name,
      password: this.password,
      role: this.role,
      phone: this.phone,
      address: this.address,
      isEmailVerified: this.isEmailVerified,
      isPhoneVerified: this.isPhoneVerified,
      lastLoginAt: this.lastLoginAt,
      loginAttempts: this.loginAttempts,
      lockedUntil: this.lockedUntil
    };
  }

  toPublicJSON() {
    return this.toJSON();
  }

  static fromJSON(data) {
    return new User(data);
  }
}
