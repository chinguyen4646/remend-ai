# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remend AI is a full-stack monorepo containing:

- **api**: AdonisJS 6 backend API with PostgreSQL
- **mobile-app**: Expo/React Native mobile application with NativeWind (TailwindCSS)

## Development Commands

### Root Level

```bash
# Run both API and mobile app in development mode
npm run dev

# Run API and mobile app with iOS simulator
npm run dev-i
```

### First Time Setup

1. **Backend Setup**:

```bash
cd api
cp .env.example .env
# Edit .env and add your database credentials
node ace generate:key  # Add APP_KEY to .env
npm install
node ace migration:run
npm run dev  # Should run on http://localhost:3333
```

2. **Frontend Setup**:

```bash
cd mobile-app
npm install
# .env already configured with EXPO_PUBLIC_API_URL=http://localhost:3333
npm start  # Should run on http://localhost:8081
```

### API (api)

```bash
cd api

# Development server with hot module reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm run test

# Run specific test suite
node ace test --suite=unit
node ace test --suite=functional

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Database migrations
node ace migration:run
node ace migration:rollback
node ace migration:fresh

# Generate app key (required for .env)
node ace generate:key
```

### Mobile App (mobile-app)

```bash
cd mobile-app

# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Architecture

### Backend (AdonisJS 6)

**Framework**: AdonisJS 6 with TypeScript ESM modules

**Database**: PostgreSQL with Lucid ORM

**Authentication**: Token-based authentication using `@adonisjs/auth` with access tokens

- Default guard: `api` (token-based)
- User model: `#models/user` with email/password authentication
- Password hashing: scrypt via hash service
- Access tokens stored in database via `DbAccessTokensProvider`

**Middleware Stack**:

- Server middleware (runs on all requests):
  - `container_bindings_middleware`: Request-scoped container bindings
  - `force_json_response_middleware`: Forces JSON responses
  - CORS middleware
- Router middleware (runs on matched routes):
  - Body parser
  - Auth initialization
- Named middleware:
  - `auth`: Requires authenticated user

**Module Imports**: Uses TypeScript path aliases with `#` prefix:

- `#controllers/*` → `./app/controllers/*.js`
- `#models/*` → `./app/models/*.js`
- `#middleware/*` → `./app/middleware/*.js`
- `#validators/*` → `./app/validators/*.js`
- `#services/*` → `./app/services/*.js`
- `#config/*` → `./config/*.js`
- etc.

**Project Structure**:

```
api/
├── app/
│   ├── exceptions/        # Exception handlers
│   ├── middleware/        # HTTP middleware
│   └── models/           # Lucid ORM models
├── bin/                  # Entry points (server, console, test)
├── config/               # Configuration files
├── database/
│   └── migrations/       # Database migrations
├── start/
│   ├── routes.ts         # Route definitions
│   ├── kernel.ts         # Middleware registration
│   └── env.ts           # Environment validation
└── tests/               # Test suites (unit, functional)
```

**Hot Module Reload**: Configured for controllers and middleware (see `hotHook` in package.json)

**Testing**: Japa test runner with:

- Unit tests: `tests/unit/**/*.spec.ts` (2s timeout)
- Functional tests: `tests/functional/**/*.spec.ts` (30s timeout)

### Mobile App (Expo/React Native)

**Framework**: Expo SDK 54 with React Native 0.81.4

**Styling**: NativeWind v4 (TailwindCSS for React Native)

- Babel configured with `jsxImportSource: "nativewind"`
- NativeWind babel plugin enabled

**React Version**: React 19.1.0

**New Architecture**: Enabled (`newArchEnabled: true` in app.json)

**Entry Point**: `index.ts` → `App.tsx`

**Platforms**: iOS, Android, Web support configured

## Environment Setup

### API Environment Variables

Create `api/.env` from `.env.example`:

```
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=<generate with: node ace generate:key>
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_DATABASE=<your-db-name>
```

### Database Setup

1. Ensure PostgreSQL is running locally
2. Create a database matching `DB_DATABASE` in `.env`
3. Run migrations: `cd api && node ace migration:run`

## Key Implementation Notes

- When adding new routes, edit `api/start/routes.ts`
- Protected routes should use `.use(middleware.auth())` from `#start/kernel`
- User model has `fullName`, `email`, and `password` fields
- Migrations exist for `users` and `access_tokens` tables
- The API forces all responses to JSON format via middleware
- NativeWind styles use Tailwind class names (e.g., `className="flex-1 bg-white"`)

## Authentication System

**Backend (AdonisJS)**:

- Auth endpoints at `/api/auth/*`
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user
  - `GET /api/auth/me` - Get authenticated user (protected)
  - `POST /api/auth/logout` - Logout user (protected)
- Controller: `api/app/controllers/auth_controller.ts`
- Validators: `api/app/validators/auth.ts`
- Token-based authentication using Bearer tokens

**Frontend (React Native)**:

- Auth state management: Zustand store at `src/stores/authStore.ts`
- API client: Axios with auto token injection at `src/api/client.ts`
- Auth API wrapper: `src/api/auth.ts`
- Screens: `LoginScreen`, `RegisterScreen`, `HomeScreen`
- Tokens stored in AsyncStorage
- Auto token refresh on app load
- UI: React Native Paper + NativeWind

## Logging

**Configuration**: `api/config/logger.ts`

- Development: Pretty-printed logs with UK date format (dd-mm-yyyy HH:MM:ss UTC)
- Production: Structured JSON logs
- Log level: Controlled by `LOG_LEVEL` env variable (default: `info`)

**HTTP Request Logging**: Automatic via `app/middleware/http_logger_middleware.ts`

- Logs all incoming requests with method, URL, status, duration, and user ID
- Color-coded by status: INFO (2xx-3xx), WARN (4xx), ERROR (5xx)

**Using Logger in Controllers**:

```typescript
import logger from "@adonisjs/core/services/logger";

logger.info({ userId: 123 }, "Operation completed");
logger.warn({ email: "test@example.com" }, "Duplicate email attempt");
logger.error({ error: err.message }, "Failed to process");
```

## Debugging

**Start server in debug mode**:

```bash
cd api
npm run dev:debug
```

**VS Code Debugger** (similar to `binding.pry` in Ruby):

1. Run `npm run dev:debug`
2. In VS Code, press F5 and select "Attach to AdonisJS"
3. Add `debugger` statements in your code or click line numbers to set breakpoints
4. Make a request - execution pauses at breakpoints
5. Inspect variables, step through code, evaluate expressions in Debug Console

**Configuration**: `.vscode/launch.json` already set up

**Alternative**: Use Chrome DevTools at `chrome://inspect`
