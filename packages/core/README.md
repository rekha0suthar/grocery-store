# @grocery-store/core

## 🏗️ Clean Architecture Core Package

This package contains the **core business logic** of the grocery store application, following Clean Architecture principles.

### 📦 What's Inside

#### 🎯 **Entities** (`/entities`)
- **BaseEntity.js** - Base class for all domain entities
- **User.js** - User entity with role-based business rules
- **Product.js** - Product entity with inventory management
- **Category.js** - Category entity with hierarchical structure
- **Cart.js** - Shopping cart entity with business logic
- **Order.js** - Order entity with status management
- **Request.js** - Request entity for approval workflows

#### 🔄 **Use Cases** (`/use-cases`)
- **Authentication**: `AuthenticateUserUseCase`, `CreateUserUseCase`
- **Product Management**: `CreateProductUseCase`, `UpdateProductStockUseCase`
- **Cart Management**: `AddToCartUseCase`
- **Order Management**: `CreateOrderUseCase`
- **Request Management**: `CreateStoreManagerRequestUseCase`, `ApproveRequestUseCase`

#### 🔌 **Interfaces/Ports** (`/interfaces`)
- **IAuthProvider** - Authentication contract
- **IDatabaseAdapter** - Database access contract
- **IRepository** - Generic repository contract
- **IUserRepository** - User-specific repository contract
- **IProductRepository** - Product-specific repository contract

### 🚫 **What's NOT Here**

This package has **ZERO dependencies** on:
- ❌ Express, React, or any UI framework
- ❌ Firebase, MongoDB, or any database
- ❌ HTTP clients (axios, fetch)
- ❌ Cloud services or external APIs
- ❌ Any external libraries (except dev dependencies for testing)

### ✅ **Clean Architecture Compliance**

1. **Dependency Rule**: All dependencies point inward
2. **Framework Independence**: No framework-specific code
3. **Testable**: Can run tests without external systems
4. **Business Rules**: Contains pure business logic
5. **Ports & Adapters**: Defines interfaces, doesn't implement them

### 🧪 **Testing**

```bash
# Run core tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### 📖 **Usage**

#### In Backend:
```javascript
import { User, CreateUserUseCase } from '@grocery-store/core';

// Use entities and use cases
const user = new User({ name: 'John', email: 'john@example.com' });
const createUserUseCase = new CreateUserUseCase(userRepository);
```

#### In Frontend:
```javascript
import { User, Product } from '@grocery-store/core';

// Use entities for validation and business logic
const user = new User({ name: 'John', email: 'john@example.com' });
const isValid = user.validate();
```

### 🔄 **Versioning**

This package follows semantic versioning:
- **Major**: Breaking changes to entities or use cases
- **Minor**: New use cases or entities (backward compatible)
- **Patch**: Bug fixes or internal improvements

### �� **Deployment**

This package is consumed by both frontend and backend applications. Changes to core will trigger deployments of dependent applications through CI/CD pipelines.
