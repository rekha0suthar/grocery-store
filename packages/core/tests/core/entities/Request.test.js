import { Request } from '../../../entities/Request.js';

// Test builders
const aRequest = (overrides = {}) => new Request({
  type: 'store_manager_approval',
  requestedBy: 'user-123',
  status: 'pending',
  requestData: { 
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    storeName: 'My Store',
    storeAddress: '123 Main St'
  },
  ...overrides
});

describe('Request Entity - Core Domain Rules', () => {
  describe('Creation and Validation', () => {
    test('creates valid request', () => {
      const request = aRequest();
      
      expect(request.isValid()).toBe(true);
      expect(request.type).toBe('store_manager_approval');
      expect(request.requestedBy).toBe('user-123');
      expect(request.status).toBe('pending');
    });

    test('rejects request with invalid type', () => {
      const request = aRequest({ type: 'invalid_type' });
      expect(request.isValid()).toBe(false);
    });

    test('rejects request without requester ID', () => {
      const request = aRequest({ requestedBy: null });
      expect(request.isValid()).toBe(false);
    });

    test('rejects request with invalid status', () => {
      const request = aRequest({ status: 'invalid_status' });
      expect(request.isValid()).toBe(false);
    });
  });

  describe('Request Types', () => {
    test('identifies store manager request', () => {
      const request = aRequest({ type: 'store_manager_approval' });
      expect(request.isStoreManagerApprovalRequest()).toBe(true);
      expect(request.isCategoryRequest()).toBe(false);
    });

    test('identifies category creation request', () => {
      const request = aRequest({ 
        type: 'category_creation',
        requestData: { name: 'New Category', description: 'A new category' }
      });
      expect(request.isCategoryRequest()).toBe(true);
      expect(request.isStoreManagerApprovalRequest()).toBe(false);
    });

    test('identifies category modification request', () => {
      const request = aRequest({ 
        type: 'category_modification',
        requestData: { name: 'Updated Category', description: 'An updated category' }
      });
      expect(request.isCategoryRequest()).toBe(true);
    });
  });

  describe('Status Management', () => {
    test('approves pending request', () => {
      const request = aRequest();
      
      const result = request.approve('admin-1', 'Approved for store management');
      expect(result).toBe(true);
      expect(request.status).toBe('approved');
      expect(request.reviewedBy).toBe('admin-1');
      expect(request.notes).toBe('Approved for store management');
      expect(request.reviewedAt).toBeInstanceOf(Date);
    });

    test('rejects pending request', () => {
      const request = aRequest();
      
      const result = request.reject('admin-1', 'Insufficient experience');
      expect(result).toBe(true);
      expect(request.status).toBe('rejected');
      expect(request.reviewedBy).toBe('admin-1');
      expect(request.rejectionReason).toBe('Insufficient experience');
      expect(request.reviewedAt).toBeInstanceOf(Date);
    });

    test('prevents illegal status transitions', () => {
      const request = aRequest();
      request.approve('admin-1', 'Approved');
      
      // Once approved, cannot be approved again
      const approveResult = request.approve('admin-2', 'Approved again');
      expect(approveResult).toBe(false);
      
      const rejectResult = request.reject('admin-2', 'Rejected');
      expect(rejectResult).toBe(false);
    });
  });

  describe('Status Queries', () => {
    test('checks status correctly', () => {
      const request = aRequest();
      
      expect(request.isPending()).toBe(true);
      expect(request.isApproved()).toBe(false);
      expect(request.isRejected()).toBe(false);
      
      request.approve('admin-1', 'Approved');
      expect(request.isPending()).toBe(false);
      expect(request.isApproved()).toBe(true);
      expect(request.isRejected()).toBe(false);
    });

    test('checks if request can be reviewed', () => {
      const request = aRequest();
      expect(request.canBeReviewed()).toBe(true);
      
      request.approve('admin-1', 'Approved');
      expect(request.canBeReviewed()).toBe(false);
    });
  });

  describe('Request Data Management', () => {
    test('validates request data', () => {
      const request = aRequest({ requestData: { 
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      } });
      expect(request.isValid()).toBe(true);
    });

    test('rejects invalid request data', () => {
      const request = aRequest({ requestData: { name: 'John' } }); // Missing required fields
      expect(request.isValid()).toBe(false);
    });

    test('updates request data', () => {
      const request = aRequest();
      const newData = { 
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '987-654-3210',
        storeName: 'Jane Store',
        storeAddress: '456 Oak Ave'
      };
      
      request.setRequestData(newData);
      expect(request.requestData).toEqual(newData);
    });
  });

  describe('Priority Management', () => {
    test('sets priority correctly', () => {
      const request = aRequest();
      
      request.setPriority('high');
      expect(request.priority).toBe('high');
      expect(request.isHighPriority()).toBe(true);
    });

    test('adds notes', () => {
      const request = aRequest();
      
      request.addNote('First note');
      expect(request.notes).toBe('First note');
      
      request.addNote('Second note');
      expect(request.notes).toBe('First note\nSecond note');
    });
  });

  describe('JSON Serialization', () => {
    test('serializes request correctly', () => {
      const request = aRequest();
      
      const json = request.toJSON();
      expect(json.type).toBe('store_manager_approval');
      expect(json.requestedBy).toBe('user-123');
      expect(json.status).toBe('pending');
      expect(json.requestData).toEqual({ 
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      });
    });

    test('deserializes request correctly', () => {
      const requestData = {
        type: 'category_creation',
        requestedBy: 'user-456',
        status: 'approved',
        requestData: { name: 'New Category', description: 'A new category' }
      };
      
      const request = Request.fromJSON(requestData);
      expect(request.type).toBe('category_creation');
      expect(request.requestedBy).toBe('user-456');
      expect(request.status).toBe('approved');
      expect(request.requestData).toEqual({ name: 'New Category', description: 'A new category' });
    });
  });

  describe('Static Factory Methods', () => {
    test('creates store manager approval request', () => {
      const request = Request.createStoreManagerApprovalRequest('user-123', {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        storeName: 'My Store',
        storeAddress: '123 Main St'
      });
      
      expect(request.type).toBe('store_manager_approval');
      expect(request.requestedBy).toBe('user-123');
      expect(request.isStoreManagerApprovalRequest()).toBe(true);
    });

    test('creates category creation request', () => {
      const request = Request.createCategoryCreationRequest('user-456', {
        name: 'New Category',
        description: 'A new category'
      });
      
      expect(request.type).toBe('category_creation');
      expect(request.requestedBy).toBe('user-456');
      expect(request.isCategoryRequest()).toBe(true);
    });
  });
});
