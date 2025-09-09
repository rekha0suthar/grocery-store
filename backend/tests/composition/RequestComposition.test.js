import { RequestComposition } from '../../src/composition/RequestComposition.js';
import { RequestRepository } from '../../src/repositories/RequestRepository.js';
import { UserRepository } from '../../src/repositories/UserRepository.js';
import { CategoryRepository } from '../../src/repositories/CategoryRepository.js';
import { CreateStoreManagerRequestUseCase } from '@grocery-store/core/use-cases/request/CreateStoreManagerRequestUseCase.js';
import { ApproveRequestUseCase } from '@grocery-store/core/use-cases/request/ApproveRequestUseCase.js';

// Mock repositories
jest.mock('../../src/repositories/RequestRepository.js');
jest.mock('../../src/repositories/UserRepository.js');
jest.mock('../../src/repositories/CategoryRepository.js');

// Mock use cases
jest.mock('@grocery-store/core/use-cases/request/CreateStoreManagerRequestUseCase.js');
jest.mock('@grocery-store/core/use-cases/request/ApproveRequestUseCase.js');

describe('RequestComposition - Dependency Injection Container', () => {
  let composition;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create composition instance
    composition = new RequestComposition('firebase');
  });

  describe('Dependency Injection', () => {
    test('creates RequestComposition instance', () => {
      expect(composition).toBeDefined();
      expect(composition).toBeInstanceOf(RequestComposition);
      expect(composition.databaseType).toBe('firebase');
    });

    test('provides access to request repository', () => {
      const repository = composition.getRequestRepository();
      
      expect(RequestRepository).toHaveBeenCalledWith('firebase');
      expect(repository).toBeDefined();
    });

    test('provides access to user repository', () => {
      const repository = composition.getUserRepository();
      
      expect(UserRepository).toHaveBeenCalledWith('firebase');
      expect(repository).toBeDefined();
    });

    test('provides access to category repository', () => {
      const repository = composition.getCategoryRepository();
      
      expect(CategoryRepository).toHaveBeenCalledWith('firebase');
      expect(repository).toBeDefined();
    });

    test('provides access to create store manager request use case', () => {
      const useCase = composition.getCreateStoreManagerRequestUseCase();
      
      expect(CreateStoreManagerRequestUseCase).toHaveBeenCalledWith({
        requestRepo: expect.any(Object),
        userRepo: expect.any(Object)
      });
      expect(useCase).toBeDefined();
    });

    test('provides access to approve request use case', () => {
      const useCase = composition.getApproveRequestUseCase();
      
      expect(ApproveRequestUseCase).toHaveBeenCalledWith({
        requestRepo: expect.any(Object),
        userRepo: expect.any(Object),
        categoryRepo: expect.any(Object)
      });
      expect(useCase).toBeDefined();
    });
  });

  describe('Use Case Integration', () => {
    test('create store manager request use case is properly configured', () => {
      const useCase = composition.getCreateStoreManagerRequestUseCase();
      
      expect(useCase).toBeDefined();
      expect(CreateStoreManagerRequestUseCase).toHaveBeenCalledWith({
        requestRepo: expect.any(Object),
        userRepo: expect.any(Object)
      });
    });

    test('approve request use case is properly configured', () => {
      const useCase = composition.getApproveRequestUseCase();
      
      expect(useCase).toBeDefined();
      expect(ApproveRequestUseCase).toHaveBeenCalledWith({
        requestRepo: expect.any(Object),
        userRepo: expect.any(Object),
        categoryRepo: expect.any(Object)
      });
    });

    test('use cases have access to repositories', () => {
      const createUseCase = composition.getCreateStoreManagerRequestUseCase();
      const approveUseCase = composition.getApproveRequestUseCase();
      
      expect(createUseCase).toBeDefined();
      expect(approveUseCase).toBeDefined();
      
      // Verify that repositories were instantiated
      expect(RequestRepository).toHaveBeenCalled();
      expect(UserRepository).toHaveBeenCalled();
      expect(CategoryRepository).toHaveBeenCalled();
    });
  });

  describe('Singleton Pattern', () => {
    test('returns same repository instances on multiple calls', () => {
      const repository1 = composition.getRequestRepository();
      const repository2 = composition.getRequestRepository();
      
      expect(repository1).toBe(repository2);
      expect(RequestRepository).toHaveBeenCalledTimes(1);
    });

    test('returns same use case instances on multiple calls', () => {
      const useCase1 = composition.getCreateStoreManagerRequestUseCase();
      const useCase2 = composition.getCreateStoreManagerRequestUseCase();
      
      expect(useCase1).toBe(useCase2);
      expect(CreateStoreManagerRequestUseCase).toHaveBeenCalledTimes(1);
    });

    test('returns same approve use case instances on multiple calls', () => {
      const useCase1 = composition.getApproveRequestUseCase();
      const useCase2 = composition.getApproveRequestUseCase();
      
      expect(useCase1).toBe(useCase2);
      expect(ApproveRequestUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('Method Availability', () => {
    test('has required methods', () => {
      expect(typeof composition.getRequestRepository).toBe('function');
      expect(typeof composition.getUserRepository).toBe('function');
      expect(typeof composition.getCategoryRepository).toBe('function');
      expect(typeof composition.getCreateStoreManagerRequestUseCase).toBe('function');
      expect(typeof composition.getApproveRequestUseCase).toBe('function');
    });
  });

  describe('Database Type Configuration', () => {
    test('uses default database type when not specified', () => {
      const defaultComposition = new RequestComposition();
      
      expect(defaultComposition.databaseType).toBe('firebase');
    });

    test('uses custom database type when specified', () => {
      const customComposition = new RequestComposition('custom-db');
      
      expect(customComposition.databaseType).toBe('custom-db');
    });

    test('passes database type to repositories', () => {
      composition.getRequestRepository();
      composition.getUserRepository();
      composition.getCategoryRepository();
      
      expect(RequestRepository).toHaveBeenCalledWith('firebase');
      expect(UserRepository).toHaveBeenCalledWith('firebase');
      expect(CategoryRepository).toHaveBeenCalledWith('firebase');
    });
  });

  describe('Repository Dependencies', () => {
    test('create store manager use case gets correct repositories', () => {
      composition.getCreateStoreManagerRequestUseCase();
      
      expect(CreateStoreManagerRequestUseCase).toHaveBeenCalledWith({
        requestRepo: expect.any(Object),
        userRepo: expect.any(Object)
      });
    });

    test('approve request use case gets correct repositories', () => {
      composition.getApproveRequestUseCase();
      
      expect(ApproveRequestUseCase).toHaveBeenCalledWith({
        requestRepo: expect.any(Object),
        userRepo: expect.any(Object),
        categoryRepo: expect.any(Object)
      });
    });
  });

  describe('Lazy Initialization', () => {
    test('repositories are created only when accessed', () => {
      // Initially, no repositories should be created
      expect(RequestRepository).not.toHaveBeenCalled();
      expect(UserRepository).not.toHaveBeenCalled();
      expect(CategoryRepository).not.toHaveBeenCalled();
      
      // Access repositories
      composition.getRequestRepository();
      composition.getUserRepository();
      composition.getCategoryRepository();
      
      // Now they should be created
      expect(RequestRepository).toHaveBeenCalled();
      expect(UserRepository).toHaveBeenCalled();
      expect(CategoryRepository).toHaveBeenCalled();
    });

    test('use cases are created only when accessed', () => {
      // Initially, no use cases should be created
      expect(CreateStoreManagerRequestUseCase).not.toHaveBeenCalled();
      expect(ApproveRequestUseCase).not.toHaveBeenCalled();
      
      // Access use cases
      composition.getCreateStoreManagerRequestUseCase();
      composition.getApproveRequestUseCase();
      
      // Now they should be created
      expect(CreateStoreManagerRequestUseCase).toHaveBeenCalled();
      expect(ApproveRequestUseCase).toHaveBeenCalled();
    });
  });
});
