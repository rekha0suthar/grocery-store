import { RequestRepository } from '../repositories/RequestRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { CreateStoreManagerRequestUseCase } from '@grocery-store/core/use-cases/request';
import { ApproveRequestUseCase } from '@grocery-store/core/use-cases/request';

export class RequestComposition {
  constructor(databaseType = 'firebase') {
    this.databaseType = databaseType;
    this._requestRepository = null;
    this._userRepository = null;
    this._categoryRepository = null;
    this._createStoreManagerRequestUseCase = null;
    this._approveRequestUseCase = null;
  }

  getRequestRepository() {
    if (!this._requestRepository) {
      this._requestRepository = new RequestRepository(this.databaseType);
    }
    return this._requestRepository;
  }

  getUserRepository() {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.databaseType);
    }
    return this._userRepository;
  }

  getCategoryRepository() {
    if (!this._categoryRepository) {
      this._categoryRepository = new CategoryRepository(this.databaseType);
    }
    return this._categoryRepository;
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
        categoryRepo: this.getCategoryRepository()
      });
    }
    return this._approveRequestUseCase;
  }
}
