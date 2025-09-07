import { CreateUserUseCase } from '../../../../use-cases/auth/CreateUserUseCase.js';
import { User } from '../../../../entities/User.js';

describe('CreateUserUseCase - Application Policy', () => {
  let useCase;
  let mockUserRepository;
  let mockPasswordHasher;

  beforeEach(() => {
    // Create mock dependencies
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn()
    };

    mockPasswordHasher = {
      hash: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new CreateUserUseCase({
      userRepo: mockUserRepository,
      passwordHasher: mockPasswordHasher
    });
  });

  describe('Input Validation', () => {
    test('rejects missing user data', async () => {
      const result = await useCase.execute(null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User data is required');
      expect(result.user).toBeNull();
    });

    test('rejects missing email', async () => {
      const result = await useCase.execute({
        name: 'Test User',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email is required');
      expect(result.user).toBeNull();
    });

    test('rejects missing name', async () => {
      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name is required');
      expect(result.user).toBeNull();
    });

    test('rejects missing password', async () => {
      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Password is required');
      expect(result.user).toBeNull();
    });

    test('rejects invalid email format', async () => {
      const result = await useCase.execute({
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid user data');
      expect(result.user).toBeNull();
    });

    test('rejects weak password', async () => {
      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: '123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Password must be at least 6 characters long');
      expect(result.user).toBeNull();
    });

    test('rejects invalid role', async () => {
      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: 'invalid_role'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid user data');
      expect(result.user).toBeNull();
    });
  });

  describe('User Existence Check', () => {
    test('rejects when user already exists', async () => {
      const existingUser = new User({
        email: 'test@example.com',
        name: 'Existing User',
        password: 'hashedpassword'
      });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User with this email already exists');
      expect(result.user).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('User Creation', () => {
    test('creates user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const hashedPassword = 'hashedpassword';
      const createdUser = new User({
        ...userData,
        password: hashedPassword,
        id: 'user1'
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser.toPersistence());

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.password).toBeUndefined(); // Should not include password in response
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    test('creates user with default role when not specified', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const hashedPassword = 'hashedpassword';
      const createdUser = new User({
        ...userData,
        password: hashedPassword,
        role: 'customer',
        id: 'user1'
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser.toPersistence());

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('customer');
    });

    test('creates user with specified role', async () => {
      const userData = {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
        role: 'admin'
      };

      const hashedPassword = 'hashedpassword';
      const createdUser = new User({
        ...userData,
        password: hashedPassword,
        id: 'user1'
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser.toPersistence());

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('admin');
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User creation failed');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Database error');
    });

    test('handles password hashing errors gracefully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockRejectedValue(new Error('Hashing failed'));

      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User creation failed');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Hashing failed');
    });

    test('handles user creation errors gracefully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue('hashedpassword');
      mockUserRepository.create.mockRejectedValue(new Error('Creation failed'));

      const result = await useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User creation failed');
      expect(result.user).toBeNull();
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('Entity Integration', () => {
    test('creates valid User entity with all required fields', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        phone: '+1234567890',
        address: '123 Test St'
      };

      const hashedPassword = 'hashedpassword';
      const createdUser = new User({
        ...userData,
        password: hashedPassword,
        id: 'user1'
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser.toPersistence());

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.phone).toBe('+1234567890');
      expect(result.user.address).toBe('123 Test St');
      expect(result.user.role).toBe('customer');
      expect(result.user.isEmailVerified).toBe(false);
      expect(result.user.isPhoneVerified).toBe(false);
    });

    test('validates created user entity', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const hashedPassword = 'hashedpassword';
      const createdUser = new User({
        ...userData,
        password: hashedPassword,
        id: 'user1'
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser.toPersistence());

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);

      // The created user should be valid according to entity business rules
      const userEntity = User.fromJSON(result.user);
      expect(userEntity.isValid()).toBe(true);
      expect(userEntity.validateEmail()).toBe(true);
      expect(userEntity.validateName()).toBe(true);
      expect(userEntity.validateRole()).toBe(true);
    });
  });
});
