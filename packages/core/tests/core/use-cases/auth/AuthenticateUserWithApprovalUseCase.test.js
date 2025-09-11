import { AuthenticateUserWithApprovalUseCase } from '../../../../use-cases/auth/AuthenticateUserWithApprovalUseCase.js';
import { User } from '../../../../entities/User.js';
import { StoreManagerProfile } from '../../../../entities/StoreManagerProfile.js';
import { FakeClock } from '../../../utils/FakeClock.js';

class MockUserRepository {
  constructor() {
    this.users = [];
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

class MockStoreManagerProfileRepository {
  constructor() {
    this.profiles = [];
  }

  async findByUserId(userId) {
    return this.profiles.find(profile => profile.userId === userId) || null;
  }

  async create(profileData) {
    const profile = new StoreManagerProfile(profileData);
    this.profiles.push(profile);
    return profile;
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
  async compare(password, hashedPassword) {
    return password === hashedPassword;
  }
}

describe('AuthenticateUserWithApprovalUseCase', () => {
  let useCase;
  let userRepository;
  let profileRepository;
  let passwordHasher;
  let clock;

  beforeEach(() => {
    clock = new FakeClock();
    userRepository = new MockUserRepository();
    profileRepository = new MockStoreManagerProfileRepository();
    passwordHasher = new MockPasswordHasher();
    useCase = new AuthenticateUserWithApprovalUseCase(
      userRepository, 
      profileRepository, 
      passwordHasher, 
      clock
    );
  });

  describe('execute', () => {
    it('should allow admin login', async () => {
      const admin = new User({
        email: 'admin@store.com',
        password: 'admin123',
        role: 'admin'
      }, clock);
      await userRepository.create(admin);

      const result = await useCase.execute('admin@store.com', 'admin123');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('admin');
      expect(result.profile).toBeNull();
    });

    it('should allow customer login', async () => {
      const customer = new User({
        email: 'customer@store.com',
        password: 'customer123',
        role: 'customer'
      }, clock);
      await userRepository.create(customer);

      const result = await useCase.execute('customer@store.com', 'customer123');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('customer');
      expect(result.profile).toBeNull();
    });

    it('should allow approved store manager login', async () => {
      const storeManager = new User({
        email: 'manager@store.com',
        password: 'manager123',
        role: 'store_manager'
      }, clock);
      await userRepository.create(storeManager);

      const profile = new StoreManagerProfile({
        userId: storeManager.id,
        isApproved: true
      }, clock);
      await profileRepository.create(profile);

      const result = await useCase.execute('manager@store.com', 'manager123');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('store_manager');
      expect(result.profile.isApproved).toBe(true);
    });

    it('should reject unapproved store manager login', async () => {
      const storeManager = new User({
        email: 'manager@store.com',
        password: 'manager123',
        role: 'store_manager'
      }, clock);
      await userRepository.create(storeManager);

      const profile = new StoreManagerProfile({
        userId: storeManager.id,
        isApproved: false
      }, clock);
      await profileRepository.create(profile);

      const result = await useCase.execute('manager@store.com', 'manager123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('pending approval');
    });

    it('should reject store manager login without profile', async () => {
      const storeManager = new User({
        email: 'manager@store.com',
        password: 'manager123',
        role: 'store_manager'
      }, clock);
      await userRepository.create(storeManager);

      const result = await useCase.execute('manager@store.com', 'manager123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('profile not found');
    });

    it('should reject login with invalid credentials', async () => {
      const user = new User({
        email: 'user@store.com',
        password: 'correct123',
        role: 'customer'
      }, clock);
      await userRepository.create(user);

      const result = await useCase.execute('user@store.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email or password');
    });

    it('should reject login for non-existent user', async () => {
      const result = await useCase.execute('nonexistent@store.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email or password');
    });

    it('should lock account after multiple failed attempts', async () => {
      const user = new User({
        email: 'user@store.com',
        password: 'correct123',
        role: 'customer'
      }, clock);
      await userRepository.create(user);

      for (let i = 0; i < 5; i++) {
        const result = await useCase.execute('user@store.com', 'wrongpassword');
        expect(result.success).toBe(false);
      }

      const lockedUser = await userRepository.findByEmail('user@store.com');
      expect(lockedUser.loginAttempts).toBe(5);
      expect(lockedUser.lockedUntil).toBeTruthy();

      const result = await useCase.execute('user@store.com', 'correct123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('locked');
    });
  });
});
