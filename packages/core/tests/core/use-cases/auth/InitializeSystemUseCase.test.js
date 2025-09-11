import { InitializeSystemUseCase } from '../../../../use-cases/auth/InitializeSystemUseCase.js';
import { User } from '../../../../entities/User.js';
import { FakeClock } from '../../../utils/FakeClock.js';

// Mock repository
class MockUserRepository {
  constructor() {
    this.users = [];
  }

  async findAll() {
    return [...this.users];
  }

  async findById(id) {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email) {
    return this.users.find(user => user.email === email) || null;
  }

  async create(userData) {
    const user = new User(userData);
    this.users.push(user);
    return user;
  }

  async update(id, userData) {
    const existingIndex = this.users.findIndex(u => u.id === id);
    if (existingIndex >= 0) {
      const existingUser = this.users[existingIndex];
      // Update the existing user with new data
      Object.assign(existingUser, userData);
      existingUser.updatedAt = new Date();
      return existingUser;
    }
    return null;
  }
}

describe('InitializeSystemUseCase', () => {
  let useCase;
  let userRepository;
  let clock;

  beforeEach(() => {
    clock = new FakeClock();
    userRepository = new MockUserRepository();
    useCase = new InitializeSystemUseCase(userRepository, clock);
  });

  describe('execute', () => {
    it('should successfully initialize system with first admin', async () => {
      const adminData = {
        email: 'admin@store.com',
        name: 'System Admin',
        password: 'admin123',
        phone: '+1234567890'
      };

      const result = await useCase.execute(adminData);

      expect(result.success).toBe(true);
      expect(result.user).toBeInstanceOf(User);
      expect(result.user.role).toBe('admin');
      expect(result.user.email).toBe('admin@store.com');
      expect(result.user.isEmailVerified).toBe(true);
      expect(result.message).toContain('successfully initialized');
    });

    it('should reject initialization when admin already exists', async () => {
      // Create existing admin
      const existingAdmin = new User({
        email: 'existing@admin.com',
        role: 'admin'
      }, clock);
      await userRepository.create(existingAdmin);

      const adminData = {
        email: 'new@admin.com',
        name: 'New Admin',
        password: 'admin123'
      };

      const result = await useCase.execute(adminData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only one administrator is allowed');
    });

    it('should reject initialization with invalid data', async () => {
      const adminData = {
        email: 'invalid-email',
        name: 'A', // Too short
        password: 'weak'
      };

      const result = await useCase.execute(adminData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid admin data');
    });

    it('should reject initialization with duplicate email', async () => {
      // Create existing user with same email
      const existingUser = new User({
        email: 'admin@store.com',
        role: 'customer'
      }, clock);
      await userRepository.create(existingUser);

      const adminData = {
        email: 'admin@store.com',
        name: 'System Admin',
        password: 'admin123'
      };

      const result = await useCase.execute(adminData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('email already exists');
    });
  });

  describe('checkInitializationStatus', () => {
    it('should return needs initialization when no users exist', async () => {
      const result = await useCase.checkInitializationStatus();

      expect(result.needsInitialization).toBe(true);
      expect(result.isInitialized).toBe(false);
      expect(result.adminCount).toBe(0);
      expect(result.message).toContain('needs to be initialized');
    });

    it('should return initialized when admin exists', async () => {
      // Create admin user
      const admin = new User({
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const result = await useCase.checkInitializationStatus();

      expect(result.needsInitialization).toBe(false);
      expect(result.isInitialized).toBe(true);
      expect(result.adminCount).toBe(1);
      expect(result.message).toContain('properly initialized');
    });

    it('should return initialized when admin exists with other users', async () => {
      // Create multiple users including admin
      const admin = new User({ role: 'admin' }, clock);
      const customer = new User({ role: 'customer' }, clock);
      const storeManager = new User({ role: 'store_manager' }, clock);
      
      await userRepository.create(admin);
      await userRepository.create(customer);
      await userRepository.create(storeManager);

      const result = await useCase.checkInitializationStatus();

      expect(result.needsInitialization).toBe(false);
      expect(result.isInitialized).toBe(true);
      expect(result.adminCount).toBe(1);
    });
  });
});
