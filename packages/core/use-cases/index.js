/**
 * Use Cases (Application Layer)
 * 
 * These orchestrate business logic and coordinate between entities and repositories.
 * They define the application-specific business rules.
 */

// Authentication Use Cases
export { default as AuthenticateUserUseCase } from './auth/AuthenticateUserUseCase.js';
export { default as CreateUserUseCase } from './auth/CreateUserUseCase.js';

// Product Management Use Cases
export { default as CreateProductUseCase } from './product/CreateProductUseCase.js';
export { default as UpdateProductStockUseCase } from './product/UpdateProductStockUseCase.js';

// Cart Management Use Cases
export { default as AddToCartUseCase } from './cart/AddToCartUseCase.js';

// Order Management Use Cases
export { default as CreateOrderUseCase } from './order/CreateOrderUseCase.js';

// Request Management Use Cases
export { default as CreateStoreManagerRequestUseCase } from './request/CreateStoreManagerRequestUseCase.js';
export { default as ApproveRequestUseCase } from './request/ApproveRequestUseCase.js';

// Legacy exports (to be refactored)
export { default as ManageCartUseCase } from './ManageCartUseCase.js';
export { default as ManageCategoryUseCase } from './ManageCategoryUseCase.js';
export { default as ManageProductUseCase } from './ManageProductUseCase.js';
export { default as ProcessOrderUseCase } from './ProcessOrderUseCase.js';
