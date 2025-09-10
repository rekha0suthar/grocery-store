# Grocery Store Frontend

A modern React frontend for the Grocery Store application built with Clean Architecture principles.

## Features

- **React 18** with modern hooks and functional components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Axios** for API communication

## Architecture

The frontend follows Clean Architecture principles:

- **Presentation Layer**: React components and pages
- **Application Layer**: Redux slices and services
- **Domain Layer**: Core business logic from `@grocery-store/core`
- **Infrastructure Layer**: API services and external integrations

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── UI/             # Basic UI components (Button, Input, Card, etc.)
│   └── Layout/         # Layout components (Header, Sidebar, etc.)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── products/       # Product-related pages
│   ├── categories/     # Category pages
│   ├── admin/          # Admin pages
│   └── requests/       # Request pages
├── store/              # Redux store configuration
│   └── slices/         # Redux slices for different features
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
└── config/             # Configuration files
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the environment variables in `.env` file.

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Role-based access control

### Product Management
- Browse products with search and filtering
- Product details with image support
- Shopping cart functionality
- Admin product management (CRUD operations)

### Category Management
- Category browsing with tree structure
- Admin category management
- Product categorization

### Request System
- Store manager request submission
- Admin request approval/rejection
- Request status tracking

### Admin Dashboard
- Overview statistics
- Quick actions
- Recent activity monitoring

## State Management

The application uses Redux Toolkit for state management with the following slices:

- **authSlice**: User authentication and profile
- **productSlice**: Product data and operations
- **categorySlice**: Category data and operations
- **cartSlice**: Shopping cart state
- **requestSlice**: Request management
- **uiSlice**: UI state (modals, notifications, etc.)

## API Integration

The frontend communicates with the backend through service layers:

- **authService**: Authentication operations
- **productService**: Product CRUD operations
- **categoryService**: Category management
- **requestService**: Request handling

## Styling

The application uses Tailwind CSS for styling with:

- Custom color palette
- Responsive design
- Component-based styling
- Custom animations and transitions

## Testing

Run tests:
```bash
npm test
```

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Write tests for new features
4. Follow the Clean Architecture principles
5. Use meaningful commit messages

## License

This project is part of the Grocery Store application.
