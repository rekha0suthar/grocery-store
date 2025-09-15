// Test helper functions for common testing scenarios

export const createMockStore = (initialState = {}) => {
  const defaultState = {
    auth: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      systemInitialized: true,
      initializationLoading: false,
    },
    products: {
      products: [],
      currentProduct: null,
      loading: false,
      error: null,
      searchQuery: '',
      filters: {},
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    },
    categories: {
      categories: [],
      loading: false,
      error: null,
    },
    cart: {
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,
      error: null,
    },
    orders: {
      orders: [],
      currentOrder: null,
      loading: false,
      error: null,
    },
    requests: {
      requests: [],
      loading: false,
      error: null,
    },
    ui: {
      sidebarOpen: false,
      modalOpen: false,
      notification: null,
    },
    wishlist: {
      items: [],
      loading: false,
      error: null,
    },
    addresses: {
      addresses: [],
      currentAddress: null,
      loading: false,
      error: null,
    },
    payment: {
      paymentMethods: [],
      loading: false,
      error: null,
    },
  };

  return { ...defaultState, ...initialState };
};

export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  isActive: true,
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: '1',
  name: 'Test Product',
  description: 'A test product',
  price: 10.99,
  category: 'Test Category',
  image: 'test-image.jpg',
  stock: 100,
  isFeatured: true,
  discount: 0,
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  id: '1',
  name: 'Test Category',
  description: 'A test category',
  parentId: null,
  isActive: true,
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: '1',
  userId: '1',
  items: [],
  total: 0,
  status: 'pending',
  createdAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: '1',
  product: createMockProduct(),
  quantity: 1,
  price: 10.99,
  ...overrides,
});

export const createMockAddress = (overrides = {}) => ({
  id: '1',
  userId: '1',
  street: '123 Test St',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  country: 'Test Country',
  isDefault: true,
  ...overrides,
});

export const createMockRequest = (overrides = {}) => ({
  id: '1',
  userId: '1',
  type: 'store_manager',
  status: 'pending',
  data: {},
  createdAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

// Mock API responses
export const createMockApiResponse = (data, success = true, message = 'Success') => ({
  data: {
    success,
    data,
    message,
  },
});

export const createMockErrorResponse = (message = 'Error occurred') => ({
  response: {
    data: {
      success: false,
      message,
    },
  },
});

// Test utilities for form testing
export const fillFormField = async (user, field, value) => {
  const input = screen.getByLabelText(field);
  await user.clear(input);
  await user.type(input, value);
};

export const submitForm = async (user, submitButtonText = 'Submit') => {
  const submitButton = screen.getByRole('button', { name: submitButtonText });
  await user.click(submitButton);
};

// Test utilities for Redux testing
export const createMockAction = (type, payload = {}) => ({
  type,
  payload,
});

export const createMockAsyncAction = (type, status, payload = {}) => ({
  type: `${type}_${status}`,
  payload,
});

// Test utilities for component testing
export const expectElementToBeInDocument = (element) => {
  expect(element).toBeInTheDocument();
};

export const expectElementToHaveClass = (element, className) => {
  expect(element).toHaveClass(className);
};

export const expectElementToHaveAttribute = (element, attribute, value) => {
  expect(element).toHaveAttribute(attribute, value);
};

export const expectElementToHaveTextContent = (element, text) => {
  expect(element).toHaveTextContent(text);
};

// Test utilities for API testing
export const mockApiCall = (mockFn, response, shouldReject = false) => {
  if (shouldReject) {
    mockFn.mockRejectedValue(response);
  } else {
    mockFn.mockResolvedValue(response);
  }
};

export const expectApiCall = (mockFn, endpoint, data = undefined) => {
  if (data !== undefined) {
    expect(mockFn).toHaveBeenCalledWith(endpoint, data);
  } else {
    expect(mockFn).toHaveBeenCalledWith(endpoint);
  }
};

// Test utilities for localStorage testing
export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Test utilities for router testing
export const mockNavigate = jest.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

// Test utilities for toast notifications
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};

// Test utilities for date/time testing
export const mockDate = (dateString) => {
  const mockDate = new Date(dateString);
  const originalDate = Date;
  global.Date = jest.fn(() => mockDate);
  global.Date.UTC = originalDate.UTC;
  global.Date.parse = originalDate.parse;
  global.Date.now = originalDate.now;
  return mockDate;
};

// Test utilities for file upload testing
export const createMockFile = (name = 'test.txt', type = 'text/plain', content = 'test content') => {
  const file = new File([content], name, { type });
  return file;
};

// Test utilities for drag and drop testing
export const createMockDragEvent = (dataTransfer = {}) => ({
  dataTransfer: {
    files: [],
    items: [],
    types: [],
    ...dataTransfer,
  },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
});

// Test utilities for keyboard events
export const createMockKeyboardEvent = (key, options = {}) => ({
  key,
  code: key,
  keyCode: key.charCodeAt(0),
  which: key.charCodeAt(0),
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...options,
});

// Test utilities for mouse events
export const createMockMouseEvent = (type, options = {}) => ({
  type,
  button: 0,
  buttons: 1,
  clientX: 0,
  clientY: 0,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...options,
});

// Test utilities for touch events
export const createMockTouchEvent = (type, touches = []) => ({
  type,
  touches,
  changedTouches: touches,
  targetTouches: touches,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
});

// Test utilities for window events
export const mockWindowEvent = (eventType, eventData = {}) => {
  const event = new Event(eventType, { bubbles: true, cancelable: true });
  Object.assign(event, eventData);
  window.dispatchEvent(event);
  return event;
};

// Test utilities for intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Test utilities for resize observer
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Test to ensure this file is recognized as a test file
describe('Test Helpers', () => {
  it('should export helper functions', () => {
    expect(createMockStore).toBeDefined();
    expect(createMockUser).toBeDefined();
    expect(createMockProduct).toBeDefined();
    expect(createMockCategory).toBeDefined();
    expect(createMockOrder).toBeDefined();
    expect(createMockCartItem).toBeDefined();
    expect(createMockAddress).toBeDefined();
    expect(createMockRequest).toBeDefined();
    expect(createMockApiResponse).toBeDefined();
    expect(createMockErrorResponse).toBeDefined();
  });
});
