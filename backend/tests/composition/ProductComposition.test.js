import { ProductComposition } from '../../src/composition/ProductComposition.js';
import { ManageProductUseCase, CreateProductUseCase, UpdateProductStockUseCase } from '@grocery-store/core/use-cases';

describe('ProductComposition - Dependency Injection Container', () => {
  let productComposition;

  beforeEach(() => {
    productComposition = new ProductComposition();
  });

  describe('Dependency Injection', () => {
    test('creates ProductComposition instance', () => {
      expect(productComposition).toBeInstanceOf(ProductComposition);
    });

    test('provides access to manage product use case', () => {
      const manageProductUseCase = productComposition.getManageProductUseCase();
      expect(manageProductUseCase).toBeDefined();
      expect(typeof manageProductUseCase.execute).toBe('function');
    });

    test('provides access to create product use case', () => {
      const createProductUseCase = productComposition.getCreateProductUseCase();
      expect(createProductUseCase).toBeDefined();
      expect(typeof createProductUseCase.execute).toBe('function');
    });

    test('provides access to update product stock use case', () => {
      const updateProductStockUseCase = productComposition.getUpdateProductStockUseCase();
      expect(updateProductStockUseCase).toBeDefined();
      expect(typeof updateProductStockUseCase.execute).toBe('function');
    });
  });

  describe('Use Case Integration', () => {
    test('manage product use case is properly configured', () => {
      const manageProductUseCase = productComposition.getManageProductUseCase();
      expect(manageProductUseCase).toBeDefined();
    });

    test('create product use case is properly configured', () => {
      const createProductUseCase = productComposition.getCreateProductUseCase();
      expect(createProductUseCase).toBeDefined();
    });

    test('update product stock use case is properly configured', () => {
      const updateProductStockUseCase = productComposition.getUpdateProductStockUseCase();
      expect(updateProductStockUseCase).toBeDefined();
    });

    test('use cases are properly instantiated', () => {
      const manageProductUseCase = productComposition.getManageProductUseCase();
      const createProductUseCase = productComposition.getCreateProductUseCase();
      const updateProductStockUseCase = productComposition.getUpdateProductStockUseCase();
      
      expect(manageProductUseCase).toBeDefined();
      expect(createProductUseCase).toBeDefined();
      expect(updateProductStockUseCase).toBeDefined();
    });
  });

  describe('Singleton Pattern', () => {
    test('returns same use case instances on multiple calls', () => {
      const manageUseCase1 = productComposition.getManageProductUseCase();
      const manageUseCase2 = productComposition.getManageProductUseCase();
      
      const createUseCase1 = productComposition.getCreateProductUseCase();
      const createUseCase2 = productComposition.getCreateProductUseCase();
      
      const updateUseCase1 = productComposition.getUpdateProductStockUseCase();
      const updateUseCase2 = productComposition.getUpdateProductStockUseCase();
      
      expect(manageUseCase1).toBe(manageUseCase2);
      expect(createUseCase1).toBe(createUseCase2);
      expect(updateUseCase1).toBe(updateUseCase2);
    });
  });

  describe('Method Availability', () => {
    test('has required methods', () => {
      expect(typeof productComposition.getManageProductUseCase).toBe('function');
      expect(typeof productComposition.getCreateProductUseCase).toBe('function');
      expect(typeof productComposition.getUpdateProductStockUseCase).toBe('function');
    });
  });
});
