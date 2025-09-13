import { RegisterStoreManagerUseCase } from '../../../../use-cases/auth/RegisterStoreManagerUseCase.js';
import { User } from '../../../../entities/User.js';
import { StoreManagerProfile } from '../../../../entities/StoreManagerProfile.js';
import { Request } from '../../../../entities/Request.js';
import { FakeClock } from '../../../utils/FakeClock.js';

class MockUserRepository {
  constructor() {
    this.users = [];
  }

  async findAll() {
    return [...this.users];
  }

  async findByEmail(email) {
    return this.users.find(user => user.email === email) || null;
  }

  async create(userData) {
    // userData is persistence data from toPersistence(), so we need to create a User entity
    const user = new User(userData);
    this.users.push(user);
    return user;
  }

  async update(id, userData) {
    const existingIndex = this.users.findIndex(u => u.id === id);
    if (existingIndex >= 0) {
      const existingUser = this.users[existingIndex];
      Object.assign(existingUser, userData);
      existingUser.updatedAt = new Date();
      return existingUser;
    }
    return null;
  }
}

class MockRequestRepository {
  constructor() {
    this.requests = [];
  }

  async create(requestData) {
    const request = new Request(requestData);
    this.requests.push(request);
    return request;
  }

  async update(id, requestData) {
    const existingIndex = this.requests.findIndex(r => r.id === id);
    if (existingIndex >= 0) {
      const existingRequest = this.requests[existingIndex];
      Object.assign(existingRequest, requestData);
      existingRequest.updatedAt = new Date();
      return existingRequest;
    }
    return null;
  }

  async findById(id) {
    return this.requests.find(r => r.id === id) || null;
  }
}

describe('RegisterStoreManagerUseCase', () => {
  let useCase;
  let userRepository;
  let requestRepository;
  let clock;

  beforeEach(() => {
    clock = new FakeClock();
    userRepository = new MockUserRepository();
    requestRepository = new MockRequestRepository();
    useCase = new RegisterStoreManagerUseCase(userRepository, requestRepository, clock);
  });

  describe('execute', () => {
    it('should successfully register a store manager when admin exists', async () => {
      const admin = new User({
        email: 'admin@store.com',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const userData = {
        email: 'manager@store.com',
        name: 'John Manager',
        password: 'password123',
        phone: '+1234567890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.user).toBeInstanceOf(User);
      expect(result.user.role).toBe('store_manager');
      expect(result.user.email).toBe('manager@store.com');
      expect(result.profile).toBeInstanceOf(StoreManagerProfile);
      expect(result.profile.isApproved).toBe(false);
      expect(result.request).toBeInstanceOf(Request);
      expect(result.request.type).toBe('account_register_request');
      expect(result.request.status).toBe('pending');
      expect(result.message).toContain('pending approval');
    });

    it('should reject registration with invalid data', async () => {
      const admin = new User({
        email: 'admin@store.com',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const userData = {
        email: 'invalid-email',
        name: 'J', // Too short
        password: 'weak'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid user data provided');
    });

    it('should reject registration if user already exists', async () => {
      const admin = new User({
        email: 'admin@store.com',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const userData1 = {
        email: 'manager@store.com',
        name: 'John Manager',
        password: 'password123',
        phone: '+1234567890'
      };
      await useCase.execute(userData1);

      const userData2 = {
        email: 'manager@store.com',
        name: 'Jane Manager',
        password: 'password456',
        phone: '+0987654321'
      };

      const result = await useCase.execute(userData2);

      expect(result.success).toBe(false);
      expect(result.message).toBe('A user with this email already exists');
    });

    it('should reject registration when no admin exists', async () => {
      const userData = {
        email: 'manager@store.com',
        name: 'John Manager',
        password: 'password123',
        phone: '+1234567890'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No administrator exists');
    });

    it('should create unapproved store manager profile', async () => {
      const admin = new User({
        email: 'admin@store.com',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const userData = {
        email: 'manager@store.com',
        name: 'John Manager',
        password: 'password123',
        phone: '+1234567890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      };

      const result = await useCase.execute(userData);

      expect(result.profile.isApproved).toBe(false);
      expect(result.profile.storeName).toBe('My Store');
      expect(result.profile.storeAddress).toBe('123 Main St');
    });
  });
});
