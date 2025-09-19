import { ApproveRequestUseCase } from '../../../../use-cases/request/ApproveRequestUseCase';
import { Request } from '../../../../entities/Request';
import { StoreManagerProfile } from '../../../../entities/StoreManagerProfile';

describe('ApproveRequestUseCase - Application Policy', () => {
  let useCase;
  let mockRequestRepository;
  let mockUserRepository;
  let mockCategoryRepository;
  let mockStoreManagerProfileRepository;

  beforeEach(() => {
    // Mock repositories
    mockRequestRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    mockCategoryRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockStoreManagerProfileRepository = {
      findByUserId: jest.fn(),
      update: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new ApproveRequestUseCase({ 
      requestRepo: mockRequestRepository, 
      userRepo: mockUserRepository, 
      categoryRepo: mockCategoryRepository,
      storeManagerProfileRepo: mockStoreManagerProfileRepository
    });
  });

  describe('Input Validation', () => {
    test('rejects missing request ID', async () => {
      const result = await useCase.execute(null, 'admin1', 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
      expect(result.request).toBeNull();
    });

    test('rejects missing reviewer ID', async () => {
      const result = await useCase.execute('req1', null, 'admin', 'approve');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
      expect(result.request).toBeNull();
    });

    test('rejects missing reviewer role', async () => {
      const result = await useCase.execute('req1', 'admin1', null, 'approve');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to approve request');
      expect(result.request).toBeNull();
    });
  });

  describe('Authorization', () => {
    test('rejects when user is not authorized to approve requests', async () => {
      const result = await useCase.execute('req1', 'user1', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to approve request');
      expect(result.request).toBeNull();
    });

    test('allows admin to approve requests', async () => {
      const request = new Request({
        id: 'req1',
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1',
        requestData: { name: 'Test User', email: 'test@example.com' }
      });

      const updatedRequestData = {
        id: 'req1',
        type: 'account_register_request',
        status: 'approved',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      const user = {
        id: 'user1',
        email: 'test@example.com',
        role: 'store_manager'
      };

      const profile = new StoreManagerProfile({
        id: 'profile1',
        userId: 'user1',
        isApproved: false
      });

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);
      mockUserRepository.findById.mockResolvedValue(user);
      mockStoreManagerProfileRepository.findByUserId.mockResolvedValue(profile);
      mockStoreManagerProfileRepository.update.mockResolvedValue({ ...profile, isApproved: true });

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Request approved successfully');
      expect(result.request).toBeDefined();
      expect(result.request.status).toBe('approved');
      expect(result.request.reviewedBy).toBe('admin1');
    });
  });

  describe('Request Lookup', () => {
    test('rejects when request not found', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
      expect(result.request).toBeNull();
    });
  });

  describe('Request Approval', () => {
    test('approves pending request successfully', async () => {
      const request = new Request({
        id: 'req1',
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1',
        requestData: { name: 'Test User', email: 'test@example.com' }
      });

      const updatedRequestData = {
        id: 'req1',
        type: 'account_register_request',
        status: 'approved',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      const user = {
        id: 'user1',
        email: 'test@example.com',
        role: 'store_manager'
      };

      const profile = new StoreManagerProfile({
        id: 'profile1',
        userId: 'user1',
        isApproved: false
      });

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);
      mockUserRepository.findById.mockResolvedValue(user);
      mockStoreManagerProfileRepository.findByUserId.mockResolvedValue(profile);
      mockStoreManagerProfileRepository.update.mockResolvedValue({ ...profile, isApproved: true });

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Request approved successfully');
      expect(result.request).toBeDefined();
      expect(result.request.status).toBe('approved');
      expect(result.request.reviewedBy).toBe('admin1');
    });

    test('rejects already approved request', async () => {
      const request = new Request({
        id: 'req1',
        type: 'account_register_request',
        status: 'approved',
        requestedBy: 'user1'
      });

      mockRequestRepository.findById.mockResolvedValue(request);

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request cannot be reviewed in current status');
      expect(result.request).toBeNull();
    });

    test('rejects already rejected request', async () => {
      const request = new Request({
        id: 'req1',
        type: 'account_register_request',
        status: 'rejected',
        requestedBy: 'user1'
      });

      mockRequestRepository.findById.mockResolvedValue(request);

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request cannot be reviewed in current status');
      expect(result.request).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      mockRequestRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to process request');
      expect(result.request).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });

    test('handles update errors gracefully', async () => {
      const request = new Request({
        id: 'req1',
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1'
      });

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockRejectedValue(new Error('Failed to update request'));

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to process request');
      expect(result.request).toBeNull();
      expect(result.error).toBe('Failed to update request');
    });
  });

  describe('Business Rules Integration', () => {
    test('uses request entity business rules for approval', async () => {
      const request = new Request({
        id: 'req1',
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1'
      });

      const updatedRequestData = {
        id: 'req1',
        type: 'account_register_request',
        status: 'approved',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      const user = {
        id: 'user1',
        email: 'test@example.com',
        role: 'store_manager'
      };

      const profile = new StoreManagerProfile({
        id: 'profile1',
        userId: 'user1',
        isApproved: false
      });

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);
      mockUserRepository.findById.mockResolvedValue(user);
      mockStoreManagerProfileRepository.findByUserId.mockResolvedValue(profile);
      mockStoreManagerProfileRepository.update.mockResolvedValue({ ...profile, isApproved: true });

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(result.request).toBeDefined();
      expect(result.request.status).toBe('approved');
    });

    test('creates valid request entity after approval', async () => {
      const request = new Request({
        id: 'req1',
        type: 'account_register_request',
        status: 'pending',
        requestedBy: 'user1'
      });

      const updatedRequestData = {
        id: 'req1',
        type: 'account_register_request',
        status: 'approved',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      const user = {
        id: 'user1',
        email: 'test@example.com',
        role: 'store_manager'
      };

      const profile = new StoreManagerProfile({
        id: 'profile1',
        userId: 'user1',
        isApproved: false
      });

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);
      mockUserRepository.findById.mockResolvedValue(user);
      mockStoreManagerProfileRepository.findByUserId.mockResolvedValue(profile);
      mockStoreManagerProfileRepository.update.mockResolvedValue({ ...profile, isApproved: true });

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(result.request).toBeDefined();
      expect(result.request.status).toBe('approved');
    });
  });

  describe('Category Update Request Approval', () => {
    test('approves category update request and calls modifyCategory', async () => {
      const request = new Request({
        id: 'req1',
        type: 'category_update_request',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          id: 'cat1',
          name: 'Updated Category Name',
          description: 'Updated description',
          originalCategory: { id: 'cat1', name: 'Original Name' }
        }
      });

      const updatedRequestData = {
        id: 'req1',
        type: 'category_update_request',
        status: 'approved',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);
      mockCategoryRepository.update.mockResolvedValue({ id: 'cat1', name: 'Updated Category Name' });

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith('cat1', {
        id: 'cat1',
        name: 'Updated Category Name',
        description: 'Updated description'
      });
    });

    test('approves category delete request and calls deleteCategory', async () => {
      const request = new Request({
        id: 'req2',
        type: 'category_delete_request',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          id: 'cat2',
          originalCategory: { id: 'cat2', name: 'Category to Delete' }
        }
      });

      const updatedRequestData = {
        id: 'req2',
        type: 'category_delete_request',
        status: 'approved',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);
      mockCategoryRepository.delete.mockResolvedValue(true);

      const result = await useCase.execute('req2', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('cat2');
    });
  });
});
