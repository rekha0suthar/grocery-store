import { BaseRepository } from './BaseRepository.js';
import { User } from '@grocery-store/core/entities';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class UserRepository extends BaseRepository {
  constructor(databaseTypeOrAdapter = 'firebase') {
    let adapter;
    if (typeof databaseTypeOrAdapter === 'string') {
      adapter = DatabaseFactory.createAdapter(databaseTypeOrAdapter);
    } else {
      adapter = databaseTypeOrAdapter;
    }
    super('users', adapter);
  }

  async findByEmail(email) {
    const userData = await this.findByField('email', email);
    return userData ? User.fromJSON(userData) : null;
  }

  async findByRole(role) {
    const users = await this.findAll({ role });
    return users;
  }

  async findActive() {
    const users = await this.findAll({ isActive: true });
    return users;
  }

  async updateLoginAttempts(id, attempts, lockedUntil = null) {
    const updateData = { login_attempts: attempts, locked_until: lockedUntil };
    const result = await this.update(id, updateData);
    return result ? User.fromJSON(result) : null;
  }

  async updateLastLogin(id, lastLoginTime = new Date()) {
    const updateData = { lastLoginAt: lastLoginTime };
    const result = await this.update(id, updateData);
    return result ? User.fromJSON(result) : null;
  }

  async resetLoginAttempts(id) {
    const updateData = { login_attempts: 0, locked_until: null };
    const result = await this.update(id, updateData);
    return result ? User.fromJSON(result) : null;
  }

  async countByRole(role) {
    return await this.db.count('users', { role });
  }

  async countActive() {
    return await this.db.count('users', { isActive: true });
  }

  async create(userData) {
    const user = new User(userData);
    const result = await super.create(user.toPersistence());
    return User.fromJSON(result);
  }

  async update(id, userData) {
    const result = await super.update(id, userData);
    return result ? User.fromJSON(result) : null;
  }

  async findById(id) {
    const result = await super.findById(id);
    return result ? User.fromJSON(result) : null;
  }

  async findAll(filters = {}) {
    const results = await super.findAll(filters);
    return results.map(user => User.fromJSON(user));
  }
}
