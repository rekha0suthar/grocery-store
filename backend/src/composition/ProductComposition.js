import { ManageProductUseCase, CreateProductUseCase, UpdateProductStockUseCase } from '@grocery-store/core/use-cases/product';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class ProductComposition {
  constructor() {
    this.productRepository = new ProductRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    this.categoryRepository = new CategoryRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    
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
