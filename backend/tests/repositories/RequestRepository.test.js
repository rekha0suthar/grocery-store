import { RequestRepository } from '../../src/repositories/RequestRepository.js';
import { Request } from '@grocery-store/core/entities';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces';

describe('RequestRepository - Data Access Layer', () => {
  let requestRepository;
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

    // Create repository with mock adapter
    requestRepository = new RequestRepository(mockDatabaseAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic CRUD Operations', () => {
    test('finds request by ID successfully', async () => {
      const mockRequestData = {
        id: 'req1',
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Test St'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findById.mockResolvedValue(mockRequestData);

      const result = await requestRepository.findById('req1');

      expect(mockDatabaseAdapter.findById).toHaveBeenCalledWith('requests', 'req1');
      expect(result).toBeInstanceOf(Request);
      expect(result.id).toBe('req1');
      expect(result.type).toBe('account_register_request');
    });

    test('creates request successfully', async () => {
      const requestData = {
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Test St'
        }
      };

      const createdRequestData = { id: 'req1', ...requestData };
      mockDatabaseAdapter.create.mockResolvedValue(createdRequestData);

      const result = await requestRepository.create(requestData);

      expect(mockDatabaseAdapter.create).toHaveBeenCalledWith('requests', expect.any(Object));
      expect(result).toBeInstanceOf(Request);
      expect(result.type).toBe('account_register_request');
    });

    test('updates request successfully', async () => {
      const updateData = { status: 'approved', reviewedBy: 'admin1' };
      const updatedRequestData = { id: 'req1', ...updateData };
      
      mockDatabaseAdapter.update.mockResolvedValue(updatedRequestData);

      const result = await requestRepository.update('req1', updateData);

      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('requests', 'req1', updateData);
      expect(result).toBeInstanceOf(Request);
      expect(result.status).toBe('approved');
    });
  });

  describe('Request-Specific Methods', () => {
    test('finds requests by user and type', async () => {
      const mockRequestData = {
        id: 'req1',
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1'
      };

      mockDatabaseAdapter.findByField.mockResolvedValue(mockRequestData);

      const result = await requestRepository.findByUserAndType('user1', 'account_register_request');

      expect(mockDatabaseAdapter.findByField).toHaveBeenCalledWith('requests', 'requestedBy', 'user1');
      expect(result).toBeInstanceOf(Request);
      expect(result.type).toBe('account_register_request');
    });

    test('finds requests by type', async () => {
      const mockRequests = [
        { id: 'req1', type: 'account_register_request' },
        { id: 'req2', type: 'account_register_request' }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockRequests);

      const result = await requestRepository.findByType('account_register_request');

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('requests', { type: 'account_register_request' }, 100, 0);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Request);
    });

    test('finds requests by status', async () => {
      const mockRequests = [
        { id: 'req1', status: 'pending' },
        { id: 'req2', status: 'pending' }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockRequests);

      const result = await requestRepository.findByStatus('pending');

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('requests', { status: 'pending' }, 100, 0);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Request);
    });

    test('finds pending requests', async () => {
      const mockRequests = [
        { id: 'req1', status: 'pending' },
        { id: 'req2', status: 'pending' }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockRequests);

      const result = await requestRepository.findPending();

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('requests', { status: 'pending' }, 100, 0);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Request);
    });

    test('counts requests by type', async () => {
      mockDatabaseAdapter.count.mockResolvedValue(5);

      const result = await requestRepository.countByType('account_register_request');

      expect(mockDatabaseAdapter.count).toHaveBeenCalledWith('requests', { type: 'account_register_request' });
      expect(result).toBe(5);
    });

    test('counts requests by status', async () => {
      mockDatabaseAdapter.count.mockResolvedValue(3);

      const result = await requestRepository.countByStatus('pending');

      expect(mockDatabaseAdapter.count).toHaveBeenCalledWith('requests', { status: 'pending' });
      expect(result).toBe(3);
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      mockDatabaseAdapter.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(requestRepository.findById('req1')).rejects.toThrow('Database connection failed');
    });

    test('handles creation errors', async () => {
      mockDatabaseAdapter.create.mockRejectedValue(new Error('Creation failed'));

      await expect(requestRepository.create({})).rejects.toThrow('Creation failed');
    });
  });

  describe('Adapter Integration', () => {
    test('uses provided database adapter', () => {
      expect(requestRepository.databaseAdapter).toBe(mockDatabaseAdapter);
    });

    test('uses correct collection name', () => {
      expect(requestRepository.collectionName).toBe('requests');
    });
  });
});
