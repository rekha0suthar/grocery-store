import { 
  AuthenticateUserUseCase, 
  CreateUserUseCase,
  UpdateUserUseCase,
  AuthenticateUserWithApprovalUseCase,
  RegisterStoreManagerUseCase,
  InitializeSystemUseCase,
  ManageStoreManagerRequestsUseCase
} from '@grocery-store/core/use-cases/auth';
import { UserRepository } from '../repositories/UserRepository.js';
import { RequestRepository } from '../repositories/RequestRepository.js';
import { StoreManagerProfileRepository } from '../repositories/StoreManagerProfileRepository.js';
import { BcryptPasswordHasher } from '../adapters/BcryptPasswordHasher.js';
import { DefaultClock } from '@grocery-store/core/adapters/DefaultClock.js';
import { AdminManagementPolicy } from '@grocery-store/core/services/AdminManagementPolicy.js';
import { StoreManagerApprovalPolicy } from '@grocery-store/core/services/StoreManagerApprovalPolicy.js';
import appConfig from '../config/appConfig.js';

export class AuthenticationComposition {
  constructor() {
    this.clock = new DefaultClock();
    this.passwordHasher = new BcryptPasswordHasher();
    this.userRepository = new UserRepository(appConfig.getDatabaseType());
    this.requestRepository = new RequestRepository(appConfig.getDatabaseType());
    this.storeManagerProfileRepository = new StoreManagerProfileRepository(appConfig.getDatabaseType());
    
    // Domain services
    this.adminManagementPolicy = new AdminManagementPolicy(this.userRepository);
    this.storeManagerApprovalPolicy = new StoreManagerApprovalPolicy(
      this.userRepository,
      this.storeManagerProfileRepository,
      this.requestRepository,
      this.clock,
      this.adminManagementPolicy
    );
    
    // Legacy use cases (for backward compatibility)
    this.authenticateUserUseCase = new AuthenticateUserUseCase(
      this.userRepository,
      this.passwordHasher
    );
    
    this.createUserUseCase = new CreateUserUseCase({
      userRepo: this.userRepository,
      passwordHasher: this.passwordHasher
    });

    this.updateUserUseCase = new UpdateUserUseCase({
      userRepo: this.userRepository
    });

    // New use cases with business rules
    this.authenticateUserWithApprovalUseCase = new AuthenticateUserWithApprovalUseCase(
      this.userRepository,
      this.storeManagerProfileRepository,
      this.passwordHasher,
      this.clock
    );

    this.registerStoreManagerUseCase = new RegisterStoreManagerUseCase(
      this.userRepository,
      this.requestRepository,
      this.clock
    );

    this.initializeSystemUseCase = new InitializeSystemUseCase(
      this.userRepository,
      this.passwordHasher,
      this.adminManagementPolicy,
      this.clock
    );

    this.manageStoreManagerRequestsUseCase = new ManageStoreManagerRequestsUseCase(
      this.requestRepository,
      this.adminManagementPolicy,
      this.storeManagerApprovalPolicy
    );
  }

  // Legacy methods (for backward compatibility)
  getAuthenticateUserUseCase() {
    return this.authenticateUserUseCase;
  }

  getCreateUserUseCase() {
    return this.createUserUseCase;
  }

  getUpdateUserUseCase() {
    return this.updateUserUseCase;
  }

  // New methods with business rules
  getAuthenticateUserWithApprovalUseCase() {
    return this.authenticateUserWithApprovalUseCase;
  }

  getRegisterStoreManagerUseCase() {
    return this.registerStoreManagerUseCase;
  }

  getInitializeSystemUseCase() {
    return this.initializeSystemUseCase;
  }

  getManageStoreManagerRequestsUseCase() {
    return this.manageStoreManagerRequestsUseCase;
  }

  getAdminManagementPolicy() {
    return this.adminManagementPolicy;
  }

  getStoreManagerProfileRepository() {
    return this.storeManagerProfileRepository;
  }
}
