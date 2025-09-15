import orderReducer, { 
  createOrder, 
  fetchUserOrders, 
  fetchOrderById, 
  cancelOrder,
  clearError,
  clearCurrentOrder
} from '../../../store/slices/orderSlice.js';

// Mock the order service
jest.mock('../../../services/orderService.js', () => ({
  orderService: {
    createOrder: jest.fn(),
    getUserOrders: jest.fn(),
    getOrderById: jest.fn(),
    cancelOrder: jest.fn(),
  },
}));

describe('Order Slice', () => {
  const initialState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  };

  const mockOrder = {
    id: '1',
    userId: 'user1',
    items: [{ productId: 'prod1', quantity: 2 }],
    total: 29.98,
    status: 'pending',
    createdAt: '2023-01-01T00:00:00Z',
  };

  it('should return the initial state', () => {
    expect(orderReducer(undefined, {})).toEqual(initialState);
  });

  describe('reducers', () => {
    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const action = clearError();
      const newState = orderReducer(stateWithError, action);
      expect(newState.error).toBeNull();
    });

    it('should handle clearCurrentOrder', () => {
      const stateWithOrder = { ...initialState, currentOrder: mockOrder };
      const action = clearCurrentOrder();
      const newState = orderReducer(stateWithOrder, action);
      expect(newState.currentOrder).toBeNull();
    });
  });

  describe('createOrder async thunk', () => {
    it('should handle createOrder.pending', () => {
      const action = { type: createOrder.pending.type };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle createOrder.fulfilled', () => {
      const action = { 
        type: createOrder.fulfilled.type, 
        payload: mockOrder 
      };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.orders).toContain(mockOrder);
      expect(newState.error).toBeNull();
    });

    it('should handle createOrder.rejected', () => {
      const error = 'Failed to create order';
      const action = { 
        type: createOrder.rejected.type, 
        payload: error 
      };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('fetchUserOrders async thunk', () => {
    it('should handle fetchUserOrders.pending', () => {
      const action = { type: fetchUserOrders.pending.type };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchUserOrders.fulfilled', () => {
      const orders = [mockOrder];
      const action = { 
        type: fetchUserOrders.fulfilled.type, 
        payload: orders 
      };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.orders).toEqual(orders);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchUserOrders.rejected', () => {
      const error = 'Failed to fetch orders';
      const action = { 
        type: fetchUserOrders.rejected.type, 
        payload: error 
      };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('fetchOrderById async thunk', () => {
    it('should handle fetchOrderById.pending', () => {
      const action = { type: fetchOrderById.pending.type };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchOrderById.fulfilled', () => {
      const action = { 
        type: fetchOrderById.fulfilled.type, 
        payload: mockOrder 
      };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.currentOrder).toEqual(mockOrder);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchOrderById.rejected', () => {
      const error = 'Failed to fetch order';
      const action = { 
        type: fetchOrderById.rejected.type, 
        payload: error 
      };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });

  describe('cancelOrder async thunk', () => {
    it('should handle cancelOrder.pending', () => {
      const action = { type: cancelOrder.pending.type };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle cancelOrder.fulfilled', () => {
      const stateWithOrder = { 
        ...initialState, 
        orders: [mockOrder] 
      };
      const cancelledOrder = { ...mockOrder, status: 'cancelled' };
      const action = { 
        type: cancelOrder.fulfilled.type, 
        payload: cancelledOrder 
      };
      const newState = orderReducer(stateWithOrder, action);
      expect(newState.loading).toBe(false);
      expect(newState.orders[0].status).toBe('cancelled');
      expect(newState.error).toBeNull();
    });

    it('should update currentOrder when cancelling current order', () => {
      const stateWithCurrentOrder = { 
        ...initialState, 
        currentOrder: mockOrder 
      };
      const cancelledOrder = { ...mockOrder, status: 'cancelled' };
      const action = { 
        type: cancelOrder.fulfilled.type, 
        payload: cancelledOrder 
      };
      const newState = orderReducer(stateWithCurrentOrder, action);
      expect(newState.currentOrder.status).toBe('cancelled');
    });

    it('should handle cancelOrder.rejected', () => {
      const error = 'Failed to cancel order';
      const action = { 
        type: cancelOrder.rejected.type, 
        payload: error 
      };
      const newState = orderReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(error);
    });
  });
});
