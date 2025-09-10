/* eslint-disable no-unused-vars */
import { IRepository } from './IRepository.js';

export class IUserRepository extends IRepository {
  async findByEmail(_email) {
    throw new Error('findByEmail method must be implemented');
  }

  async findByRole(_role) {
    throw new Error('findByRole method must be implemented');
  }

  async findActiveUsers() {
    throw new Error('findActiveUsers method must be implemented');
  }

  async findByRoles(_roles) {
    throw new Error('findByRoles method must be implemented');
  }

  async updatePassword(_id, _hashedPassword) {
    throw new Error('updatePassword method must be implemented');
  }

  async updateLoginAttempts(_id, _attempts, _lockedUntil = null) {
    throw new Error('updateLoginAttempts method must be implemented');
  }

  async updateLastLogin(_id, _lastLoginAt) {
    throw new Error('updateLastLogin method must be implemented');
  }

  async findByVerificationStatus(_isEmailVerified, _isPhoneVerified) {
    throw new Error('findByVerificationStatus method must be implemented');
  }

  async search(_searchTerm) {
    throw new Error('search method must be implemented');
  }
}