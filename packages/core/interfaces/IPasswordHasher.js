/**
 * Password Hasher Interface (Port)
 * 
 * This interface defines the contract for password hashing operations.
 * Implementations can use bcrypt, argon2, or any other hashing library.
 * 
 * The core defines this interface; adapters implement it.
 */
export class IPasswordHasher {
  /**
   * Hash a plain text password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hash(password) {
    throw new Error('IPasswordHasher.hash() must be implemented');
  }

  /**
   * Compare a plain text password with a hashed password
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password to compare against
   * @returns {Promise<boolean>} - True if passwords match
   */
  async compare(password, hashedPassword) {
    throw new Error('IPasswordHasher.compare() must be implemented');
  }
}
