import { AuthenticateUserUseCase, CreateUserUseCase } from '@grocery-store/core/use-cases/auth';
import { UserRepository } from '../repositories/UserRepository.js';
import { BcryptPasswordHasher } from '../adapters/BcryptPasswordHasher.js';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class AuthenticationComposition {
  constructor() {
    this.passwordHasher = new BcryptPasswordHasher();
    this.userRepository = new UserRepository(DatabaseFactory.createAdapter(appConfig.getDatabaseType()));
    
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
