import requestSlice, { 
  fetchRequests, 
  fetchRequestById, 
  createStoreManagerRequest,
  approveRequest,
  rejectRequest,
  clearError,
  clearCurrentRequest,
  setPagination
} from '../../../store/slices/requestSlice.js';

describe('requestSlice', () => {
  const initialState = {
    requests: [],
    currentRequest: null,
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
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

  it('should handle setPagination', () => {
    const paginationData = { page: 2, total: 50 };
    const action = setPagination(paginationData);
    const newState = requestSlice(initialState, action);
    expect(newState.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 50,
      totalPages: 0,
    });
  });

  it('should handle fetchRequests.pending', () => {
    const action = fetchRequests.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchRequests.fulfilled', () => {
    const requests = [
      { id: '1', type: 'store_manager', status: 'pending' },
      { id: '2', type: 'store_manager', status: 'approved' }
    ];
    const pagination = { page: 1, total: 2, totalPages: 1 };
    const payload = { requests, pagination };
    const action = fetchRequests.fulfilled(payload, 'requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.requests).toEqual(requests);
    expect(newState.pagination).toEqual(pagination);
  });

  it('should handle fetchRequests.rejected', () => {
    const errorMessage = 'Failed to fetch requests';
    const action = {
      type: fetchRequests.rejected.type,
      payload: errorMessage
    };
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle fetchRequestById.pending', () => {
    const action = fetchRequestById.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchRequestById.fulfilled', () => {
    const request = { id: '1', type: 'store_manager', status: 'pending' };
    const action = fetchRequestById.fulfilled(request, 'requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.currentRequest).toEqual(request);
  });

  it('should handle fetchRequestById.rejected', () => {
    const errorMessage = 'Failed to fetch request';
    const action = {
      type: fetchRequestById.rejected.type,
      payload: errorMessage
    };
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle createStoreManagerRequest.pending', () => {
    const action = createStoreManagerRequest.pending('requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle createStoreManagerRequest.fulfilled', () => {
    const newRequest = { id: '3', type: 'store_manager', status: 'pending' };
    const action = createStoreManagerRequest.fulfilled(newRequest, 'requestId');
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.requests).toContain(newRequest);
    expect(newState.requests[0]).toEqual(newRequest); // unshift adds to beginning
  });

  it('should handle createStoreManagerRequest.rejected', () => {
    const errorMessage = 'Failed to create request';
    const action = {
      type: createStoreManagerRequest.rejected.type,
      payload: errorMessage
    };
    const newState = requestSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle approveRequest.fulfilled', () => {
    const existingRequest = { id: '1', type: 'store_manager', status: 'pending' };
    const approvedRequest = { id: '1', type: 'store_manager', status: 'approved' };
    const stateWithRequest = { ...initialState, requests: [existingRequest] };
    const action = approveRequest.fulfilled(approvedRequest, 'requestId');
    const newState = requestSlice(stateWithRequest, action);
    expect(newState.requests[0]).toEqual(approvedRequest);
  });

  it('should update currentRequest when approving the current request', () => {
    const existingRequest = { id: '1', type: 'store_manager', status: 'pending' };
    const approvedRequest = { id: '1', type: 'store_manager', status: 'approved' };
    const stateWithRequest = { 
      ...initialState, 
      requests: [existingRequest],
      currentRequest: existingRequest
    };
    const action = approveRequest.fulfilled(approvedRequest, 'requestId');
    const newState = requestSlice(stateWithRequest, action);
    expect(newState.currentRequest).toEqual(approvedRequest);
  });

  it('should handle rejectRequest.fulfilled', () => {
    const existingRequest = { id: '1', type: 'store_manager', status: 'pending' };
    const rejectedRequest = { id: '1', type: 'store_manager', status: 'rejected' };
    const stateWithRequest = { ...initialState, requests: [existingRequest] };
    const action = rejectRequest.fulfilled(rejectedRequest, 'requestId');
    const newState = requestSlice(stateWithRequest, action);
    expect(newState.requests[0]).toEqual(rejectedRequest);
  });

  it('should update currentRequest when rejecting the current request', () => {
    const existingRequest = { id: '1', type: 'store_manager', status: 'pending' };
    const rejectedRequest = { id: '1', type: 'store_manager', status: 'rejected' };
    const stateWithRequest = { 
      ...initialState, 
      requests: [existingRequest],
      currentRequest: existingRequest
    };
    const action = rejectRequest.fulfilled(rejectedRequest, 'requestId');
    const newState = requestSlice(stateWithRequest, action);
    expect(newState.currentRequest).toEqual(rejectedRequest);
  });
});
