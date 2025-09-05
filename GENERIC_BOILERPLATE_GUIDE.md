# Generic Clean Architecture Boilerplate Guide

## 🎯 What Makes This Boilerplate Truly Generic

This boilerplate addresses all your concerns:

### ✅ **No Project-Specific Code**
- **No Product entities** - Only generic BaseEntity
- **No User-specific logic** - Flexible authentication system
- **No Business domain** - Pure architectural foundation

### ✅ **Device Independent**
- **Responsive design** - Works on mobile, tablet, desktop
- **Touch support** - Detects and adapts to touch devices
- **Orientation aware** - Handles portrait/landscape changes
- **Breakpoint system** - Responsive breakpoints

### ✅ **ES Modules**
- **Modern JavaScript** - Uses import/export syntax
- **Tree shaking** - Better bundle optimization
- **Type safety** - Better IDE support

### ✅ **Flexible Authentication**
- **Multiple providers** - JWT, Session, OAuth
- **Configurable** - Easy to switch between methods
- **Extensible** - Add custom authentication methods

## 🏗️ Architecture Overview

```
generic-boilerplate/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── entities/          # Generic BaseEntity only
│   │   ├── interfaces/        # Contracts (IAuthProvider, IRepository)
│   │   ├── use-cases/         # Generic BaseUseCase
│   │   ├── services/          # Generic BaseService
│   │   ├── repositories/      # Generic BaseRepository
│   │   ├── controllers/       # Generic BaseController
│   │   ├── middleware/        # Flexible AuthMiddleware
│   │   ├── plugins/           # Auth providers (JWT, Session, OAuth)
│   │   ├── config/            # Flexible AppConfig
│   │   └── routes/            # Generic route setup
│   └── package.json           # ES modules enabled
├── frontend/                   # React.js application
│   ├── src/
│   │   ├── entities/          # Generic BaseEntity
│   │   ├── interfaces/        # Contracts
│   │   ├── use-cases/         # Generic BaseUseCase
│   │   ├── services/          # Generic ApiService
│   │   ├── components/        # Generic UI components
│   │   ├── hooks/             # Generic custom hooks
│   │   ├── contexts/          # Generic contexts
│   │   ├── config/            # Device-independent AppConfig
│   │   └── plugins/           # Feature plugins
│   └── package.json           # ES modules enabled
└── examples/                   # Project examples
    ├── ecommerce/             # E-commerce implementation
    ├── blog/                  # Blog platform implementation
    ├── task-manager/          # Task management implementation
    └── social-media/          # Social media implementation
```

## �� How to Use for Different Projects

### 1. **E-commerce Store**

#### Backend Implementation:
```javascript
// entities/Product.js
import { BaseEntity } from '../entities/BaseEntity.js';

export class Product extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.name = data.name || '';
    this.price = data.price || 0;
    this.category = data.category || '';
    this.stock = data.stock || 0;
  }

  isValid() {
    return this.name && this.price >= 0 && this.stock >= 0;
  }

  isInStock() {
    return this.stock > 0;
  }
}

// entities/Order.js
export class Order extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.userId = data.userId || '';
    this.items = data.items || [];
    this.total = data.total || 0;
    this.status = data.status || 'pending';
  }

  isValid() {
    return this.userId && this.items.length > 0;
  }

  calculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return this.total;
  }
}
```

#### Frontend Implementation:
```javascript
// components/ProductCard.jsx
import { Product } from '../entities/Product.js';

export const ProductCard = ({ product, onAddToCart }) => {
  const productEntity = product instanceof Product ? product : Product.fromJSON(product);
  
  return (
    <div className="product-card">
      <h3>{productEntity.name}</h3>
      <p>${productEntity.price}</p>
      <button 
        onClick={() => onAddToCart(productEntity)}
        disabled={!productEntity.isInStock()}
      >
        Add to Cart
      </button>
    </div>
  );
};
```

### 2. **Blog Platform**

#### Backend Implementation:
```javascript
// entities/Post.js
import { BaseEntity } from '../entities/BaseEntity.js';

export class Post extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.title = data.title || '';
    this.content = data.content || '';
    this.authorId = data.authorId || '';
    this.category = data.category || '';
    this.published = data.published || false;
  }

  isValid() {
    return this.title && this.content && this.authorId;
  }

  publish() {
    this.published = true;
    this.updateTimestamp();
  }

  unpublish() {
    this.published = false;
    this.updateTimestamp();
  }
}

// entities/Comment.js
export class Comment extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.postId = data.postId || '';
    this.authorId = data.authorId || '';
    this.content = data.content || '';
    this.approved = data.approved || false;
  }

  isValid() {
    return this.postId && this.authorId && this.content;
  }
}
```

### 3. **Task Management App**

#### Backend Implementation:
```javascript
// entities/Task.js
import { BaseEntity } from '../entities/BaseEntity.js';

export class Task extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    this.title = data.title || '';
    this.description = data.description || '';
    this.assigneeId = data.assigneeId || '';
    this.projectId = data.projectId || '';
    this.status = data.status || 'todo';
    this.priority = data.priority || 'medium';
    this.dueDate = data.dueDate || null;
  }

  isValid() {
    return this.title && this.assigneeId && this.projectId;
  }

  isOverdue() {
    return this.dueDate && new Date() > new Date(this.dueDate);
  }

  complete() {
    this.status = 'completed';
    this.updateTimestamp();
  }
}
```

## 🔐 Authentication Examples

### 1. **JWT Authentication**
```javascript
// .env
AUTH_PROVIDER=jwt
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

// Usage
import { JWTAuthProvider } from './plugins/auth/JWTAuthProvider.js';
const authProvider = new JWTAuthProvider();
```

### 2. **Session Authentication**
```javascript
// .env
AUTH_PROVIDER=session
SESSION_SECRET=your-session-secret
SESSION_MAX_AGE=86400000

// Usage
import { SessionAuthProvider } from './plugins/auth/SessionAuthProvider.js';
const authProvider = new SessionAuthProvider();
```

### 3. **OAuth Authentication**
```javascript
// .env
AUTH_PROVIDER=oauth
OAUTH_PROVIDER=google
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret

// Usage
import { OAuthProvider } from './plugins/auth/OAuthProvider.js';
const authProvider = new OAuthProvider({ provider: 'google' });
```

## 📱 Device Independence Examples

### 1. **Responsive Components**
```javascript
// components/ResponsiveLayout.jsx
import { appConfig } from '../config/appConfig.js';

export const ResponsiveLayout = ({ children }) => {
  const isMobile = appConfig.isMobile();
  const isTablet = appConfig.isTablet();
  
  return (
    <div className={`layout ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      {children}
    </div>
  );
};
```

### 2. **Touch Support**
```javascript
// components/TouchButton.jsx
import { appConfig } from '../config/appConfig.js';

export const TouchButton = ({ onClick, children }) => {
  const hasTouch = appConfig.get('device.touchSupport');
  
  return (
    <button 
      onClick={onClick}
      className={hasTouch ? 'touch-button' : 'click-button'}
    >
      {children}
    </button>
  );
};
```

### 3. **Orientation Awareness**
```javascript
// hooks/useOrientation.js
import { useState, useEffect } from 'react';
import { appConfig } from '../config/appConfig.js';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState(appConfig.get('device.orientation'));
  
  useEffect(() => {
    const handleResize = () => {
      appConfig.updateDeviceConfig();
      setOrientation(appConfig.get('device.orientation'));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return orientation;
};
```

## 🚀 Quick Start for Any Project

### 1. **Copy the Generic Boilerplate**
```bash
cp -r generic-boilerplate my-new-project
cd my-new-project
```

### 2. **Configure for Your Project**
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your project settings

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your project settings
```

### 3. **Create Your Entities**
```javascript
// backend/src/entities/YourEntity.js
import { BaseEntity } from './BaseEntity.js';

export class YourEntity extends BaseEntity {
  constructor(data = {}) {
    super(data.id);
    // Add your specific properties
  }
  
  isValid() {
    // Add your validation logic
  }
}
```

### 4. **Configure Authentication**
```bash
# .env
AUTH_PROVIDER=jwt  # or session, oauth
JWT_SECRET=your-secret-key
```

### 5. **Start Development**
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## 🎯 Benefits of This Generic Approach

### ✅ **True Reusability**
- No project-specific code
- Pure architectural foundation
- Easy to adapt to any domain

### ✅ **Device Independence**
- Works on all devices
- Responsive by default
- Touch and mouse support

### ✅ **Modern Standards**
- ES modules throughout
- Modern JavaScript features
- Better performance

### ✅ **Flexible Authentication**
- Multiple auth methods
- Easy to switch
- Extensible system

### ✅ **Configuration Driven**
- Environment-based config
- Feature flags
- Easy customization

This generic boilerplate provides a solid foundation that can be adapted to any project while maintaining clean architecture principles and modern development practices.
