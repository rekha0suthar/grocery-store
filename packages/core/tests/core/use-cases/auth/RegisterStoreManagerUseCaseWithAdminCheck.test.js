import { RegisterStoreManagerUseCase } from '../../../../use-cases/auth/RegisterStoreManagerUseCase.js';
import { User } from '../../../../entities/User.js';
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
}

describe('RegisterStoreManagerUseCase with Admin Check', () => {
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

  describe('execute with admin check', () => {
    it('should allow store manager registration when admin exists', async () => {
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
      expect(result.user.role).toBe('store_manager');
      expect(result.profile.isApproved).toBe(false);
      expect(result.request.type).toBe('store_manager_approval');
    });

    it('should reject store manager registration when no admin exists', async () => {
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

    it('should reject store manager registration when only customers exist', async () => {
      const customer1 = new User({
        email: 'customer1@store.com',
        role: 'customer'
      }, clock);
      const customer2 = new User({
        email: 'customer2@store.com',
        role: 'customer'
      }, clock);
      await userRepository.save(customer1);
      await userRepository.save(customer2);

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

    it('should reject store manager registration when only store managers exist', async () => {
      const manager1 = new User({
        email: 'manager1@store.com',
        role: 'store_manager'
      }, clock);
      const manager2 = new User({
        email: 'manager2@store.com',
        role: 'store_manager'
      }, clock);
      await userRepository.save(manager1);
      await userRepository.save(manager2);

      const userData = {
        email: 'manager3@store.com',
        name: 'John Manager',
        password: 'password123',
        phone: '+1234567890'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No administrator exists');
    });

    it('should allow store manager registration when admin and other users exist', async () => {  
      const admin = new User({
        email: 'admin@store.com',
        role: 'admin'
      }, clock);
      const customer = new User({
        email: 'customer@store.com',
        role: 'customer'
      }, clock);
      const existingManager = new User({
        email: 'existing@manager.com',
        role: 'store_manager'
      }, clock);
      
      await userRepository.save(admin);
      await userRepository.save(customer);
      await userRepository.save(existingManager);

      const userData = {
        email: 'newmanager@store.com',
        name: 'New Manager',
        password: 'password123',
        phone: '+1234567890'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('store_manager');
    });
  });
});
