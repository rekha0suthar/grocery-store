/* eslint-disable no-unused-vars */
export class IPasswordHasher {
  async hash(_plainTextPassword) {
    throw new Error('IPasswordHasher.hash() must be implemented');
  }

  async compare(_password, _hashedPassword) {
    throw new Error('IPasswordHasher.compare() must be implemented');
  }
}
