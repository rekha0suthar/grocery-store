/**
 * Category Composition Root
 * 
 * This is where we wire up all the dependencies for category management.
 * This is the only place where we know about concrete implementations.
 * 
 * Following Clean Architecture: this is the "main" function that
 * connects the core use cases with the infrastructure adapters.
 */
import { ManageCategoryUseCase } from '@grocery-store/core/use-cases/category/ManageCategoryUseCase.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class CategoryComposition {
  constructor() {
    // Create infrastructure adapters
    this.categoryRepository = new CategoryRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    
    // Create use cases with injected dependencies
    this.manageCategoryUseCase = new ManageCategoryUseCase(
      this.categoryRepository
    );
  }

  getManageCategoryUseCase() {
    return this.manageCategoryUseCase;
  }
}
