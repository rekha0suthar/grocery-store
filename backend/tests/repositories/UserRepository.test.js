import { UserRepository } from '../../src/repositories/UserRepository.js';
import { User } from '@grocery-store/core/entities';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces';

describe('UserRepository - Data Access Layer', () => {
  let userRepository;
  let mockDatabaseAdapter;

  beforeEach(() => {
    // Create a mock that implements IDatabaseAdapter interface
    mockDatabaseAdapter = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findByField: jest.fn()
    };

    // Make it an instance of IDatabaseAdapter
    Object.setPrototypeOf(mockDatabaseAdapter, IDatabaseAdapter.prototype);

    userRepository = new UserRepository(mockDatabaseAdapter);
  });
  
  describe('Basic CRUD Operations', () => {
    test('finds user by ID successfully', async () => {
      const mockUserData = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findById.mockResolvedValue(mockUserData);

      const result = await userRepository.findById('user1');

      expect(mockDatabaseAdapter.findById).toHaveBeenCalledWith('users', 'user1');
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe('test@example.com');
    });

    test('creates user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        role: 'customer'
      };

      const createdData = {
        id: 'user1',
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.create.mockResolvedValue(createdData);

      const user = new User(userData);
      const result = await userRepository.create(user);

      expect(mockDatabaseAdapter.create).toHaveBeenCalledWith('users', user.toPersistence());
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('user1');
    });

    test('updates user successfully', async () => {
      const updateData = { name: 'Updated User' };
      const updatedData = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Updated User',
        role: 'customer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.update.mockResolvedValue(updatedData);

      const result = await userRepository.update('user1', updateData);

      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('users', 'user1', updateData);
      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe('Updated User');
    });

    test('deletes user successfully', async () => {
      mockDatabaseAdapter.delete.mockResolvedValue(true);

      const result = await userRepository.delete('user1');

      expect(mockDatabaseAdapter.delete).toHaveBeenCalledWith('users', 'user1');
      expect(result).toBe(true);
    });
  });

  describe('User-Specific Methods', () => {
    test('finds user by email', async () => {
      const mockUserData = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findByField.mockResolvedValue(mockUserData);

      const result = await userRepository.findByEmail('test@example.com');

      expect(mockDatabaseAdapter.findByField).toHaveBeenCalledWith('users', 'email', 'test@example.com');
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe('test@example.com');
    });

    test('finds users by role', async () => {
      const mockUsersData = [
        {
          id: 'user1',
          email: 'admin1@example.com',
          name: 'Admin User',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'user2',
          email: 'admin2@example.com',
          name: 'Another Admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockUsersData);

      const result = await userRepository.findByRole('admin');

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('users', { role: 'admin' }, 100, 0);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[1]).toBeInstanceOf(User);
      expect(result[0].role).toBe('admin');
    });

    test('finds active users', async () => {
      const mockUsersData = [
        {
          id: 'user1',
          email: 'active@example.com',
          name: 'Active User',
          role: 'customer',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockUsersData);

      const result = await userRepository.findActive();

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('users', { isActive: true }, 100, 0);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0].isActive).toBe(true);
    });

    test('updates last login time', async () => {
      const lastLoginTime = new Date();
      const updatedData = {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        isActive: true,
        lastLoginAt: lastLoginTime,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.update.mockResolvedValue(updatedData);

      const result = await userRepository.updateLastLogin('user1', lastLoginTime);

      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('users', 'user1', { lastLoginAt: lastLoginTime });
      expect(result).toBeInstanceOf(User);
      expect(result.lastLoginAt).toEqual(lastLoginTime);
    });

    test('counts users by role', async () => {
      mockDatabaseAdapter.count.mockResolvedValue(5);

      const result = await userRepository.countByRole('customer');

      expect(mockDatabaseAdapter.count).toHaveBeenCalledWith('users', { role: 'customer' });
      expect(result).toBe(5);
    });

    test('counts active users', async () => {
      mockDatabaseAdapter.count.mockResolvedValue(10);

      const result = await userRepository.countActive();

      expect(mockDatabaseAdapter.count).toHaveBeenCalledWith('users', { isActive: true });
      expect(result).toBe(10);
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      mockDatabaseAdapter.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(userRepository.findById('user1')).rejects.toThrow('Database connection failed');
    });

    test('handles creation errors', async () => {
      const user = new User({ email: 'test@example.com', name: 'Test User' });
      mockDatabaseAdapter.create.mockRejectedValue(new Error('Creation failed'));

      await expect(userRepository.create(user)).rejects.toThrow('Creation failed');
    });

    test('handles email not found', async () => {
      mockDatabaseAdapter.findByField.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('Adapter Integration', () => {
    test('uses provided database adapter', () => {
      expect(userRepository.databaseAdapter).toBe(mockDatabaseAdapter);
    });

    test('uses correct collection name', () => {
      expect(userRepository.collectionName).toBe('users');
    });
  });

  describe('Data Transformation', () => {
    test('transforms user data correctly for persistence', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        role: 'customer'
      };

      const createdData = {
        id: 'user1',
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.create.mockResolvedValue(createdData);

      const user = new User(userData);
      const result = await userRepository.create(user);

      // Verify that toPersistence() was called and contains the right data
      expect(mockDatabaseAdapter.create).toHaveBeenCalledWith('users', expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        role: 'customer'
      }));
      expect(result).toBeInstanceOf(User);
    });
  });
});
