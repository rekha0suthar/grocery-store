import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '@grocery-store/core/interfaces/IPasswordHasher.js';

/**
 * Bcrypt Password Hasher Adapter
 * 
 * This adapter implements the IPasswordHasher interface using bcrypt.
 * This is a framework/infrastructure detail that the core doesn't know about.
 */
export class BcryptPasswordHasher extends IPasswordHasher {
  constructor(saltRounds = 12) {
    super();
    this.saltRounds = saltRounds;
  }

  async hash(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
