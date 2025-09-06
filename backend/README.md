# Grocery Store Backend API

A robust grocery shopping application backend built with Node.js, Express, and PostgreSQL following Clean Architecture principles.

## 🚀 Features

- **User Management**: Admin, Store Manager, and Customer roles
- **Product Management**: Full CRUD operations with search and filtering
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with optimized queries and indexing
- **Security**: Rate limiting, CORS, Helmet security headers
- **Clean Architecture**: Separation of concerns with entities, repositories, and controllers

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

### Option 1: Quick Setup (Recommended)
```bash
./setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up PostgreSQL:**
```bash
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE grocery_store;"
sudo -u postgres psql -c "CREATE USER grocery_user WITH PASSWORD 'grocery_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE grocery_store TO grocery_user;"

# Initialize database schema
PGPASSWORD=grocery_password psql -h localhost -U grocery_user -d grocery_store -f src/database/init.sql
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server:**
```bash
npm run dev
```

## 🐳 Docker Setup

```bash
# Start PostgreSQL and Backend
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "customer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Products

#### Get All Products
```http
GET /api/products?page=1&limit=20&category=uuid&featured=true&inStock=true
```

#### Search Products
```http
GET /api/products/search?q=organic milk&page=1&limit=20
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Store Manager/Admin)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Organic Milk",
  "description": "Fresh organic milk from local farms",
  "price": 4.99,
  "categoryId": "uuid",
  "sku": "MILK001",
  "stock": 100,
  "unit": "liter"
}
```

#### Update Product
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 5.99
}
```

#### Update Stock
```http
PUT /api/products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 150
}
```

## 🔐 User Roles

### Admin
- Full access to all operations
- Can manage users, products, categories
- Can approve store manager requests

### Store Manager
- Can create and manage products
- Can view orders and inventory
- Cannot manage categories (requires admin approval)

### Customer
- Can view products and place orders
- Can manage their own profile
- Can add products to cart

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `name` (VARCHAR)
- `password_hash` (VARCHAR)
- `role` (ENUM: admin, store_manager, customer)
- `phone`, `address` (Optional)
- `is_email_verified`, `is_phone_verified` (Boolean)
- `login_attempts`, `locked_until` (Security fields)
- `created_at`, `updated_at` (Timestamps)

### Products Table
- `id` (UUID, Primary Key)
- `name`, `description` (VARCHAR, TEXT)
- `price` (DECIMAL)
- `category_id` (UUID, Foreign Key)
- `sku` (VARCHAR, Unique)
- `stock`, `min_stock`, `max_stock` (INTEGER)
- `images` (TEXT Array)
- `tags` (TEXT Array)
- `nutrition_info` (JSONB)
- `dimensions` (JSONB)
- `is_visible`, `is_featured` (Boolean)
- `discount_price`, `discount_start_date`, `discount_end_date`
- `created_at`, `updated_at` (Timestamps)

### Categories Table
- `id` (UUID, Primary Key)
- `name`, `description` (VARCHAR, TEXT)
- `slug` (VARCHAR, Unique)
- `parent_id` (UUID, Self-referencing for hierarchy)
- `is_visible` (Boolean)
- `created_at`, `updated_at` (Timestamps)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Performance Features

- **Database Indexing**: Optimized indexes for common queries
- **Full-Text Search**: PostgreSQL full-text search for products
- **Connection Pooling**: Efficient database connection management
- **Rate Limiting**: Protection against abuse
- **JSON Support**: Flexible product attributes storage

## 🔧 Development

### Project Structure
```
src/
├── config/          # Database and app configuration
├── controllers/     # HTTP request handlers
├── entities/        # Domain models
├── middleware/      # Express middleware
├── repositories/    # Data access layer
├── routes/          # API route definitions
├── services/        # Business logic
└── server.js        # Application entry point
```

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grocery_store
DB_USER=grocery_user
DB_PASSWORD=grocery_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment

### Production Checklist
- [ ] Change JWT secret
- [ ] Set up proper database credentials
- [ ] Configure CORS for production domain
- [ ] Set up SSL/HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Production
```bash
# Build production image
docker build -t grocery-backend .

# Run with production environment
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e JWT_SECRET=your-production-secret \
  grocery-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@grocerystore.com or create an issue in the repository.

---

**Default Admin Credentials:**
- Email: admin@grocery.com
- Password: admin123
