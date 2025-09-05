# Clean Architecture Implementation Guide

## 🏗️ Architecture Overview

This boilerplate implements Clean Architecture principles with clear separation of concerns and dependency inversion. The architecture is designed to be:

- **Database Agnostic**: Easy to switch between MongoDB, PostgreSQL, MySQL, etc.
- **Framework Independent**: Business logic is independent of Express.js and React
- **Testable**: Each layer can be tested in isolation
- **Maintainable**: Clear boundaries and responsibilities
- **Scalable**: Easy to add new features and modify existing ones

## 📁 Project Structure

```
grocery-store/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── entities/        # Domain entities (business rules)
│   │   ├── interfaces/      # Contracts and abstractions
│   │   ├── use-cases/       # Application business logic
│   │   ├── services/        # Application services
│   │   ├── repositories/    # Data access layer
│   │   ├── controllers/     # Interface adapters
│   │   ├── middleware/      # Cross-cutting concerns
│   │   ├── routes/          # API routes
│   │   ├── config/          # Configuration
│   │   └── server.js        # Application entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/                # React.js application
│   ├── src/
│   │   ├── entities/        # Domain entities
│   │   ├── interfaces/      # Contracts
│   │   ├── use-cases/       # Application logic
│   │   ├── services/        # API services
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Docker orchestration
├── README.md               # Project documentation
└── ARCHITECTURE.md         # This file
```

## 🔄 Clean Architecture Layers

### 1. Entities (Domain Layer)
**Location**: `entities/`
**Purpose**: Core business objects with business rules

**Backend Examples**:
- `User.js` - User entity with validation and business rules
- `Product.js` - Product entity with stock management logic

**Frontend Examples**:
- `User.js` - User entity with display logic
- `Product.js` - Product entity with formatting methods

**Key Principles**:
- No dependencies on external frameworks
- Contains pure business logic
- Independent of database or UI concerns

### 2. Use Cases (Application Layer)
**Location**: `use-cases/`
**Purpose**: Application-specific business logic

**Backend Examples**:
- `CreateUserUseCase.js` - Handles user creation logic
- `GetUserUseCase.js` - Handles user retrieval logic

**Frontend Examples**:
- `GetProductsUseCase.js` - Handles product fetching logic
- `SearchProductsUseCase.js` - Handles product search logic

**Key Principles**:
- Orchestrates entities and repositories
- Independent of UI and database
- Contains application-specific business rules

### 3. Interface Adapters (Controllers, Presenters)
**Location**: `controllers/`, `components/`, `pages/`
**Purpose**: Convert data between use cases and external world

**Backend Examples**:
- `UserController.js` - Handles HTTP requests/responses
- `ProductController.js` - Manages product API endpoints

**Frontend Examples**:
- `ProductCard.jsx` - Displays product information
- `HomePage.jsx` - Main page component

**Key Principles**:
- Handles external communication
- Formats data for presentation
- Depends on use cases, not entities directly

### 4. Frameworks & Drivers (Infrastructure)
**Location**: `repositories/`, `services/`, `config/`
**Purpose**: External concerns like database, web framework

**Backend Examples**:
- `UserRepository.js` - MongoDB implementation
- `ApiService.js` - HTTP client implementation
- `server.js` - Express.js setup

**Frontend Examples**:
- `ApiService.js` - Axios HTTP client
- `main.jsx` - React application setup

**Key Principles**:
- Implements interfaces defined in inner layers
- Handles external dependencies
- Can be easily swapped

## 🔌 Dependency Flow

```
External → Controllers → Use Cases → Entities
    ↓           ↓           ↓         ↓
  Database ← Repositories ← Services ← Business Rules
```

### Dependency Rules:
1. **Entities** depend on nothing
2. **Use Cases** depend only on entities and interfaces
3. **Controllers** depend on use cases and interfaces
4. **Infrastructure** implements interfaces and depends on inner layers

## 🗄️ Database Independence

### Current Implementation (MongoDB)
```javascript
// backend/src/container.js
const userSchema = new mongoose.Schema({...});
const UserModel = mongoose.model('User', userSchema);
```

### Switching to PostgreSQL
1. Install PostgreSQL driver: `npm install pg`
2. Create new repository implementation
3. Update container configuration
4. No changes needed in use cases or entities

### Switching to MySQL
1. Install MySQL driver: `npm install mysql2`
2. Create new repository implementation
3. Update container configuration
4. No changes needed in use cases or entities

## 🧪 Testing Strategy

### Unit Tests
- **Entities**: Test business rules and validation
- **Use Cases**: Test application logic with mocked dependencies
- **Controllers**: Test request/response handling

### Integration Tests
- **Repositories**: Test database operations
- **Services**: Test API communication
- **End-to-End**: Test complete user workflows

### Test Structure
```
tests/
├── unit/
│   ├── entities/
│   ├── use-cases/
│   └── controllers/
├── integration/
│   ├── repositories/
│   └── services/
└── e2e/
    └── workflows/
```

## 🚀 Adding New Features

### 1. Define Entity
```javascript
// entities/Order.js
class Order extends BaseEntity {
  constructor(data) {
    super(data.id);
    this.userId = data.userId;
    this.items = data.items;
    this.total = data.total;
  }
  
  isValid() {
    return this.userId && this.items.length > 0;
  }
}
```

### 2. Create Repository Interface
```javascript
// interfaces/IOrderRepository.js
class IOrderRepository extends IRepository {
  async findByUserId(userId) {
    throw new Error('findByUserId method must be implemented');
  }
}
```

### 3. Implement Repository
```javascript
// repositories/OrderRepository.js
class OrderRepository extends BaseRepository {
  async findByUserId(userId) {
    return await this.model.find({ userId });
  }
}
```

### 4. Create Use Case
```javascript
// use-cases/CreateOrderUseCase.js
class CreateOrderUseCase extends BaseUseCase {
  async execute(input) {
    // Business logic here
  }
}
```

### 5. Create Service
```javascript
// services/OrderService.js
class OrderService {
  constructor(orderRepository) {
    this.createOrderUseCase = new CreateOrderUseCase(orderRepository);
  }
}
```

### 6. Create Controller
```javascript
// controllers/OrderController.js
class OrderController extends BaseController {
  createOrder = this.asyncHandler(async (req, res) => {
    // Handle HTTP request
  });
}
```

### 7. Add Routes
```javascript
// routes/orderRoutes.js
router.post('/', orderController.createOrder);
```

## 🔧 Configuration Management

### Environment Variables
- **Development**: `.env` files
- **Production**: Environment variables
- **Docker**: Docker Compose environment

### Database Configuration
- **Type**: Configurable via `DB_TYPE`
- **Connection**: Handled by `databaseConnection.js`
- **Models**: Defined in `container.js`

## 📊 Monitoring and Logging

### Backend Logging
- **Morgan**: HTTP request logging
- **Console**: Application logs
- **Error Handling**: Centralized error management

### Frontend Logging
- **React Query**: API call logging
- **Console**: Development logging
- **Error Boundaries**: Error handling

## 🔒 Security Considerations

### Backend Security
- **Helmet**: Security headers
- **CORS**: Cross-origin configuration
- **Rate Limiting**: Request throttling
- **JWT**: Authentication tokens
- **Input Validation**: Request validation

### Frontend Security
- **HTTPS**: Secure communication
- **Token Storage**: Secure token handling
- **Input Sanitization**: XSS prevention
- **CSP**: Content Security Policy

## �� Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Docker
docker-compose up -d

# Manual
npm run build && npm start
```

## 📈 Performance Optimization

### Backend
- **Connection Pooling**: Database connections
- **Caching**: Redis integration ready
- **Compression**: Gzip compression
- **Rate Limiting**: Request throttling

### Frontend
- **Code Splitting**: Lazy loading
- **Caching**: React Query caching
- **Optimization**: Vite build optimization
- **CDN**: Static asset delivery

## 🔄 Migration Strategy

### Database Migration
1. Create migration scripts
2. Update repository implementations
3. Test with new database
4. Deploy with zero downtime

### Framework Migration
1. Update infrastructure layer
2. Keep use cases unchanged
3. Update controllers/adapters
4. Test thoroughly

This architecture ensures that your application remains maintainable, testable, and adaptable to changing requirements while following Clean Architecture principles.
