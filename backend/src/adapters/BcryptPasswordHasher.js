import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '@grocery-store/core/interfaces';
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
