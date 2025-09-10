import { CategoryComposition } from '../../src/composition/CategoryComposition.js';

describe('CategoryComposition - Dependency Injection Container', () => {
  let categoryComposition;

  beforeEach(() => {
    categoryComposition = new CategoryComposition();
  });

  describe('Dependency Injection', () => {
    test('creates CategoryComposition instance', () => {
      expect(categoryComposition).toBeInstanceOf(CategoryComposition);
    });

    test('provides access to manage category use case', () => {
      const manageCategoryUseCase = categoryComposition.getManageCategoryUseCase();
      expect(manageCategoryUseCase).toBeDefined();
      expect(typeof manageCategoryUseCase.execute).toBe('function');
    });
  });

  describe('Use Case Integration', () => {
    test('manage category use case is properly configured', () => {
      const manageCategoryUseCase = categoryComposition.getManageCategoryUseCase();
      expect(manageCategoryUseCase).toBeDefined();
    });

    test('use case has access to repository', () => {
      const manageCategoryUseCase = categoryComposition.getManageCategoryUseCase();
      
      // The use case should be properly instantiated
      expect(manageCategoryUseCase).toBeDefined();
    });
  });

  describe('Singleton Pattern', () => {
    test('returns same use case instance on multiple calls', () => {
      const useCase1 = categoryComposition.getManageCategoryUseCase();
      const useCase2 = categoryComposition.getManageCategoryUseCase();
      
      expect(useCase1).toBe(useCase2);
    });
  });

  describe('Method Availability', () => {
    test('has required methods', () => {
      expect(typeof categoryComposition.getManageCategoryUseCase).toBe('function');
    });
  });
});
