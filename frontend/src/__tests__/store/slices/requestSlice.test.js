import requestSlice, { 
  fetchRequests, 
  
  createStoreManagerRequest,
  createCategoryRequest,
  approveRequest,
  rejectRequest,
  fetchMyRequests,
  clearError,
  clearCurrentRequest
} from '../../../store/slices/requestSlice.js';

describe('requestSlice', () => {
  const initialState = {
    requests: [],
    myRequests: [],
    currentRequest: null,
    loading: false,
    createLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  };

  it('should return the initial state', () => {
    expect(requestSlice(undefined, {})).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const action = clearError();
    const newState = requestSlice(stateWithError, action);
    expect(newState.error).toBeNull();
  });

  it('should handle clearCurrentRequest', () => {
    const stateWithRequest = { 
      ...initialState, 
      currentRequest: { id: '1', type: 'store_manager' } 
    };
    const action = clearCurrentRequest();
    const newState = requestSlice(stateWithRequest, action);
    expect(newState.currentRequest).toBeNull();
  });

  it('should handle fetchRequests.pending', () => {
    const action = fetchRequests.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchRequests.fulfilled', () => {
    const mockRequests = [{ id: '1', type: 'store_manager' }];
    const mockPagination = { page: 1, total: 1, pages: 1 };
    const action = fetchRequests.fulfilled({ requests: mockRequests, pagination: mockPagination }, 'requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.requests).toEqual(mockRequests);
    expect(newState.pagination).toEqual(mockPagination);
    expect(newState.loading).toBe(false);
  });

  it('should handle fetchRequests.rejected', () => {
    const errorMessage = 'Failed to fetch requests';
    const action = fetchRequests.rejected(new Error(errorMessage), 'requestId', undefined, errorMessage);
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle createStoreManagerRequest.pending', () => {
    const action = createStoreManagerRequest.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.createLoading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle createStoreManagerRequest.fulfilled', () => {
    const mockRequest = { id: '1', type: 'store_manager' };
    const action = createStoreManagerRequest.fulfilled(mockRequest, 'requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.createLoading).toBe(false);
    expect(newState.requests).toContain(mockRequest);
  });

  it('should handle createStoreManagerRequest.rejected', () => {
    const errorMessage = 'Failed to create request';
    const action = createStoreManagerRequest.rejected(new Error(errorMessage), 'requestId', undefined, errorMessage);
    const newState = requestSlice(initialState, action);
    expect(newState.createLoading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle createCategoryRequest.pending', () => {
    const action = createCategoryRequest.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.createLoading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle createCategoryRequest.fulfilled', () => {
    const mockRequest = { id: '1', type: 'category_add_request' };
    const action = createCategoryRequest.fulfilled(mockRequest, 'requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.createLoading).toBe(false);
    expect(newState.requests).toContain(mockRequest);
  });

  it('should handle createCategoryRequest.rejected', () => {
    const errorMessage = 'Failed to create request';
    const action = createCategoryRequest.rejected(new Error(errorMessage), 'requestId', undefined, errorMessage);
    const newState = requestSlice(initialState, action);
    expect(newState.createLoading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle approveRequest.pending', () => {
    const action = approveRequest.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle approveRequest.fulfilled', () => {
    const stateWithRequest = {
      ...initialState,
      requests: [{ id: '1', type: 'store_manager', status: 'pending' }]
    };
    const approvedRequest = { id: '1', type: 'store_manager', status: 'approved' };
    const action = approveRequest.fulfilled(approvedRequest, 'requestId');
    const newState = requestSlice(stateWithRequest, action);
    expect(newState.loading).toBe(false);
    expect(newState.requests[0]).toEqual(approvedRequest);
  });

  it('should handle approveRequest.rejected', () => {
    const errorMessage = 'Failed to approve request';
    const action = approveRequest.rejected(new Error(errorMessage), 'requestId', undefined, errorMessage);
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle rejectRequest.pending', () => {
    const action = rejectRequest.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle rejectRequest.fulfilled', () => {
    const stateWithRequest = {
      ...initialState,
      requests: [{ id: '1', type: 'store_manager', status: 'pending' }]
    };
    const rejectedRequest = { id: '1', type: 'store_manager', status: 'rejected' };
    const action = rejectRequest.fulfilled(rejectedRequest, 'requestId');
    const newState = requestSlice(stateWithRequest, action);
    expect(newState.loading).toBe(false);
    expect(newState.requests[0]).toEqual(rejectedRequest);
  });

  it('should handle rejectRequest.rejected', () => {
    const errorMessage = 'Failed to reject request';
    const action = rejectRequest.rejected(new Error(errorMessage), 'requestId', undefined, errorMessage);
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle fetchMyRequests.pending', () => {
    const action = fetchMyRequests.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchMyRequests.fulfilled', () => {
    const mockRequests = [{ id: '1', type: 'category_add_request' }];
    const mockPagination = { page: 1, total: 1, pages: 1 };
    const action = fetchMyRequests.fulfilled({ requests: mockRequests, pagination: mockPagination }, 'requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.myRequests).toEqual(mockRequests);
    expect(newState.pagination).toEqual(mockPagination);
    expect(newState.loading).toBe(false);
  });

  it('should handle fetchMyRequests.rejected', () => {
    const errorMessage = 'Failed to fetch my requests';
    const action = fetchMyRequests.rejected(new Error(errorMessage), 'requestId', undefined, errorMessage);
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });
});