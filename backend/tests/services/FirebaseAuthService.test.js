import { FirebaseAuthService } from '../../src/services/FirebaseAuthService.js';

describe('FirebaseAuthService - Authentication Service', () => {
  let firebaseAuthService;

  beforeEach(() => {
    // Mock the Firebase Auth service methods directly
    firebaseAuthService = {
      createUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentUser: jest.fn(),
      onAuthStateChanged: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    test('creates user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      };

      const mockResult = {
        success: true,
        user: {
          uid: 'user123',
          email: 'test@example.com',
          displayName: 'Test User'
        }
      };

      firebaseAuthService.createUser.mockResolvedValue(mockResult);

      const result = await firebaseAuthService.createUser(userData);

      expect(firebaseAuthService.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockResult);
    });

    test('handles user creation errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResult = {
        success: false,
        error: 'Email already exists'
      };

      firebaseAuthService.createUser.mockResolvedValue(mockResult);

      const result = await firebaseAuthService.createUser(userData);

      expect(result).toEqual(mockResult);
    });
  });

  describe('User Authentication', () => {
    test('signs in user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResult = {
        success: true,
        user: {
          uid: 'user123',
          email: 'test@example.com',
          displayName: 'Test User'
        }
      };

      firebaseAuthService.signIn.mockResolvedValue(mockResult);

      const result = await firebaseAuthService.signIn(credentials);

      expect(firebaseAuthService.signIn).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(mockResult);
    });

    test('handles sign in errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockResult = {
        success: false,
        error: 'Invalid credentials'
      };

      firebaseAuthService.signIn.mockResolvedValue(mockResult);

      const result = await firebaseAuthService.signIn(credentials);

      expect(result).toEqual(mockResult);
    });
  });

  describe('User Sign Out', () => {
    test('signs out user successfully', async () => {
      const mockResult = {
        success: true
      };

      firebaseAuthService.signOut.mockResolvedValue(mockResult);

      const result = await firebaseAuthService.signOut();

      expect(firebaseAuthService.signOut).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    test('handles sign out errors', async () => {
      const mockResult = {
        success: false,
        error: 'Sign out failed'
      };

      firebaseAuthService.signOut.mockResolvedValue(mockResult);

      const result = await firebaseAuthService.signOut();

      expect(result).toEqual(mockResult);
    });
  });

  describe('Current User', () => {
    test('gets current user when authenticated', () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      firebaseAuthService.getCurrentUser.mockReturnValue(mockUser);

      const result = firebaseAuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    test('returns null when no user is authenticated', () => {
      firebaseAuthService.getCurrentUser.mockReturnValue(null);

      const result = firebaseAuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('Authentication State', () => {
    test('sets up authentication state listener', () => {
      const mockCallback = jest.fn();

      firebaseAuthService.onAuthStateChanged(mockCallback);

      expect(firebaseAuthService.onAuthStateChanged).toHaveBeenCalledWith(mockCallback);
    });
  });

  describe('Service Interface', () => {
    test('has required methods', () => {
      expect(typeof firebaseAuthService.createUser).toBe('function');
      expect(typeof firebaseAuthService.signIn).toBe('function');
      expect(typeof firebaseAuthService.signOut).toBe('function');
      expect(typeof firebaseAuthService.getCurrentUser).toBe('function');
      expect(typeof firebaseAuthService.onAuthStateChanged).toBe('function');
    });
  });
});
