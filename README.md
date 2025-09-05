# Grocery Store - Clean Architecture Boilerplate

A comprehensive boilerplate project following Clean Architecture principles with React frontend and Express backend, designed to be database-agnostic.

## 🏗️ Architecture Overview

This project implements Clean Architecture with clear separation of concerns:

### Backend (Express.js)
```
backend/
├── src/
│   ├── entities/           # Domain entities (business rules)
│   ├── interfaces/         # Contracts and abstractions
│   ├── use-cases/          # Application business logic
│   ├── services/           # Application services
│   ├── repositories/       # Data access layer
│   ├── controllers/        # Interface adapters
│   ├── middleware/         # Cross-cutting concerns
│   ├── routes/            # API routes
│   ├── config/            # Configuration
│   └── server.js          # Application entry point
```

### Frontend (React.js)
```
frontend/
├── src/
│   ├── entities/           # Domain entities
│   ├── interfaces/         # Contracts
│   ├── use-cases/          # Application logic
│   ├── services/           # API services
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── contexts/          # React contexts
│   └── utils/             # Utility functions
```

## 🚀 Features

- **Clean Architecture**: Clear separation of concerns with dependency inversion
- **Database Agnostic**: Easy to switch between MongoDB, PostgreSQL, MySQL, etc.
- **Type Safety**: Proper validation and error handling
- **Modern Stack**: React 18, Express.js, Vite, React Query
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication**: JWT-based authentication system
- **API Documentation**: RESTful API with proper error handling
- **Testing Ready**: Structure prepared for unit and integration tests

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (easily swappable)
- **JWT** - Authentication
- **Jest** - Testing framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (or your preferred database)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=3001
NODE_ENV=development
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_NAME=grocery_store
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🗄️ Database Configuration

The application is designed to be database-agnostic. To switch databases:

1. **MongoDB** (default):
   - Install MongoDB
   - Update `.env` with MongoDB connection string
   - The application will use Mongoose models

2. **PostgreSQL**:
   - Install PostgreSQL
   - Update `.env` with PostgreSQL connection string
   - Implement PostgreSQL repository classes

3. **MySQL**:
   - Install MySQL
   - Update `.env` with MySQL connection string
   - Implement MySQL repository classes

## 🏛️ Clean Architecture Layers

### 1. Entities (Domain Layer)
- Pure business objects
- No dependencies on external frameworks
- Contains business rules and validation

### 2. Use Cases (Application Layer)
- Application-specific business logic
- Orchestrates entities and repositories
- Independent of UI and database

### 3. Interface Adapters (Controllers, Presenters)
- Convert data between use cases and external world
- Handle HTTP requests/responses
- Format data for presentation

### 4. Frameworks & Drivers (Infrastructure)
- Database implementations
- Web framework setup
- External service integrations

## 🔧 API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/search` - Search products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `PATCH /api/products/:id/stock` - Update stock (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

## �� Testing

### Backend Testing
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Testing
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

## 📝 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_NAME=grocery_store
DB_URL=mongodb://localhost:27017/grocery_store

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start with PM2: `pm2 start src/server.js`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you have any questions or need help, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔄 Database Migration

To switch from one database to another:

1. Update the database configuration in `backend/src/config/database.js`
2. Implement new repository classes for your chosen database
3. Update the dependency injection container in `backend/src/container.js`
4. Update environment variables
5. Run database migrations if needed

The Clean Architecture design ensures that changing the database implementation doesn't affect your business logic or use cases.
