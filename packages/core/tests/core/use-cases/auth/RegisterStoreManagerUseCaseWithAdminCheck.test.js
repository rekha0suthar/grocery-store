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
}

class MockStoreManagerProfileRepository {
  constructor() {
    this.profiles = [];
  }

  async create(profileData) {
    const profile = new StoreManagerProfile(profileData);
    this.profiles.push(profile);
    return profile;
  }

  async findByUserId(userId) {
    return this.profiles.find(profile => profile.userId === userId) || null;
  }

  async update(id, profileData) {
    const existingIndex = this.profiles.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      const existingProfile = this.profiles[existingIndex];
      Object.assign(existingProfile, profileData);
      existingProfile.updatedAt = new Date();
      return existingProfile;
    }
    return null;
  }
}

class MockPasswordHasher {
  async hash(password) {
    return `hashed_${password}`;
  }

  async compare(password, hashedPassword) {
    return hashedPassword === `hashed_${password}`;
  }
}

describe('RegisterStoreManagerUseCase with Admin Check', () => {
  let useCase;
  let userRepository;
  let requestRepository;
  let profileRepository;
  let passwordHasher;
  let clock;

  beforeEach(() => {
    clock = new FakeClock();
    userRepository = new MockUserRepository();
    requestRepository = new MockRequestRepository();
    profileRepository = new MockStoreManagerProfileRepository();
    passwordHasher = new MockPasswordHasher();
    useCase = new RegisterStoreManagerUseCase(
      userRepository,
      requestRepository,
      profileRepository,
      passwordHasher,
      clock
    );
  });

  describe('execute with admin check', () => {
    it('should allow store manager registration when admin exists', async () => {
      // Create an admin user first
      const admin = new User({
        email: 'admin@store.com',
        password: 'admin123',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const userData = {
        email: 'manager@store.com',
        name: 'Store Manager',
        password: 'manager123',
        phone: '1234567890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('store_manager');
      expect(result.profile.isApproved).toBe(false);
      expect(result.request.type).toBe('account_register_request');
    });

    it('should allow store manager registration when admin and other users exist', async () => {
      // Create an admin user first
      const admin = new User({
        email: 'admin@store.com',
        password: 'admin123',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      // Create other users
      const customer = new User({
        email: 'customer@store.com',
        password: 'customer123',
        role: 'customer'
      }, clock);
      await userRepository.create(customer);

      const userData = {
        email: 'manager@store.com',
        name: 'Store Manager',
        password: 'manager123',
        phone: '1234567890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('store_manager');
    });
  });
});
