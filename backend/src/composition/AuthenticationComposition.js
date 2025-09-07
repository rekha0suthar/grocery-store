/**
 * Authentication Composition Root
 * 
 * This is where we wire up all the dependencies for authentication.
 * This is the only place where we know about concrete implementations.
 * 
 * Following Clean Architecture: this is the "main" function that
 * connects the core use cases with the infrastructure adapters.
 */
import { AuthenticateUserUseCase } from '@grocery-store/core/use-cases/auth/AuthenticateUserUseCase.js';
import { CreateUserUseCase } from '@grocery-store/core/use-cases/auth/CreateUserUseCase.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { BcryptPasswordHasher } from '../adapters/BcryptPasswordHasher.js';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class AuthenticationComposition {
  constructor() {
    // Create infrastructure adapters
    this.passwordHasher = new BcryptPasswordHasher();
    this.userRepository = new UserRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    
    // Create use cases with injected dependencies
    this.authenticateUserUseCase = new AuthenticateUserUseCase(
      this.userRepository,
      this.passwordHasher
    );
    
    this.createUserUseCase = new CreateUserUseCase(
      this.userRepository,
      this.passwordHasher
    );
  }

  getAuthenticateUserUseCase() {
    return this.authenticateUserUseCase;
  }

  getCreateUserUseCase() {
    return this.createUserUseCase;
  }
}
