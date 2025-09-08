import { BaseRepository } from './BaseRepository.js';
import { User } from '@grocery-store/core/entities';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class UserRepository extends BaseRepository {
  constructor(databaseType = 'firebase') {
    const adapter = DatabaseFactory.createAdapter(databaseType);
    super('users', adapter);
  }

  async findByEmail(email) {
    const result = await this.db.findByField('users', 'email', email);
    return result ? User.fromJSON(result) : null;
  }

  async findByRole(role) {
    const users = await this.findAll({ role });
    return users.map(user => User.fromJSON(user));
  }

  async updateLoginAttempts(id, attempts, lockedUntil = null) {
    const updateData = { login_attempts: attempts, locked_until: lockedUntil };
    const result = await this.update(id, updateData);
    return result ? User.fromJSON(result) : null;
  }

  async updateLastLogin(id) {
    const updateData = { last_login_at: new Date().toISOString() };
    const result = await this.update(id, updateData);
    return result ? User.fromJSON(result) : null;
  }

  async resetLoginAttempts(id) {
    const updateData = { login_attempts: 0, locked_until: null };
    const result = await this.update(id, updateData);
    return result ? User.fromJSON(result) : null;
  }

  async create(userData) {
    const user = new User(userData);
    const result = await super.create(user.toJSON());
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
