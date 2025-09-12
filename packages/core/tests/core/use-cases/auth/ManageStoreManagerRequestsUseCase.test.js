import { ManageStoreManagerRequestsUseCase } from '../../../../use-cases/auth/ManageStoreManagerRequestsUseCase';
import { User } from '../../../../entities/User';
import { Request } from '../../../../entities/Request';
import { StoreManagerProfile } from '../../../../entities/StoreManagerProfile';

describe('ManageStoreManagerRequestsUseCase', () => {
  let useCase;
  let mockUserRepository;
  let mockRequestRepository;
  let mockStoreManagerProfileRepository;
  let mockClock;

  beforeEach(() => {
    // Mock repositories
    mockUserRepository = {
      findById: jest.fn(),
      findAll: jest.fn()
    };

    mockRequestRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn()
    };

    mockStoreManagerProfileRepository = {
      findByUserId: jest.fn(),
      update: jest.fn()
    };

    mockClock = {
      now: jest.fn(() => new Date('2023-01-01T00:00:00.000Z'))
    };

    // Create use case with mocked dependencies
    useCase = new ManageStoreManagerRequestsUseCase(
      mockUserRepository,
      mockRequestRepository,
      mockStoreManagerProfileRepository,
      mockClock
    );
  });

  describe('Constructor', () => {
    test('should initialize with repositories and policy', () => {
      expect(useCase.userRepository).toBe(mockUserRepository);
      expect(useCase.requestRepository).toBe(mockRequestRepository);
      expect(useCase.storeManagerProfileRepository).toBe(mockStoreManagerProfileRepository);
      expect(useCase.policy).toBeDefined();
    });
  });

  describe('getPendingRequests', () => {
    const mockAdmin = new User({
      id: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true
    });

    const mockRequests = [
      new Request({
        id: 'req1',
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: 'user1',
        requestedAt: '2023-01-01T00:00:00.000Z'
      }),
      new Request({
        id: 'req2',
        type: 'store_manager_approval',
        status: 'approved',
        requestedBy: 'user2',
        requestedAt: '2023-01-01T00:00:00.000Z'
      })
    ];

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockAdmin);
      mockRequestRepository.findAll.mockResolvedValue(mockRequests);
    });

    test('should return pending requests for admin', async () => {
      const result = await useCase.getPendingRequests('admin1');

      expect(result.success).toBe(true);
      expect(result.requests).toHaveLength(1);
      expect(result.requests[0].id).toBe('req1');
      expect(result.message).toBe('Found 1 pending store manager requests');
    });

    test('should return empty array when no pending requests', async () => {
      mockRequestRepository.findAll.mockResolvedValue([]);

      const result = await useCase.getPendingRequests('admin1');

      expect(result.success).toBe(true);
      expect(result.requests).toHaveLength(0);
      expect(result.message).toBe('Found 0 pending store manager requests');
    });

    test('should fail when admin not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await useCase.getPendingRequests('admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Admin user not found');
    });

    test('should fail when admin cannot view requests', async () => {
      const nonAdmin = new User({
        id: 'user1',
        email: 'user@example.com',
        role: 'customer',
        isActive: true
      });
      mockUserRepository.findById.mockResolvedValue(nonAdmin);

      const result = await useCase.getPendingRequests('user1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only administrators can view store manager requests');
    });

    test('should handle repository errors', async () => {
      mockRequestRepository.findAll.mockRejectedValue(new Error('Database error'));

      const result = await useCase.getPendingRequests('admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve pending requests');
    });
  });

  describe('approveRequest', () => {
    const mockAdmin = new User({
      id: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true
    });

    const mockRequest = new Request({
      id: 'req1',
      type: 'store_manager_approval',
      status: 'pending',
      requestedBy: 'user1',
      requestedAt: '2023-01-01T00:00:00.000Z'
    });

    const mockProfile = new StoreManagerProfile({
      id: 'profile1',
      userId: 'user1',
      status: 'pending',
      businessName: 'Test Store',
      businessAddress: '123 Main St'
    });

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockAdmin);
      mockRequestRepository.findById.mockResolvedValue(mockRequest);
      mockStoreManagerProfileRepository.findByUserId.mockResolvedValue(mockProfile);
      mockRequestRepository.update.mockResolvedValue(true);
      mockStoreManagerProfileRepository.update.mockResolvedValue(true);
    });

    test('should approve request successfully', async () => {
      const result = await useCase.approveRequest('req1', 'admin1');

      expect(result.success).toBe(true);
      expect(mockRequestRepository.update).toHaveBeenCalled();
      expect(mockStoreManagerProfileRepository.update).toHaveBeenCalled();
    });

    test('should fail when admin not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await useCase.approveRequest('req1', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Admin user not found');
    });

    test('should fail when admin cannot approve requests', async () => {
      const nonAdmin = new User({
        id: 'user1',
        email: 'user@example.com',
        role: 'customer',
        isActive: true
      });
      mockUserRepository.findById.mockResolvedValue(nonAdmin);

      const result = await useCase.approveRequest('req1', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only administrators can approve store manager requests');
    });

    test('should fail when request not found', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);

      const result = await useCase.approveRequest('req1', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
    });

    test('should fail when profile not found', async () => {
      mockStoreManagerProfileRepository.findByUserId.mockResolvedValue(null);

      const result = await useCase.approveRequest('req1', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Store manager profile not found');
    });

    test('should handle repository errors', async () => {
      mockRequestRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await useCase.approveRequest('req1', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to approve request');
    });
  });

  describe('rejectRequest', () => {
    const mockAdmin = new User({
      id: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true
    });

    const mockRequest = new Request({
      id: 'req1',
      type: 'store_manager_approval',
      status: 'pending',
      requestedBy: 'user1',
      requestedAt: '2023-01-01T00:00:00.000Z'
    });

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockAdmin);
      mockRequestRepository.findById.mockResolvedValue(mockRequest);
      mockRequestRepository.update.mockResolvedValue(true);
    });

    test('should reject request successfully', async () => {
      const result = await useCase.rejectRequest('req1', 'admin1', 'Insufficient documentation');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Store manager request has been rejected');
      expect(mockRequestRepository.update).toHaveBeenCalled();
    });

    test('should fail when admin not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await useCase.rejectRequest('req1', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Admin user not found');
    });

    test('should fail when admin cannot approve requests', async () => {
      const nonAdmin = new User({
        id: 'user1',
        email: 'user@example.com',
        role: 'customer',
        isActive: true
      });
      mockUserRepository.findById.mockResolvedValue(nonAdmin);

      const result = await useCase.rejectRequest('req1', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Only administrators can approve store manager requests');
    });

    test('should fail when request not found', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);

      const result = await useCase.rejectRequest('req1', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
    });

    test('should handle repository errors', async () => {
      mockRequestRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await useCase.rejectRequest('req1', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to reject request');
    });
  });

  describe('getSystemStatus', () => {
    const mockAdmin = new User({
      id: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true
    });

    const mockUsers = [
      new User({
        id: 'user1',
        email: 'user1@example.com',
        role: 'customer',
        isActive: true
      }),
      new User({
        id: 'user2',
        email: 'user2@example.com',
        role: 'store_manager',
        isActive: true
      })
    ];

    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(mockAdmin);
      mockUserRepository.findAll.mockResolvedValue(mockUsers);
    });

    test('should return system status for admin', async () => {
      const result = await useCase.getSystemStatus('admin1');

      expect(result.success).toBe(true);
      expect(result.status).toBeDefined();
      expect(result.message).toBe('System status retrieved successfully');
    });

    test('should fail when admin not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await useCase.getSystemStatus('admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Admin user not found');
    });

    test('should fail when user is not admin', async () => {
      const nonAdmin = new User({
        id: 'user1',
        email: 'user@example.com',
        role: 'customer',
        isActive: true
      });
      mockUserRepository.findById.mockResolvedValue(nonAdmin);

      const result = await useCase.getSystemStatus('user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Only administrators can view system status');
    });

    test('should handle repository errors', async () => {
      mockUserRepository.findAll.mockRejectedValue(new Error('Database error'));

      const result = await useCase.getSystemStatus('admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve system status');
    });
  });
});
