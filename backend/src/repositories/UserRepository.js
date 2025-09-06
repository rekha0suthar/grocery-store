import { BaseRepository } from './BaseRepository.js';
import { User } from '../entities/User.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    const result = await this.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ? User.fromJSON(result.rows[0]) : null;
  }

  async findByRole(role, limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [role, limit, offset]
    );
    return result.rows.map(row => User.fromJSON(row));
  }

  async findPendingStoreManagers() {
    const result = await this.query(
      `SELECT u.* FROM users u 
       JOIN requests r ON u.id = r.requested_by 
       WHERE r.type = 'store_manager_approval' AND r.status = 'pending'`,
      []
    );
    return result.rows.map(row => User.fromJSON(row));
  }

  async updateLoginAttempts(id, attempts, lockedUntil = null) {
    const result = await this.query(
      'UPDATE users SET login_attempts = $2, locked_until = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id, attempts, lockedUntil]
    );
    return result.rows[0] ? User.fromJSON(result.rows[0]) : null;
  }

  async updateLastLogin(id) {
    const result = await this.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] ? User.fromJSON(result.rows[0]) : null;
  }

  async resetLoginAttempts(id) {
    const result = await this.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] ? User.fromJSON(result.rows[0]) : null;
  }

  async create(userData) {
    const result = await this.query(
      `INSERT INTO users (email, name, password_hash, role, phone, address, is_email_verified, is_phone_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        userData.email,
        userData.name,
        userData.password,
        userData.role,
        userData.phone || null,
        userData.address || null,
        userData.isEmailVerified || false,
        userData.isPhoneVerified || false
      ]
    );
    return User.fromJSON(result.rows[0]);
  }

  async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    const result = await this.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] ? User.fromJSON(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await this.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ? User.fromJSON(result.rows[0]) : null;
  }

  async findAll(limit = 100, offset = 0) {
    const result = await this.query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => User.fromJSON(row));
  }
}
