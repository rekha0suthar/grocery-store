/**
 * Product Composition Root
 * 
 * This is where we wire up all the dependencies for product management.
 * This is the only place where we know about concrete implementations.
 * 
 * Following Clean Architecture: this is the "main" function that
 * connects the core use cases with the infrastructure adapters.
 */
import { ManageProductUseCase } from '@grocery-store/core/use-cases/product/ManageProductUseCase.js';
import { CreateProductUseCase } from '@grocery-store/core/use-cases/product/CreateProductUseCase.js';
import { UpdateProductStockUseCase } from '@grocery-store/core/use-cases/product/UpdateProductStockUseCase.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class ProductComposition {
  constructor() {
    // Create infrastructure adapters
    this.productRepository = new ProductRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    this.categoryRepository = new CategoryRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    
    // Create use cases with injected dependencies
    this.manageProductUseCase = new ManageProductUseCase(
      this.productRepository,
      this.categoryRepository
    );
    
    this.createProductUseCase = new CreateProductUseCase(
      this.productRepository,
      this.categoryRepository
    );
    
    this.updateProductStockUseCase = new UpdateProductStockUseCase(
      this.productRepository
    );
  }

  getManageProductUseCase() {
    return this.manageProductUseCase;
  }

  getCreateProductUseCase() {
    return this.createProductUseCase;
  }

  getUpdateProductStockUseCase() {
    return this.updateProductStockUseCase;
  }
}
