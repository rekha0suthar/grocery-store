import { AuthenticationComposition } from '../../src/composition/AuthenticationComposition.js';
import { AuthenticateUserUseCase } from '@grocery-store/core/use-cases/auth/AuthenticateUserUseCase.js';
import { CreateUserUseCase } from '@grocery-store/core/use-cases/auth/CreateUserUseCase.js';
import { UserRepository } from '../../src/repositories/UserRepository.js';
import { BcryptPasswordHasher } from '../../src/adapters/BcryptPasswordHasher.js';

// Mock dependencies
jest.mock('@grocery-store/core/use-cases/auth/AuthenticateUserUseCase.js');
jest.mock('@grocery-store/core/use-cases/auth/CreateUserUseCase.js');
jest.mock('../../src/repositories/UserRepository.js');
jest.mock('../../src/adapters/BcryptPasswordHasher.js');

describe('AuthenticationComposition - Dependency Injection Container', () => {
  let composition;
  let mockUserRepository;
  let mockPasswordHasher;
  let mockAuthenticateUserUseCase;
  let mockCreateUserUseCase;

  beforeEach(() => {
    // Mock use cases
    mockAuthenticateUserUseCase = {
      execute: jest.fn()
    };
    
    mockCreateUserUseCase = {
      execute: jest.fn()
    };
    
    // Mock repositories and adapters
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };
    
    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn()
    };
    
    // Setup mocks
    AuthenticateUserUseCase.mockImplementation(() => mockAuthenticateUserUseCase);
    CreateUserUseCase.mockImplementation(() => mockCreateUserUseCase);
    UserRepository.mockImplementation(() => mockUserRepository);
    BcryptPasswordHasher.mockImplementation(() => mockPasswordHasher);
    
    // Create composition
    composition = new AuthenticationComposition();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Dependency Injection', () => {
    test('creates AuthenticationComposition instance', () => {
      expect(composition).toBeDefined();
      expect(composition).toBeInstanceOf(AuthenticationComposition);
    });

    test('provides access to use cases', () => {
      expect(composition.getAuthenticateUserUseCase()).toBe(mockAuthenticateUserUseCase);
      expect(composition.getCreateUserUseCase()).toBe(mockCreateUserUseCase);
    });
  });

  describe('Use Case Integration', () => {
    test('authenticate user use case is properly configured', () => {
      const useCase = composition.getAuthenticateUserUseCase();
      expect(useCase).toBeDefined();
      expect(useCase.execute).toBeDefined();
    });

    test('create user use case is properly configured', () => {
      const useCase = composition.getCreateUserUseCase();
      expect(useCase).toBeDefined();
      expect(useCase.execute).toBeDefined();
    });
  });
});
