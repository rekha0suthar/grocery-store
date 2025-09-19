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

describe('RegisterStoreManagerUseCase', () => {
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

  describe('execute', () => {
    it('should successfully register a store manager when admin exists', async () => {
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
      expect(result.user).toBeInstanceOf(User);
      expect(result.user.role).toBe('store_manager');
      expect(result.user.email).toBe('manager@store.com');
    });

    it('should reject registration with invalid data', async () => {
      // Create an admin user first
      const admin = new User({
        email: 'admin@store.com',
        password: 'admin123',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const userData = {
        email: 'invalid-email',
        name: '',
        password: '123'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email and name are required');
    });

    it('should reject registration if user already exists', async () => {
      // Create an admin user first
      const admin = new User({
        email: 'admin@store.com',
        password: 'admin123',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      // Create existing user
      const existingUser = new User({
        email: 'manager@store.com',
        password: 'manager123',
        role: 'customer'
      }, clock);
      await userRepository.create(existingUser);

      const userData = {
        email: 'manager@store.com',
        name: 'Store Manager',
        password: 'manager123',
        phone: '1234567890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      };

      const result = await useCase.execute(userData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('A user with this email already exists');
    });

    it('should create unapproved store manager profile', async () => {
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

      expect(result.profile.isApproved).toBe(false);
      expect(result.profile.storeName).toBe('My Store');
      expect(result.profile.storeAddress).toBe('123 Main St');
    });
  });
});
