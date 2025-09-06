# Online Grocery Shopping Application - Clean Architecture

## 🏪 Application Overview

This is a comprehensive online grocery shopping application built with Clean Architecture principles, supporting three user types with specific business rules and database-independent design.

## 👥 User Roles & Permissions

### 1. **Admin** (Single User)
- **Full System Control**: Complete access to all features
- **User Management**: Approve/reject store manager requests
- **Category Management**: Create, modify, delete categories
- **Product Management**: Full product CRUD operations
- **Order Management**: View and manage all orders
- **System Configuration**: Manage system settings

### 2. **Store Manager** (Multiple Users)
- **Request-Based Access**: Must be approved by admin to login
- **Product Management**: Add new products (limited to existing categories)
- **Category Requests**: Request new categories or category modifications
- **Order Management**: View and manage orders
- **Inventory Management**: Update product stock and details

### 3. **Customer** (Multiple Users)
- **Product Browsing**: View all available products
- **Search & Filter**: Search products by name, category, price
- **Shopping Cart**: Add/remove items, manage quantities
- **Order Placement**: Place orders with delivery details
- **Order Tracking**: View order status and history

## 🏗️ Clean Architecture Structure

```
grocery-app/
├── backend/
│   ├── src/
│   │   ├── entities/              # Domain Layer
│   │   │   ├── BaseEntity.js      # Generic base entity
│   │   │   ├── User.js            # User entity with role-based logic
│   │   │   ├── Category.js        # Product category entity
│   │   │   ├── Product.js         # Product entity with inventory logic
│   │   │   ├── Cart.js            # Shopping cart entity
│   │   │   ├── Order.js           # Order entity with status management
│   │   │   └── Request.js         # Request entity for approvals
│   │   ├── interfaces/            # Contracts Layer
│   │   │   ├── IRepository.js     # Generic repository interface
│   │   │   ├── IUserRepository.js # User-specific repository interface
│   │   │   ├── IProductRepository.js # Product-specific repository interface
│   │   │   ├── ICategoryRepository.js # Category repository interface
│   │   │   ├── ICartRepository.js # Cart repository interface
│   │   │   ├── IOrderRepository.js # Order repository interface
│   │   │   └── IRequestRepository.js # Request repository interface
│   │   ├── use-cases/             # Application Layer
│   │   │   ├── user/              # User-related use cases
│   │   │   ├── product/           # Product-related use cases
│   │   │   ├── category/          # Category-related use cases
│   │   │   ├── cart/              # Cart-related use cases
│   │   │   ├── order/             # Order-related use cases
│   │   │   └── request/           # Request-related use cases
│   │   ├── services/              # Application Services
│   │   ├── repositories/          # Infrastructure Layer
│   │   ├── controllers/           # Interface Adapters
│   │   ├── middleware/            # Cross-cutting Concerns
│   │   ├── config/                # Configuration
│   │   └── routes/                # API Routes
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── entities/              # Domain Layer (Frontend)
│   │   ├── interfaces/            # Contracts
│   │   ├── use-cases/             # Application Logic
│   │   ├── services/              # API Services
│   │   ├── components/            # UI Components
│   │   ├── pages/                 # Page Components
│   │   ├── hooks/                 # Custom Hooks
│   │   ├── contexts/              # React Contexts
│   │   └── utils/                 # Utility Functions
│   └── package.json
└── docs/                          # Documentation
```

## 📊 Entity Relationships

### Core Entities

1. **User Entity**
   - Role-based permissions (admin, store_manager, customer)
   - Account management (login attempts, verification status)
   - Profile information (name, email, phone, address)

2. **Category Entity**
   - Hierarchical structure (parent-child relationships)
   - Admin-only management
   - Visibility and sorting controls

3. **Product Entity**
   - Rich product information (price, stock, images, nutrition)
   - Inventory management (stock levels, expiry dates)
   - Discount and promotion support
   - Store manager can add, admin can manage all

4. **Cart Entity**
   - Customer-specific shopping cart
   - Item management (add, remove, update quantities)
   - Price calculations and discount application

5. **Order Entity**
   - Complete order lifecycle management
   - Status tracking (pending → confirmed → processing → shipped → delivered)
   - Payment and delivery information

6. **Request Entity**
   - Store manager approval requests
   - Category creation/modification requests
   - Admin review and approval workflow

## 🔄 Business Workflows

### 1. Store Manager Onboarding
```
Store Manager Registration → Admin Review → Approval/Rejection → Login Access
```

### 2. Product Management
```
Store Manager: Add Product → Admin: Review/Approve → Product Available
Admin: Direct Product Management (Create/Update/Delete)
```

### 3. Category Management
```
Store Manager: Request New Category → Admin: Review → Approval/Rejection
Admin: Direct Category Management
```

### 4. Order Processing
```
Customer: Add to Cart → Place Order → Payment → Processing → Shipping → Delivery
```

## 🗄️ Database Independence

### Repository Pattern Implementation
- **Interface-Based**: All repositories implement interfaces
- **Database Agnostic**: Easy to switch between MongoDB, PostgreSQL, MySQL, etc.
- **Consistent API**: Same methods across all database implementations

### Supported Databases
- **MongoDB**: Document-based storage
- **PostgreSQL**: Relational database
- **MySQL**: Relational database
- **SQLite**: Lightweight database
- **Any Other**: Easy to add new implementations

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)
- **Admin**: Full system access
- **Store Manager**: Limited product management, category requests
- **Customer**: Shopping and order management

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Account Locking**: Protection against brute force attacks
- **Email/Phone Verification**: Account verification system

## 🛒 Key Features

### For Customers
- **Product Discovery**: Browse, search, and filter products
- **Shopping Cart**: Add items, manage quantities, apply discounts
- **Order Management**: Place orders, track status, view history
- **User Profile**: Manage personal information and addresses

### For Store Managers
- **Product Management**: Add new products to existing categories
- **Inventory Control**: Update stock levels and product details
- **Category Requests**: Request new categories or modifications
- **Order Processing**: View and manage customer orders

### For Admins
- **User Management**: Approve store manager requests
- **Category Management**: Create, modify, delete categories
- **Product Oversight**: Full product management capabilities
- **System Administration**: Manage all aspects of the system

## 🚀 API Endpoints Structure

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin/store manager)
- `PUT /api/products/:id` - Update product (admin/store manager)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin/store manager)

### Requests
- `GET /api/requests` - Get requests (admin only)
- `POST /api/requests` - Create request
- `PUT /api/requests/:id/approve` - Approve request (admin only)
- `PUT /api/requests/:id/reject` - Reject request (admin only)

## 🧪 Testing Strategy

### Unit Tests
- **Entities**: Test business rules and validation
- **Use Cases**: Test application logic with mocked dependencies
- **Controllers**: Test request/response handling

### Integration Tests
- **Repositories**: Test database operations
- **Services**: Test API communication
- **End-to-End**: Test complete user workflows

### Test Coverage
- **Backend**: 90%+ code coverage
- **Frontend**: 80%+ code coverage
- **API**: 100% endpoint coverage

## 🚀 Deployment & CI/CD

### Development Workflow
1. **Feature Development**: Create feature branches
2. **Code Review**: Pull request reviews
3. **Testing**: Automated tests on PR
4. **Deployment**: Automated deployment to staging/production

### Environment Configuration
- **Development**: Local development setup
- **Staging**: Testing environment
- **Production**: Live application environment

## 📱 Frontend Architecture

### Technology Stack
- **React 18**: Modern UI library
- **TypeScript**: Type safety
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling
- **Axios**: HTTP client

### Component Structure
- **Pages**: Route-level components
- **Components**: Reusable UI components
- **Hooks**: Custom business logic hooks
- **Contexts**: Global state management
- **Services**: API communication layer

## 🔧 Configuration Management

### Environment Variables
- **Database**: Connection strings and credentials
- **Authentication**: JWT secrets and configuration
- **API**: Base URLs and endpoints
- **Features**: Feature flags and toggles

### Database Configuration
- **Type**: Configurable via environment variables
- **Connection**: Handled by repository implementations
- **Migrations**: Database schema management

## 📈 Performance & Scalability

### Backend Optimization
- **Caching**: Redis for session and data caching
- **Database Indexing**: Optimized queries
- **API Rate Limiting**: Protection against abuse
- **Connection Pooling**: Efficient database connections

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed and responsive images
- **Caching**: Browser and service worker caching
- **Bundle Optimization**: Minimized JavaScript bundles

## 🔒 Security Considerations

### Data Protection
- **Input Validation**: Server-side validation
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based protection

### Authentication Security
- **Password Hashing**: bcrypt with salt
- **JWT Security**: Secure token generation
- **Session Management**: Secure session handling
- **Account Locking**: Brute force protection

## 📚 Documentation

### API Documentation
- **OpenAPI/Swagger**: Interactive API documentation
- **Postman Collection**: API testing collection
- **Code Examples**: Usage examples for all endpoints

### Development Documentation
- **Setup Guide**: Local development setup
- **Architecture Guide**: System architecture explanation
- **Deployment Guide**: Production deployment instructions
- **Contributing Guide**: Development contribution guidelines

This architecture provides a solid foundation for a scalable, maintainable, and secure online grocery shopping application that can easily adapt to different business requirements and database technologies.
