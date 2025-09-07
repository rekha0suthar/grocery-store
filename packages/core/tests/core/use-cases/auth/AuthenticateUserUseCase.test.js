import { AuthenticateUserUseCase } from '../../../../use-cases/auth/AuthenticateUserUseCase.js';
import { User } from '../../../../entities/User.js';
import { FakeClock } from '../../../../utils/FakeClock.js';

describe('AuthenticateUserUseCase - Application Policy', () => {
  let useCase;
  let mockUserRepository;
  let mockPasswordHasher;
  let fakeClock;

  beforeEach(() => {
    fakeClock = new FakeClock(new Date('2025-01-01T10:00:00Z'));

    // Mock repositories and adapters
    mockUserRepository = {
      findByEmail: jest.fn(),
      update: jest.fn()
    };

    mockPasswordHasher = {
      compare: jest.fn()
    };

    useCase = new AuthenticateUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  describe('Input Validation', () => {
    test('rejects missing credentials', async () => {
      const result = await useCase.execute(null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Credentials are required');
      expect(result.user).toBeNull();
    });

    test('rejects missing email', async () => {
      const result = await useCase.execute({ password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email is required');
      expect(result.user).toBeNull();
    });

    test('rejects missing password', async () => {
      const result = await useCase.execute({ email: 'test@example.com' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
      expect(result.user).toBeNull();
    });

    test('rejects invalid email format', async () => {
      const result = await useCase.execute({
        email: 'invalid-email',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email format');
      expect(result.user).toBeNull();
    });
  });

  describe('User Lookup', () => {
    test('rejects when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(result.user).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('Account Lockout', () => {
    test('rejects locked account', async () => {
      const lockedUser = new User({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'customer',
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      });

      mockUserRepository.findByEmail.mockResolvedValue(lockedUser);

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Account is locked');
      expect(result.user).toBeNull();
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    });
  });

  describe('Password Verification', () => {
    test('rejects invalid password and records failed attempt', async () => {
      const user = new User({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'customer'
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockPasswordHasher.compare.mockResolvedValue(false);
      mockUserRepository.update.mockResolvedValue(user);

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(result.user).toBeNull();
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    test('accepts valid password and resets attempts', async () => {
      const user = new User({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'customer',
        loginAttempts: 3
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue(user);

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'correctpassword'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Authentication successful');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.password).toBeUndefined(); // Should not include password
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword');
      expect(mockUserRepository.update).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database connection failed'));

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Authentication failed');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });

    test('handles password hasher errors gracefully', async () => {
      const user = new User({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'customer'
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockPasswordHasher.compare.mockRejectedValue(new Error('Hash comparison failed'));

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Authentication failed');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Hash comparison failed');
    });
  });

  describe('Business Rules Integration', () => {
    test('uses entity business rules for account lockout check', async () => {
      const user = new User({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'customer',
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000)
      });

      // Spy on the entity method
      const isAccountLockedSpy = jest.spyOn(user, 'isAccountLocked');

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await useCase.execute({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(isAccountLockedSpy).toHaveBeenCalled();
      isAccountLockedSpy.mockRestore();
    });

    test('returns public JSON without sensitive data', async () => {
      const user = new User({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        role: 'customer',
        phone: '+1234567890'
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue(user);

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'correctpassword'
      });

      expect(result.success).toBe(true);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('loginAttempts');
      expect(result.user).not.toHaveProperty('lockedUntil');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('role');
    });
  });
});
