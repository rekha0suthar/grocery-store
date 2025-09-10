/* eslint-disable no-unused-vars */
export class IAuthProvider {

  async authenticate(_credentials) {
    throw new Error('authenticate method must be implemented');
  }

  async generateToken(_user) {
    throw new Error('generateToken method must be implemented');
  }

  async verifyToken(_token) {
    throw new Error('verifyToken method must be implemented');
  }

  async refreshToken(_refreshToken) {
    throw new Error('refreshToken method must be implemented');
  }

  async revokeToken(_token) {
    throw new Error('revokeToken method must be implemented');
  }

  async getUserFromToken(_token) {
    throw new Error('getUserFromToken method must be implemented');
  }
}
