# Clean Architecture Enforcement

This document describes the Clean Architecture enforcement system implemented in this grocery store application.

## 🏗️ Architecture Overview

The application follows Clean Architecture principles with strict dependency rules:

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React/Next)  │    │   (Express)     │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │     Core Package     │
          │  (Business Logic)    │
          └──────────────────────┘
```

### Dependency Rule
- **Core** depends on nothing external (no frameworks, no I/O)
- **Backend/Frontend** depend on Core
- **Infrastructure** (DB, HTTP, etc.) is injected into Core via interfaces

## 🛡️ Enforcement Tools

### 1. Dependency Cruiser
Structural analysis tool that enforces dependency rules at build time.

**Configuration**: `.dependency-cruiser.cjs`

**Rules Enforced**:
- No circular dependencies
- Core cannot import backend/frontend
- Core cannot import frameworks (Express, React, etc.)
- Core cannot import Node.js I/O modules (fs, http, etc.)
- Entities cannot import use-cases/services/interfaces
- Use-cases cannot import infrastructure

**Run**: `npm run arch:check`

### 2. ESLint
Semantic analysis tool that catches architectural violations in code.

**Configuration**: `.eslintrc.cjs`

**Rules Enforced**:
- Bans framework imports in core
- Bans process.env usage in core
- Bans direct Date usage in core
- Enforces import path restrictions

**Run**: `npm run arch:lint`

### 3. Architecture Tests
Executable unit tests that verify architectural boundaries.

**Location**: `tests/architecture/layering.test.js`

**Tests**:
- Core files don't import infra/frameworks
- Entities don't import use-cases/services/interfaces
- Use-cases don't import infrastructure
- Core package has no runtime framework dependencies

**Run**: `npm run arch:test`

## 🚀 Quick Start

### Run All Architecture Checks
```bash
npm run arch:all
```

### Individual Checks
```bash
# Dependency analysis
npm run arch:check

# Linting
npm run arch:lint

# Architecture tests
npm run arch:test
```

## 📁 Directory Structure

```
grocery-store/
├── packages/core/           # Business logic (no external deps)
│   ├── entities/           # Domain entities
│   ├── use-cases/          # Application use cases
│   ├── interfaces/         # Ports/contracts
│   ├── services/           # Domain services
│   └── errors/             # Domain errors
├── backend/                # Infrastructure
│   ├── src/
│   │   ├── adapters/       # Interface adapters
│   │   ├── controllers/    # HTTP controllers
│   │   ├── repositories/   # Data access
│   │   └── services/       # Infrastructure services
├── frontend/               # User interface
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Application pages
│       └── hooks/          # React hooks
└── tests/architecture/     # Architecture tests
```

## 🔧 Common Violations & Fixes

### ❌ Direct Date Usage in Core
```javascript
// BAD: Direct Date usage
class Product {
  isExpired() {
    return new Date() > this.expiryDate;
  }
}
```

```javascript
// GOOD: Use dependency injection
class Product {
  constructor(clock) {
    this.clock = clock;
  }
  
  isExpired() {
    return this.clock.now() > this.expiryDate;
  }
}
```

### ❌ Framework Imports in Core
```javascript
// BAD: Framework import in core
import express from 'express';
```

```javascript
// GOOD: Define interface in core, implement in infrastructure
// In core/interfaces/IHttpServer.js
export class IHttpServer {
  listen(port) { throw new Error('Not implemented'); }
}

// In backend/adapters/ExpressHttpServer.js
import express from 'express';
import { IHttpServer } from '@grocery-store/core/interfaces/IHttpServer.js';

export class ExpressHttpServer extends IHttpServer {
  constructor() {
    super();
    this.app = express();
  }
  
  listen(port) {
    return this.app.listen(port);
  }
}
```

### ❌ Process.env in Core
```javascript
// BAD: Direct environment access
const config = {
  dbUrl: process.env.DATABASE_URL
};
```

```javascript
// GOOD: Inject configuration
class DatabaseService {
  constructor(config) {
    this.dbUrl = config.databaseUrl;
  }
}
```

## 🧪 Testing Architecture

### Clock Interface Example
```javascript
// In core/interfaces/IClock.js
export class IClock {
  now() { throw new Error('Not implemented'); }
}

// In backend/adapters/clock/SystemClock.js
export class SystemClock extends IClock {
  now() { return new Date(); }
}

// In tests
import { FakeClock } from './utils/FakeClock.js';
const clock = new FakeClock(new Date('2024-01-01'));
```

## 🚨 CI/CD Integration

The architecture checks are automatically run in CI/CD:

```yaml
# .github/workflows/clean-architecture.yml
- name: Architecture check
  run: npm run arch:check
  
- name: Lint
  run: npm run arch:lint
  
- name: Architecture tests
  run: npm run arch:test
```

## 📋 Checklist for New Features

When adding new features, ensure:

- [ ] Core entities have no external dependencies
- [ ] Use cases only depend on entities and interfaces
- [ ] Infrastructure implementations are in backend/frontend
- [ ] Time operations use IClock interface
- [ ] Configuration is injected, not accessed directly
- [ ] All architecture tests pass
- [ ] No circular dependencies exist
- [ ] Framework code is isolated to infrastructure layers

## 🔍 Debugging Architecture Issues

### Dependency Cruiser Output
```bash
# Get detailed dependency graph
npx depcruise --config .dependency-cruiser.cjs --output-type dot packages/core | dot -T svg > dependencies.svg
```

### ESLint Rule Disabling
```javascript
// Only disable rules with good reason and team approval
/* eslint-disable import/no-restricted-packages */
import express from 'express'; // Only in infrastructure layer
```

### Architecture Test Failures
Check the test output for specific file violations and fix the imports accordingly.

## 📚 Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Cruiser Documentation](https://github.com/sverweij/dependency-cruiser)
- [ESLint Import Plugin](https://github.com/import-js/eslint-plugin-import)
