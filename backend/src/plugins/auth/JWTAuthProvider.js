import jwt from 'jsonwebtoken';
import { IAuthProvider } from '@grocery-store/core/interfaces';

export class JWTAuthProvider extends IAuthProvider {
  constructor(options = {}) {
    super();
    this.secret = options.secret || process.env.JWT_SECRET;
    this.expiresIn = options.expiresIn || '24h';
    this.refreshExpiresIn = options.refreshExpiresIn || '7d';
    this.algorithm = options.algorithm || 'HS256';
  }

  async authenticate(_credentials) {
    throw new Error('authenticate method must be implemented with your user repository');
  }

  async generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      iat: Math.floor(Date.now() / 1000)
    };

    const _token = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      algorithm: this.algorithm
    });

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      this.secret,
      { expiresIn: this.refreshExpiresIn, algorithm: this.algorithm }
    );

    return {
      _token,
      refreshToken,
      expiresIn: this.expiresIn,
      type: 'Bearer'
    };
  }

  async verifyToken(_token) {
    try {
      const decoded = jwt.verify(_token, this.secret, {
        algorithms: [this.algorithm]
      });
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired _token');
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.secret, {
        algorithms: [this.algorithm]
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh _token');
      }

      const user = { id: decoded.id }; 
      return await this.generateToken(user);
    } catch (error) {
      throw new Error('Invalid refresh _token');
    }
  }

  async revokeToken(_token) {
    return true;
  }

  async getUserFromToken(_token) {
    const decoded = await this.verifyToken(_token);
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  }
}
