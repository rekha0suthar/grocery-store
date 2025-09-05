import { IAuthProvider } from '../../interfaces/IAuthProvider.js';

/**
 * OAuth Authentication Provider
 * Implements OAuth-based authentication (Google, GitHub, etc.)
 */
export class OAuthProvider extends IAuthProvider {
  constructor(options = {}) {
    super();
    this.provider = options.provider || 'google'; // google, github, facebook, etc.
    this.clientId = options.clientId || process.env.OAUTH_CLIENT_ID;
    this.clientSecret = options.clientSecret || process.env.OAUTH_CLIENT_SECRET;
    this.redirectUri = options.redirectUri || process.env.OAUTH_REDIRECT_URI;
    this.scope = options.scope || 'openid email profile';
  }

  async authenticate(credentials) {
    // OAuth flow typically involves redirects
    // This method would handle the OAuth callback
    throw new Error('OAuth authenticate method must be implemented based on your OAuth provider');
  }

  async generateToken(user) {
    // OAuth typically doesn't generate custom tokens
    // Instead, it uses the provider's tokens
    return {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      provider: this.provider,
      type: 'OAuth'
    };
  }

  async verifyToken(token) {
    // Verify token with OAuth provider
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error_description || 'Invalid token');
      }

      return data;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  async refreshToken(refreshToken) {
    // Refresh token with OAuth provider
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error_description || 'Token refresh failed');
      }

      return data;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  async revokeToken(token) {
    // Revoke token with OAuth provider
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserFromToken(token) {
    const tokenData = await this.verifyToken(token);
    return {
      id: tokenData.sub,
      email: tokenData.email,
      name: tokenData.name,
      picture: tokenData.picture,
      provider: this.provider
    };
  }

  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
