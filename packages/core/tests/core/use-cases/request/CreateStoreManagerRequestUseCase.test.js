import { CreateStoreManagerRequestUseCase } from '../../../../use-cases/request/CreateStoreManagerRequestUseCase';
import { Request } from '../../../../entities/Request';

describe('CreateStoreManagerRequestUseCase - Application Policy', () => {
  let useCase;
  let mockRequestRepository;
  let mockUserRepository;

  beforeEach(() => {
    // Mock repository
    mockRequestRepository = {
      findByUserAndType: jest.fn(),
      create: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn(),
      findById: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new CreateStoreManagerRequestUseCase({ requestRepo: mockRequestRepository, userRepo: mockUserRepository });
    // useCase.requestRepository = mockRequestRepository;
  });

  describe('Input Validation', () => {
    test('rejects missing user ID', async () => {
      const result = await useCase.execute(null, {
        storeName: 'Test Store',
        storeAddress: '123 Main St',
        businessLicense: 'LIC123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('User ID is required');
      expect(result.request).toBeInstanceOf(Request);
    });

    test('rejects missing request data', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'user1', name: 'Test User' });
      const result = await useCase.execute('user1', null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Store name is required');
      expect(result.request).toBeInstanceOf(Request);
    });

    test('rejects missing store name', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'user1', name: 'Test User' });
      const result = await useCase.execute('user1', {
        storeAddress: '123 Main St',
        businessLicense: 'LIC123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Store name is required');
      expect(result.request).toBeInstanceOf(Request);
    });

    test('rejects missing store address', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'user1', name: 'Test User' });
      const result = await useCase.execute('user1', {
        storeName: 'Test Store',
        businessLicense: 'LIC123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Store address is required');
      expect(result.request).toBeInstanceOf(Request);
    });

    test('rejects missing business license', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: 'user1', name: 'Test User' });
      const result = await useCase.execute('user1', {
        storeName: 'Test Store',
        storeAddress: '123 Main St'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Business license is required');
      expect(result.request).toBeInstanceOf(Request);
    });
  });

  describe('Request Creation', () => {
    test('creates store manager request successfully', async () => {
      const requestData = {
        storeName: 'Test Store',
        storeAddress: '123 Main St, Anytown, CA 12345',
        businessLicense: 'LIC123456',
        phoneNumber: '+1234567890',
        email: 'store@example.com'
      };

      const createdRequestData = {
        id: 'req1',
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: 'user1',
        requestData: requestData,
        priority: 'normal',
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findById.mockResolvedValue({ id: 'user1', name: 'Test User' });
      mockRequestRepository.findByUserAndType.mockResolvedValue(null);
      mockRequestRepository.create.mockResolvedValue(createdRequestData);

      const result = await useCase.execute('user1', requestData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Store manager request submitted successfully');
      expect(result.request).toBeInstanceOf(Request);
      expect(result.request.type).toBe('store_manager_approval');
      expect(result.request.status).toBe('pending');
      expect(result.request.requestedBy).toBe('user1');
      expect(result.request.requestData).toEqual(requestData);
      expect(result.request.isStoreManagerApprovalRequest()).toBe(true);

      expect(mockRequestRepository.create).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      const requestData = {
        storeName: 'Test Store',
        storeAddress: '123 Main St',
        businessLicense: 'LIC123'
      };

      mockUserRepository.findById.mockResolvedValue({ id: 'user1', name: 'Test User' });
      mockRequestRepository.create.mockRejectedValue(new Error('Database connection failed'));

      const result = await useCase.execute('user1', requestData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to submit store manager request');
      expect(result.request).toBeInstanceOf(Request);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('Business Rules Integration', () => {
    test('creates valid request entity', async () => {
      const requestData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        storeName: "Test Store",
        storeAddress: "123 Main St",
        businessLicense: "LIC123"
      };

      const createdRequestData = {
        id: 'req1',
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: 'user1',
        requestData: requestData,
        priority: 'normal',
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.findById.mockResolvedValue({ id: 'user1', name: 'Test User', email: 'test@example.com', phone: '123-456-7890' });
      mockRequestRepository.findByUserAndType.mockResolvedValue(null);
      mockRequestRepository.create.mockResolvedValue(createdRequestData);

      const result = await useCase.execute('user1', requestData);

      expect(result.success).toBe(true);
      expect(result.request).toBeInstanceOf(Request);
      expect(result.request.isValid()).toBe(true);
      expect(result.request.isPending()).toBe(true);
      expect(result.request.isStoreManagerApprovalRequest()).toBe(true);
    });
  });
});
