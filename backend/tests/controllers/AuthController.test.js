import { AuthController } from '../../src/controllers/AuthController.js';
import { AuthenticationComposition } from '../../src/composition/AuthenticationComposition.js';
import { JWTAuthProvider } from '../../src/plugins/auth/JWTAuthProvider.js';

// Mock dependencies
jest.mock('../../src/composition/AuthenticationComposition.js');
jest.mock('../../src/plugins/auth/JWTAuthProvider.js');

describe('AuthController - HTTP Interface Adapter', () => {
  let controller;
  let mockAuthComposition;
  let mockJwtProvider;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock composition
    mockAuthComposition = {
      getCreateUserUseCase: jest.fn(),
      getAuthenticateUserWithApprovalUseCase: jest.fn(),
      getRegisterStoreManagerUseCase: jest.fn(),
      getInitializeSystemUseCase: jest.fn(),
      getManageStoreManagerRequestsUseCase: jest.fn(),
      getAdminManagementPolicy: jest.fn()
    };

    // Mock JWT provider
    mockJwtProvider = {
      generateToken: jest.fn()
    };

    // Mock AuthenticationComposition constructor to return our mock
    AuthenticationComposition.mockImplementation(() => mockAuthComposition);
    JWTAuthProvider.mockImplementation(() => mockJwtProvider);

    // Create controller instance
    controller = new AuthController();
  });

  describe('Basic Functionality', () => {
    test('creates AuthController instance', () => {
      expect(controller).toBeInstanceOf(AuthController);
      expect(controller.authComposition).toBe(mockAuthComposition);
      expect(controller.jwtProvider).toBe(mockJwtProvider);
    });

    test('has required methods', () => {
      expect(typeof controller.register).toBe('function');
      expect(typeof controller.login).toBe('function');
      expect(typeof controller.logout).toBe('function');
      expect(typeof controller.getProfile).toBe('function');
      expect(typeof controller.updateProfile).toBe('function');
      expect(typeof controller.changePassword).toBe('function');
      expect(typeof controller.initializeSystem).toBe('function');
      expect(typeof controller.checkInitialization).toBe('function');
      expect(typeof controller.getPendingStoreManagerRequests).toBe('function');
      expect(typeof controller.approveStoreManagerRequest).toBe('function');
    });
  });

  describe('Method Structure', () => {
    test('register method is properly defined', () => {
      expect(controller.register).toBeDefined();
      expect(typeof controller.register).toBe('function');
    });

    test('login method is properly defined', () => {
      expect(controller.login).toBeDefined();
      expect(typeof controller.login).toBe('function');
    });

    test('logout method is properly defined', () => {
      expect(controller.logout).toBeDefined();
      expect(typeof controller.logout).toBe('function');
    });

    test('getProfile method is properly defined', () => {
      expect(controller.getProfile).toBeDefined();
      expect(typeof controller.getProfile).toBe('function');
    });

    test('updateProfile method is properly defined', () => {
      expect(controller.updateProfile).toBeDefined();
      expect(typeof controller.updateProfile).toBe('function');
    });

    test('changePassword method is properly defined', () => {
      expect(controller.changePassword).toBeDefined();
      expect(typeof controller.changePassword).toBe('function');
    });

    test('initializeSystem method is properly defined', () => {
      expect(controller.initializeSystem).toBeDefined();
      expect(typeof controller.initializeSystem).toBe('function');
    });

    test('checkInitialization method is properly defined', () => {
      expect(controller.checkInitialization).toBeDefined();
      expect(typeof controller.checkInitialization).toBe('function');
    });

    test('getPendingStoreManagerRequests method is properly defined', () => {
      expect(controller.getPendingStoreManagerRequests).toBeDefined();
      expect(typeof controller.getPendingStoreManagerRequests).toBe('function');
    });

    test('approveStoreManagerRequest method is properly defined', () => {
      expect(controller.approveStoreManagerRequest).toBeDefined();
      expect(typeof controller.approveStoreManagerRequest).toBe('function');
    });
  });

  describe('Dependency Injection', () => {
    test('has access to authentication composition', () => {
      expect(controller.authComposition).toBeDefined();
      expect(controller.authComposition).toBe(mockAuthComposition);
    });

    test('has access to JWT provider', () => {
      expect(controller.jwtProvider).toBeDefined();
      expect(controller.jwtProvider).toBe(mockJwtProvider);
    });

    test('can access use cases through composition', () => {
      expect(controller.authComposition.getCreateUserUseCase).toBeDefined();
      expect(controller.authComposition.getAuthenticateUserWithApprovalUseCase).toBeDefined();
      expect(controller.authComposition.getRegisterStoreManagerUseCase).toBeDefined();
      expect(controller.authComposition.getInitializeSystemUseCase).toBeDefined();
      expect(controller.authComposition.getManageStoreManagerRequestsUseCase).toBeDefined();
      expect(controller.authComposition.getAdminManagementPolicy).toBeDefined();
    });
  });
});
