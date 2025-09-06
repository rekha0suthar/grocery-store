/**
 * Interfaces/Ports
 * 
 * These define contracts that adapters must implement.
 * The core defines these interfaces; adapters implement them.
 */

export { default as IAuthProvider } from './IAuthProvider.js';
export { default as IDatabaseAdapter } from './IDatabaseAdapter.js';
export { default as IProductRepository } from './IProductRepository.js';
export { default as IRepository } from './IRepository.js';
export { default as IUserRepository } from './IUserRepository.js';
export { IPasswordHasher } from './IPasswordHasher.js';
