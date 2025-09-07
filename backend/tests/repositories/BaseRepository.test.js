import { BaseRepository } from '../../src/repositories/BaseRepository.js';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces/IDatabaseAdapter.js';

// Mock database adapter that extends IDatabaseAdapter
class MockDatabaseAdapter extends IDatabaseAdapter {
  constructor() {
    super();
    this.findById = jest.fn();
    this.findAll = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
    this.connect = jest.fn();
    this.disconnect = jest.fn();
    this.query = jest.fn();
    this.count = jest.fn();
  }
}

describe('BaseRepository - Data Access Layer', () => {
  let repository;
  let mockAdapter;

  beforeEach(() => {
    mockAdapter = new MockDatabaseAdapter();
    repository = new BaseRepository('test_collection', mockAdapter);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Basic CRUD Operations', () => {
    test('finds entity by ID successfully', async () => {
      const mockEntity = { id: 'entity1', name: 'Test Entity' };
      mockAdapter.findById.mockResolvedValue(mockEntity);

      const result = await repository.findById('entity1');

      expect(mockAdapter.findById).toHaveBeenCalledWith('test_collection', 'entity1');
      expect(result).toEqual(mockEntity);
    });

    test('handles entity not found by ID', async () => {
      mockAdapter.findById.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(mockAdapter.findById).toHaveBeenCalledWith('test_collection', 'nonexistent');
      expect(result).toBeNull();
    });

    test('creates entity successfully', async () => {
      const entityData = { name: 'New Entity' };
      const createdEntity = { id: 'entity1', ...entityData };
      mockAdapter.create.mockResolvedValue(createdEntity);

      const result = await repository.create(entityData);

      expect(mockAdapter.create).toHaveBeenCalledWith('test_collection', entityData);
      expect(result).toEqual(createdEntity);
    });
  });

  describe('Adapter Integration', () => {
    test('uses provided database adapter', () => {
      expect(repository.db).toBe(mockAdapter);
    });

    test('uses correct collection name', () => {
      expect(repository.collectionName).toBe('test_collection');
    });
  });
});
