import { ManageCategoryUseCase } from '@grocery-store/core/use-cases/category';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class CategoryComposition {
  constructor() {
    this.categoryRepository = new CategoryRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    
    this.manageCategoryUseCase = new ManageCategoryUseCase({
      categoryRepo: this.categoryRepository
    });
  }

  getManageCategoryUseCase() {
    return this.manageCategoryUseCase;
  }
}
