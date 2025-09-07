import { ApproveRequestUseCase } from '../../../../use-cases/request/ApproveRequestUseCase';
import { Request } from '../../../../entities/Request';

describe('ApproveRequestUseCase - Application Policy', () => {
  let useCase;
  let mockRequestRepository;

  beforeEach(() => {
    // Mock repository
    mockRequestRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new ApproveRequestUseCase({ requestRepo: mockRequestRepository, userRepo: { findById: jest.fn(), update: jest.fn() }, categoryRepo: { findById: jest.fn(), create: jest.fn(), update: jest.fn() } });
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
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Main St',
          businessLicense: 'LIC123'
        }
      });

      const updatedRequestData = {
        ...request.toJSON(),
        status: 'approved',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Request approved successfully');
      expect(result.request).toBeInstanceOf(Request);
      expect(result.request.status).toBe('approved');
      expect(result.request.reviewedBy).toBe('admin1');
    });
  });

  describe('Request Lookup', () => {
    test('rejects when request not found', async () => {
      mockRequestRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('nonexistent', 'admin1', 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Request not found');
      expect(result.request).toBeNull();
      expect(mockRequestRepository.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('Request Approval', () => {
    test('approves pending request successfully', async () => {
      const request = new Request({
        id: 'req1',
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Main St',
          businessLicense: 'LIC123'
        }
      });

      const updatedRequestData = {
        ...request.toJSON(),
        status: 'approved',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Request approved successfully');
      expect(result.request).toBeInstanceOf(Request);
      expect(result.request.status).toBe('approved');
      expect(result.request.reviewedBy).toBe('admin1');
      expect(result.request.isApproved()).toBe(true);

      expect(mockRequestRepository.update).toHaveBeenCalled();
    });

    test('rejects already approved request', async () => {
      const request = new Request({
        id: 'req1',
        type: 'store_manager_approval',
        status: 'approved',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Main St',
          businessLicense: 'LIC123'
        }
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
        type: 'store_manager_approval',
        status: 'rejected',
        requestedBy: 'user1',
        reviewedBy: 'admin1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Main St',
          businessLicense: 'LIC123'
        }
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
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Main St',
          businessLicense: 'LIC123'
        }
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
        type: 'store_manager_approval',
        status: 'pending',
        requestedBy: 'user1',
        requestData: {
          storeName: 'Test Store',
          storeAddress: '123 Main St',
          businessLicense: 'LIC123'
        }
      });

      const updatedRequestData = {
        ...request.toJSON(),
        status: 'approved',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      // Spy on the entity method
      const approveSpy = jest.spyOn(Request.prototype, 'approve');

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);

      await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(approveSpy).toHaveBeenCalledWith('admin1');
      approveSpy.mockRestore();
    });

    test('creates valid request entity after approval', async () => {
      const request = new Request({
        id: 'req1',
        requestedBy: "user1",
        type: 'store_manager_approval',
        requestData: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          storeName: "Test Store",
          storeAddress: "123 Main St",
          businessLicense: "LIC123456"
        }
      });

      const updatedRequestData = {
        ...request.toJSON(),
        status: 'approved',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        updatedAt: new Date()
      };

      mockRequestRepository.findById.mockResolvedValue(request);
      mockRequestRepository.update.mockResolvedValue(updatedRequestData);

      const result = await useCase.execute('req1', 'admin1', 'admin', 'approve');

      expect(result.success).toBe(true);
      expect(result.request).toBeInstanceOf(Request);
      expect(result.request.isValid()).toBe(true);
      expect(result.request.isApproved()).toBe(true);
    });
  });
});
