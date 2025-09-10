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

  async save(user) {
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      user.id = user.id || `user_${Date.now()}`;
      this.users.push(user);
    }
    return user;
  }
}

class MockRequestRepository {
  constructor() {
    this.requests = [];
  }

  async save(request) {
    const existingIndex = this.requests.findIndex(r => r.id === request.id);
    if (existingIndex >= 0) {
      this.requests[existingIndex] = request;
    } else {
      request.id = request.id || `request_${Date.now()}`;
      this.requests.push(request);
    }
    return request;
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
      await userRepository.save(admin);

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
      expect(result.request.type).toBe('store_manager_approval');
      expect(result.request.status).toBe('pending');
      expect(result.message).toContain('pending approval');
    });

    it('should reject registration with invalid data', async () => {
      const admin = new User({
        email: 'admin@store.com',
        role: 'admin'
      }, clock);
      await userRepository.save(admin);

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
      await userRepository.save(admin);

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
      await userRepository.save(admin);

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
