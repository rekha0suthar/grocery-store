import { RequestRepository } from '../repositories/RequestRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { StoreManagerProfileRepository } from '../repositories/StoreManagerProfileRepository.js';
import { CreateStoreManagerRequestUseCase, ApproveRequestUseCase } from '@grocery-store/core/use-cases/request';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class RequestComposition {
  constructor() {
    this._requestRepository = null;
    this._userRepository = null;
    this._categoryRepository = null;
    this._storeManagerProfileRepository = null;
    this._createStoreManagerRequestUseCase = null;
    this._approveRequestUseCase = null;
  }

  getRequestRepository() {
    if (!this._requestRepository) {
      this._requestRepository = new RequestRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    }
    return this._requestRepository;
  }

  getUserRepository() {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    }
    return this._userRepository;
  }

  getCategoryRepository() {
    if (!this._categoryRepository) {
      this._categoryRepository = new CategoryRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    }
    return this._categoryRepository;
  }

  getStoreManagerProfileRepository() {
    if (!this._storeManagerProfileRepository) {
      this._storeManagerProfileRepository = new StoreManagerProfileRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    }
    return this._storeManagerProfileRepository;
  }

  getCreateStoreManagerRequestUseCase() {
    if (!this._createStoreManagerRequestUseCase) {
      this._createStoreManagerRequestUseCase = new CreateStoreManagerRequestUseCase({
        requestRepo: this.getRequestRepository(),
        userRepo: this.getUserRepository()
      });
    }
    return this._createStoreManagerRequestUseCase;
  }

  getApproveRequestUseCase() {
    if (!this._approveRequestUseCase) {
      this._approveRequestUseCase = new ApproveRequestUseCase({
        requestRepo: this.getRequestRepository(),
        userRepo: this.getUserRepository(),
        categoryRepo: this.getCategoryRepository(),
        storeManagerProfileRepo: this.getStoreManagerProfileRepository()
      });
    }
    return this._approveRequestUseCase;
  }
}
