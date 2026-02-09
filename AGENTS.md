# Kanbox - Agent Memory Bank

> This document serves as a memory bank for AI agents working on the Kanbox project. It contains all critical project information, conventions, and patterns needed for consistent development.

---

## Project Overview

**Kanbox** is a collaborative Kanban board application built with the MERN stack, featuring drag-and-drop interfaces and granular permission controls. It was developed as a 3-person team effort over 2 months as part of a full-stack development bootcamp.

**Key Characteristics:**

- Backend: Node.js 18+ with Express.js, MongoDB with Mongoose ODM
- Frontend: React 19 with Redux state management, Material-UI with Atlassian Design System tokens
- Authentication: JWT tokens in HTTP-only cookies (XSS protection)
- Drag-and-Drop: Hello Pangea DnD with fractional indexing (O(1) performance)
- File Storage: Cloudinary CDN for image uploads
- **Testing:** Vitest with mongodb-memory-server for unit testing (added 2026-02-07)
- **Production:** Multi-stage Docker build with docker-compose.prod.yml (added 2026-02-09)
- **Orchestration:** Root-level package.json with convenience scripts and .nvmrc for Node.js version management (added 2026-02-09)

---

## Code Style

### Backend (JavaScript/ESM)

- Use ESM syntax (import/export) - project uses `"type": "module"` in package.json
- Follow ESLint configuration in `backend/.eslintrc.json`
- Use async/await for asynchronous operations
- Use 2 spaces for indentation (Prettier configuration)
- No TypeScript - pure JavaScript with JSDoc comments for documentation

```javascript
// Example: Controller pattern with error handling
import * as boardService from "../services/board-service.js";
import createError from "http-errors";
import { throwNotFound, throwBadRequest } from "../utils/error-utils.js";

export async function createBoard(req, res) {
  const { title, description, appearance, workspaceId } = req.body;
  const owner = {
    userId: req.currentUser._id,
    username: req.currentUser.username,
    fullname: req.currentUser.fullname,
  };
  const board = await boardService.createBoard({
    title,
    description,
    owner,
    appearance,
    workspaceId,
  });
  res.status(201).json({ board });
}

// Example: Controller using error utility functions
export async function deleteBoard(req, res) {
  const board = await boardService.deleteBoard(req.params.id);
  if (!board) throwNotFound("Board");
  res.status(204).send();
}

// Example: Controller with custom validation
export async function updateBoard(req, res) {
  const { title } = req.body;
  if (!title) throwBadRequest("title is required");
  const board = await boardService.updateBoard(req.params.id, req.body);
  res.status(200).json({ board });
}
```

### Frontend (React/JSX)

- Use functional components with React Hooks
- Follow ESLint configuration in `frontend/eslint.config.js`
- Use 2 spaces for indentation
- Components use PascalCase naming
- Use camelCase for functions and variables

```jsx
// Example: Functional component with hooks
import { useState, useEffect } from "react";

export const Card = ({ card, onDrag }) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Side effects
  }, [card.id]);

  return <div>{card.title}</div>;
};
```

### Naming Conventions

- Files and folders: kebab-case (e.g., `board-service.js`, `card-controller.js`)
- Components: PascalCase (e.g., `Card.jsx`, `BoardDetails.jsx`)
- Functions and variables: camelCase (e.g., `getBoardById`, `userEmail`)
- Constants: SCREAMING_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`)
- Database collections: snake_case (e.g., `users`, `boards`, `cards`)
- Mongoose models: PascalCase (e.g., `User`, `Board`, `Card`)

---

## Architecture

### Backend Architecture Pattern

Follow the layered architecture: Routes → Controllers → Services → Models

```
Request → Middleware → Route → Controller → Service → Model → Database
         ↓              ↓          ↓          ↓         ↓
      authenticate   endpoint   validate   business   schema
      authorize      handler    request    logic      validation
```

**Layer Responsibilities:**

1. **Routes** (`backend/src/routes/`) - Define API endpoints and HTTP methods
2. **Controllers** (`backend/src/controllers/`) - Handle HTTP requests/responses, call services
3. **Services** (`backend/src/services/`) - Contain business logic, reusable functions
4. **Models** (`backend/src/models/`) - Define data structure, validation, and database operations
5. **Middleware** (`backend/src/middleware/`) - Request interceptors (auth, permissions, error handling)
6. **Validation** (`backend/src/validation/`) - Request input validation using Zod 4

**Example Route with Full Middleware Chain:**

```javascript
// routes/boards.js
router.put(
  "/boards/:boardId",
  validate({ params: idParamSchema, body: updateBoardSchema }), // 1. Validate input (fast, no DB)
  authenticate, // 2. Verify JWT, attach currentUser
  loadBoard, // 3. Fetch board, attach req.board
  requireBoardAdmin, // 4. Check if user is board admin
  boardController.update // 5. Execute update logic
);
```

**Middleware Order Rationale:**

1. **Validation first** - Reject invalid input before expensive database queries
2. **Authentication second** - Identify the user making the request
3. **Authorization third** - Check permissions (requires DB query)
4. **Controller fourth** - Execute business logic

This order ensures:

- Performance: Fast validation before slow DB operations
- Correct error codes: 400 for validation, 401 for auth, 403 for authorization
- Security: Authorization logic receives validated, clean input

**Example Route with Full Middleware Chain:**

```javascript
// routes/boards.js
router.put(
  "/boards/:boardId",
  authenticate, // Verify JWT, attach currentUser
  loadBoard, // Fetch board, attach req.board
  requireBoardAdmin, // Check if user is board admin
  boardController.update // Execute update logic
);
```

### Frontend Architecture Pattern

```
User Interaction → Component → Redux Action → API Service → Backend
                        ↓
                  Update State
                        ↓
                 Re-render Component
```

**Component Structure:**

- **Pages** (`frontend/src/pages/`) - Route-level components
- **Components** (`frontend/src/components/`) - Reusable UI components
- **Store** (`frontend/src/store/`) - Redux state management (legacy)
- **Services** (`frontend/src/services/`) - API calls and utilities

---

## Input Validation Layer

### Overview

The project uses **Zod 4** for comprehensive input validation with modern syntax and best practices.

### Validation Structure

```
backend/src/validation/
├── schemas/
│   ├── common.js       # Reusable schemas (ObjectId, dates, pagination)
│   ├── auth.js         # Authentication schemas (signup, login)
│   ├── board.js        # Board schemas (create, update, labels)
│   ├── card.js         # Card schemas (create, update, move, comments, attachments)
│   ├── list.js         # List schemas (create, update, move, copy)
│   ├── workspace.js    # Workspace schemas (create, update, members)
│   └── index.js         # Central export for all schemas
├── middleware.js            # Validation middleware factory
└── index.js                # Central export for validation utilities
```

### Modern Zod 4 Features

1. **Top-level validators** - `z.email()`, `z.url()`, `z.iso.datetime()` instead of deprecated method chains
2. **Strict objects** - `z.strictObject()` to reject unknown fields
3. **Type coercion** - `z.coerce.number()` for query parameters
4. **Async validation** - `parseAsync()` for async operations
5. **Refinements** - Regex patterns for password, username, color hex codes
6. **Partial schemas** - `.partial()` for update operations

### Validation Middleware

```javascript
// backend/src/middleware/validate.js
export function validate(schemas) {
  return async (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        const messages = error.errors
          .map(err => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        return next(createError(400, messages));
      }
      next(error);
    }
  };
}
```

### Schema Examples

**Authentication Schema:**

```javascript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

const emailSchema = z.email().toLowerCase().trim();

export const signupSchema = z.strictObject({
  email: emailSchema,
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  fullname: z.string().min(1).max(100).trim(),
  password: passwordSchema,
});
```

**Common Schemas:**

```javascript
// MongoDB ObjectId validation
export const objectIdSchema = z
  .string()
  .refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

// ISO 8601 datetime validation
export const dateSchema = z.iso.datetime().optional();

// Pagination with type coercion
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

### Usage in Routes

```javascript
import { validate } from "../middleware/validate.js";
import {
  createBoardSchema,
  updateBoardSchema,
  idParamSchema,
} from "../validation/schemas/board.js";

router.post(
  "/",
  validate({ body: createBoardSchema }), // 1. Validate input (fast, no DB)
  authenticate, // 2. Verify JWT (fast)
  canCreateBoard(), // 3. Check authorization (slow, DB query)
  createBoard // 4. Controller
);

router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateBoardSchema }),
  authenticate,
  canManageBoard(),
  updateBoard
);
```

### File Size Guidelines

- Keep components under 200 lines when possible
- Split large components into smaller sub-components
- Extract reusable logic into custom hooks or utility functions

---

## Input Validation Layer

### Overview

The project uses **Zod 4** for comprehensive input validation with modern syntax and best practices.

### Validation Structure

```
backend/src/validation/
├── schemas/
│   ├── common.js       # Reusable schemas (ObjectId, dates, pagination)
│   ├── auth.js         # Authentication schemas (signup, login)
│   ├── board.js        # Board schemas (create, update, labels)
│   ├── card.js         # Card schemas (create, update, move, comments, attachments)
│   ├── list.js         # List schemas (create, update, move, copy)
│   ├── workspace.js    # Workspace schemas (create, update, members)
│   └── index.js         # Central export for all schemas
├── middleware.js            # Validation middleware factory
└── index.js                # Central export for validation utilities
```

### Modern Zod 4 Features

1. **Top-level validators** - `z.email()`, `z.url()`, `z.iso.datetime()` instead of deprecated method chains
2. **Strict objects** - `z.strictObject()` to reject unknown fields
3. **Type coercion** - `z.coerce.number()` for query parameters
4. **Async validation** - `parseAsync()` for async operations
5. **Refinements** - Regex patterns for password, username, color hex codes
6. **Partial schemas** - `.partial()` for update operations

### Validation Middleware

```javascript
// backend/src/middleware/validate.js
export function validate(schemas) {
  return async (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        const messages = error.errors
          .map(err => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        return next(createError(400, messages));
      }
      next(error);
    }
  };
}
```

### Schema Examples

**Authentication Schema:**

```javascript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

const emailSchema = z.email().toLowerCase().trim();

export const signupSchema = z.strictObject({
  email: emailSchema,
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  fullname: z.string().min(1).max(100).trim(),
  password: passwordSchema,
});
```

**Common Schemas:**

```javascript
// MongoDB ObjectId validation
export const objectIdSchema = z
  .string()
  .refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

// ISO 8601 datetime validation
export const dateSchema = z.iso.datetime().optional();

// Pagination with type coercion
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

### Usage in Routes

```javascript
import { validate } from "../middleware/validate.js";
import {
  createBoardSchema,
  updateBoardSchema,
  idParamSchema,
} from "../validation/schemas/board.js";

router.post(
  "/",
  validate({ body: createBoardSchema }), // 1. Validate input (fast, no DB)
  authenticate, // 2. Verify JWT (fast)
  canCreateBoard(), // 3. Check authorization (slow, DB query)
  createBoard // 4. Controller
);

router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateBoardSchema }),
  authenticate,
  canManageBoard(),
  updateBoard
);
```

---

## Database Design

### Entity Relationships

```
User (1) ── (creates/members) ──> Workspace (1) ── (contains) ──> Board (1) ── (contains) ──> List (1) ── (contains) ──> Card (*)
```

### Models

**User Model** (`backend/src/models/User.js`)

```javascript
{
  email: String (unique, required),
  username: String (unique, required),
  fullname: String (required),
  password: String (hashed with bcrypt),
  timestamps: true
}
```

**Workspace Model** (`backend/src/models/Workspace.js`)

```javascript
{
  title: String (required),
  description: String,
  owner: { userId, username, fullname },
  members: [{ userId, username, fullname }],
  timestamps: true
}
```

**Board Model** (`backend/src/models/Board.js`)

```javascript
{
  title: String (required),
  description: String,
  workspaceId: ObjectId (ref: Workspace, required),
  appearance: { background: String },
  labels: [{ title, color }],
  owner: { userId, username, fullname },
  members: [{ userId, username, fullname }],
  timestamps: true
}
```

**List Model** (`backend/src/models/List.js`)

```javascript
{
  boardId: ObjectId (ref: Board, required),
  title: String (required),
  description: String,
  position: String (required, fractional indexing),
  archivedAt: Date,
  deletedAt: Date,
  timestamps: true
}
```

**Card Model** (`backend/src/models/Card.js`)

```javascript
{
  boardId: ObjectId (ref: Board, required),
  listId: ObjectId (ref: List, required),
  title: String (required),
  cover: { img, color, textOverlay },
  description: String,
  position: String (required, fractional indexing),
  labelIds: [ObjectId],
  assignees: [{ userId, username, fullname }],
  archivedAt: Date,
  startDate: Date,
  dueDate: Date,
  comments: [{ author: { userId, username, fullname }, text, isEdited }],
  attachments: [{ url, name, publicId }],
  timestamps: true
}
```

### Embedded vs Referenced Data

| Data          | Storage Strategy  | Rationale                                         |
| ------------- | ----------------- | ------------------------------------------------- |
| User Info     | Referenced by ID  | Users change independently, avoid duplication     |
| Board Members | Embedded in Board | Small arrays (<50), frequently accessed together  |
| Card Labels   | Embedded in Card  | Card-specific, displayed with card                |
| Card Comments | Embedded in Card  | Lifecycle tied to card, not queried independently |
| Attachments   | Embedded URLs     | Just metadata, actual files in Cloudinary         |

---

## API Endpoints

### Base URL

- Development: `http://localhost:3000/api`
- Production: `/api` (same origin)

### Authentication Routes (`/api/auth`)

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user (sets HTTP-only cookie)
- `POST /api/auth/logout` - Logout user (clears cookie)
- `GET /api/auth/me` - Get current authenticated user

### Workspace Routes (`/api/workspaces`)

- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:workspaceId` - Get workspace details
- `PUT /api/workspaces/:workspaceId` - Update workspace
- `DELETE /api/workspaces/:workspaceId` - Delete workspace

### Board Routes (`/api/boards`)

- `GET /api/boards` - List user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:boardId` - Get board details with lists and cards
- `PUT /api/boards/:boardId` - Update board
- `DELETE /api/boards/:boardId` - Delete board
- `GET /api/boards/:boardId/labels` - Get board labels
- `POST /api/boards/:boardId/labels` - Add label to board
- `PUT /api/boards/:boardId/labels/:labelId` - Update board label
- `DELETE /api/boards/:boardId/labels/:labelId` - Delete board label

### List Routes (`/api/lists`)

- `POST /api/lists` - Create new list
- `PUT /api/lists/:listId` - Update list
- `DELETE /api/lists/:listId` - Delete list (cascades to cards)
- `POST /api/lists/:listId/copy` - Copy list to another board
- `POST /api/lists/:listId/move` - Move list to another position

### Card Routes (`/api/cards`)

- `POST /api/cards` - Create new card
- `PUT /api/cards/:cardId` - Update card
- `DELETE /api/cards/:cardId` - Delete card
- `POST /api/cards/:cardId/move` - Move card to different list/position
- `POST /api/cards/:cardId/labels` - Update card labels
- `POST /api/cards/:cardId/assignees` - Update card assignees
- `POST /api/cards/:cardId/comments` - Add comment to card
- `DELETE /api/cards/:cardId/comments/:commentId` - Delete comment

### Upload Routes (`/api/upload`)

- `POST /api/upload` - Upload file to Cloudinary

### Health Check

- `GET /health` - Health check endpoint

---

## Authentication & Security

### JWT Cookie Authentication

- JWT tokens stored in HTTP-only cookies (XSS protection)
- Cookie configuration: `httpOnly`, `secure`, `sameSite=strict`
- Token expiration: 7 days
- Password hashing: bcrypt with 12 salt rounds

**Authentication Middleware** (`backend/src/middleware/authenticate.js`):

```javascript
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.currentUser = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
```

### Permission System

Granular permission system with middleware-based authorization:

**Permission Hierarchy:**

- Workspace Owner → Full control over workspace
- Board Admin → Full control over board
- Board Member → Can view and edit cards (limited permissions)

**Permission Middleware** (`backend/src/middleware/authorize.js`):

```javascript
export const requireBoardAdmin = (req, res, next) => {
  const board = req.board;
  const isOwner = board.owner.userId.equals(req.currentUser._id);
  const isAdmin = board.members.some(
    m => m.userId.equals(req.currentUser._id) && m.role === "admin"
  );

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};
```

### Input Sanitization

**XSS Protection with DOMPurify** (`backend/src/utils/sanitize.js`):

The project uses isomorphic-dompurify for server-side HTML sanitization to prevent XSS attacks:

```javascript
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHTML(dirty) {
  if (!dirty || typeof dirty !== "string") return dirty;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href"],
  });
}

export function sanitizePlainText(dirty) {
  if (!dirty || typeof dirty !== "string") return dirty;
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
```

**Sanitization Coverage:**

- **Cards**: title (plain text), description (HTML), comments (HTML)
- **Boards**: title (plain text), description (HTML), labels (plain text)
- **Lists**: title (plain text), description (HTML)
- **Workspaces**: title (plain text), description (HTML)

All user-generated content is sanitized in controllers before being passed to services.

### CSRF Protection

**Cookie-based Protection:**

- JWT tokens stored in HTTP-only cookies with `sameSite: "strict"`
- Provides automatic CSRF protection for same-site requests
- No additional CSRF tokens needed for current architecture

### Security Best Practices

- ✅ Never commit API keys or secrets - use environment variables
- ✅ Input sanitization with DOMPurify for XSS protection
- ✅ HTTP-only cookies with sameSite=strict for CSRF protection
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ Environment variable validation on startup
- ✅ Use parameterized queries for database access (Mongoose handles this)
- ⚠️ Rate limiting for API endpoints (not yet implemented)
- ✅ Sanitize file uploads using Cloudinary
- ✅ Use HTTPS in production
- ✅ Set CORS origin to specific frontend URL in production

---

## Testing

### Current State

- **Vitest** with mongodb-memory-server for unit testing (added 2026-02-07)
- 49 unit tests implemented for board-service and card-service
- Test isolation with in-memory MongoDB
- Fast execution: all tests complete in ~4.5 seconds

### Test Structure

```
backend/tests/
├── setup.js                    # Test database setup
└── unit/
    └── services/
        ├── board-service.test.js   # 18 tests for board service
        └── card-service.test.js    # 31 tests for card service
```

### Running Tests

```bash
cd backend
npm test          # Run tests in watch mode
npm run test:run   # Run tests once
```

### Test Coverage

Currently implemented 49 unit tests covering:

- Board service CRUD operations (create, read, update, delete)
- Board label management (add, update, remove)
- Card service CRUD operations (create, read, update, delete)
- Card cover management (update with color, image, text overlay)
- Card attachment management (add, remove)
- Card comments retrieval

### Testing Guidelines

- Write unit tests for all business logic in services
- Maintain >80% code coverage
- Use Vitest for testing (backend)
- Use React Testing Library for frontend components
- Test authentication and permission middleware
- Test database migrations

### Next Steps

To expand testing coverage:

1. Add tests for remaining services (list-service, workspace-service)
2. Add tests for utility functions (error-utils, sanitize, utils)
3. Add tests for middleware (authenticate, authorize, validate)
4. Add integration tests for API endpoints using Supertest
5. Add coverage reporting with @vitest/coverage-v8

---

## Docker Production Build

### Overview

The project uses a multi-stage Docker build process for production deployment, building the entire application stack (backend + frontend) into a single optimized container image.

### Dockerfile Structure

**Multi-stage build process:**

```dockerfile
# Stage 1: Backend dependencies
FROM node:22-alpine AS backend-deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Frontend build
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force
COPY frontend/ ./
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=backend-deps /app/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./public
RUN addgroup -g 1001 -S kanbox && \
    adduser -S kanbox -u 1001 -G kanbox && \
    chown -R kanbox:kanbox /app
USER kanbox
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
ENV NODE_ENV=production
CMD ["node", "src/server.js"]
```

**Key Features:**

- **Layer caching**: Separate stages for dependencies and code changes
- **Optimized image size**: Only production dependencies included
- **Security**: Runs as non-root user (kanbox:kanbox)
- **Health check**: Automatic health monitoring with `/health` endpoint
- **Static serving**: Express serves built frontend from `/public`

### Docker Compose Production

**File:** `docker-compose.prod.yml`

```yaml
services:
  db:
    image: mongo:8.2
    restart: unless-stopped
    ports:
      - "${MONGO_PORT:-27017}:27017"
    env_file:
      - backend/.env
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE:-kanbox}
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
    networks:
      - kanbox-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    env_file:
      - backend/.env
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@db:27017/${MONGO_DATABASE:-kanbox}?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN:-}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME:-}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY:-}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET:-}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - kanbox-network

volumes:
  mongo_data:

networks:
  kanbox-network:
    driver: bridge
```

**Key Features:**

- **Service orchestration**: MongoDB and app run together with proper networking
- **Health checks**: App waits for MongoDB to be healthy before starting
- **Volume persistence**: MongoDB data persists across container restarts
- **Network isolation**: Services communicate via internal Docker network
- **Environment override**: Production-specific MongoDB URI uses service name `db`

### Building and Running

**Build production image:**

```bash
docker build -t kanbox:latest .
```

**Run with docker-compose:**

```bash
# Create .env.prod file with production values
cp backend/.env .env.prod

# Start all services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

**Run single container:**

```bash
# Build image
docker build -t kanbox:latest .

# Run container with environment file
docker run --env-file .env.prod -p 3000:3000 kanbox:latest
```

### Environment Variables for Production

**File:** `.env.prod`

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=

# Authentication
JWT_SECRET=your_secure_jwt_secret_at_least_32_chars

# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password
MONGO_DATABASE=kanbox_production
MONGODB_URI=mongodb://admin:password@localhost:27017/kanbox_production?authSource=admin

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=kanbox-attachments-prod
```

**Important Notes:**

- ⚠️ **Never commit** `.env.prod` to version control (added to `.gitignore`)
- ✅ Use strong, randomly generated secrets for production
- ✅ Set `CORS_ORIGIN` to your production frontend URL
- ✅ Use MongoDB Atlas or secured MongoDB instance for production

### .dockerignore

The `.dockerignore` file excludes unnecessary files from the build context:

```
node_modules/
**/node_modules/
.pnp
.pnp.js

/build/
/dist/
/.next/
/out/

/coverage/

.env
.env.local
.env.development.local
.env.test.local
.env.production.local

_*.csv
_*.xlsx

.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

/coverage

/.next/
/out/

/build

.DS_Store
*.pem

npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

.env*

.vercel

*.tsbuildinfo
next-env.d.ts

.kilocodeignore
```

This ensures:

- Faster build times (smaller build context)
- Smaller final image size
- No sensitive data in image
- Clean production builds

---

## Project Orchestration

### Overview

The project includes a root-level package.json and .nvmrc file for improved tooling and Node.js version management.

### Root-Level Package.json

**File:** `package.json`

```json
{
  "name": "kanbox",
  "version": "1.0.0",
  "description": "Kanbox - Collaborative Kanban Board Application",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "test": "cd backend && npm test",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd backend && npm run lint",
    "lint:frontend": "cd frontend && npm run lint",
    "docker:up": "docker-compose -f docker-compose.prod.yml up -d",
    "docker:down": "docker-compose -f docker-compose.prod.yml down",
    "docker:logs": "docker-compose -f docker-compose.prod.yml logs -f"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**Key Features:**

- **Convenience scripts**: Run development servers for both backend and frontend simultaneously
- **Orchestration**: Build, test, and lint both parts of the application from root
- **Docker commands**: Quick access to Docker Compose production commands
- **Engine enforcement**: Ensures Node.js version >= 18.0.0

### Available Scripts

**Development:**

```bash
npm run dev              # Start both backend and frontend dev servers
npm run dev:backend      # Start only backend dev server
npm run dev:frontend     # Start only frontend dev server
```

**Building:**

```bash
npm run build            # Build both backend and frontend
npm run build:backend    # Build only backend
npm run build:frontend   # Build only frontend
```

**Testing & Linting:**

```bash
npm run test             # Run backend tests
npm run lint             # Lint both backend and frontend
npm run lint:backend     # Lint only backend
npm run lint:frontend    # Lint only frontend
```

**Docker:**

```bash
npm run docker:up        # Start production Docker services
npm run docker:down      # Stop production Docker services
npm run docker:logs      # View production Docker logs
```

### .nvmrc File

**File:** `.nvmrc`

```
18
```

**Purpose:**

- Specifies Node.js version for the project
- Allows tools like nvm/mise/asdf to automatically switch to correct version when entering the project directory
- Ensures consistent Node.js version across team members
- Complements the `engines` field in package.json

**Usage:**

When using nvm (Node Version Manager):

```bash
# Install required Node.js version if not already installed
nvm install

# Use the Node.js version specified in .nvmrc
nvm use

# Set as default for this directory
nvm use default
```

**Benefits:**

- Automatic version switching when changing directories
- Prevents version mismatches between development and production
- No need to manually specify Node.js version in commands
- Works with other version managers (mise, asdf, etc.)

### Configuration System

The backend uses a modular configuration system with domain-specific config files:

**Configuration Structure:**

- `backend/src/config/index.js` - Central aggregator with validation
- `backend/src/config/auth.js` - JWT, cookies, bcrypt settings
- `backend/src/config/db.js` - MongoDB configuration
- `backend/src/config/server.js` - Express server, CORS, port
- `backend/src/config/cloudinary.js` - File upload settings

**Usage:**

```javascript
import { config } from "../config/index.js";

const port = config.port;
const jwtSecret = config.auth.jwt.secret;
const dbUri = config.db.uri;
```

**Environment Validation:**

- Validates required env vars on startup
- Enforces JWT_SECRET >= 32 chars in production
- Fails fast if configuration is invalid

---

## Development Workflow

### Configuration System

The backend uses a modular configuration system with domain-specific config files:

**Configuration Structure:**

- `backend/src/config/index.js` - Central aggregator with validation
- `backend/src/config/auth.js` - JWT, cookies, bcrypt settings
- `backend/src/config/db.js` - MongoDB configuration
- `backend/src/config/server.js` - Express server, CORS, port
- `backend/src/config/cloudinary.js` - File upload settings

**Usage:**

```javascript
import { config } from "../config/index.js";

const port = config.port;
const jwtSecret = config.auth.jwt.secret;
const dbUri = config.db.uri;
```

**Environment Validation:**

- Validates required env vars on startup
- Enforces JWT_SECRET >= 32 chars in production
- Fails fast if configuration is invalid

### Environment Setup

**Backend Environment Variables** (`backend/.env`):

```bash
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="your_jwt_secret_here"
MONGODB_URI="mongodb://admin:password@localhost:27017/kanbox_development?authSource=admin"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**Frontend Environment Variables** (`frontend/.env`):

```bash
VITE_CLOUDINARY_CLOUD_NAME="your_cloud_name"
```

### Available Scripts

**Backend:**

```bash
npm run dev         # Start development server with nodemon
npm run migrate:up  # Apply pending migrations
npm run db:clean    # Clean database (preserve users)
npm run lint        # Run ESLint
```

**Frontend:**

```bash
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run lint        # Run ESLint
```

### Git Workflow

1. Create feature branch from main
2. Make changes following code style guidelines
3. Run linters and fix issues
4. Test changes locally
5. Commit with concise messages
6. Create pull request
7. Get code review approval
8. Merge to main

### Commit Message Convention

Use concise, descriptive commit messages:

- `feat: add workspace management feature`
- `fix: resolve card drag-and-drop issue`
- `refactor: simplify permission middleware`
- `docs: update API documentation`
- `style: format code with Prettier`

---

## Key Technologies & Libraries

### Backend Dependencies

| Package             | Version | Purpose                   |
| ------------------- | ------- | ------------------------- |
| express             | ^5.1.0  | Web framework             |
| mongoose            | ^8.19.3 | MongoDB ODM               |
| jsonwebtoken        | ^9.0.2  | JWT authentication        |
| bcrypt              | ^6.0.0  | Password hashing          |
| cors                | ^2.8.5  | CORS middleware           |
| cookie-parser       | ^1.4.7  | Cookie parsing            |
| morgan              | ^1.10.1 | HTTP request logger       |
| cloudinary          | ^2.8.0  | Image upload CDN          |
| fractional-indexing | ^3.2.0  | Drag-and-drop positioning |
| umzug               | ^3.8.2  | Database migrations       |
| dotenv              | ^16.6.1 | Environment variables     |
| http-errors         | latest  | HTTP error creation       |

### Frontend Dependencies

| Package           | Version  | Purpose                     |
| ----------------- | -------- | --------------------------- |
| react             | ^19.2.0  | UI library                  |
| react-dom         | ^19.2.0  | React DOM renderer          |
| react-router-dom  | ^7.9.4   | Client-side routing         |
| redux             | ^5.0.1   | State management (legacy)   |
| react-redux       | ^9.2.0   | React-Redux bindings        |
| @mui/material     | ^7.3.4   | UI component library        |
| @emotion/react    | ^11.14.0 | CSS-in-JS library           |
| @atlaskit/tokens  | ^8.0.0   | Design system tokens        |
| @hello-pangea/dnd | ^18.0.1  | Drag-and-drop library       |
| @tiptap/react     | ^3.13.0  | Rich text editor            |
| react-hook-form   | ^7.64.0  | Form handling               |
| yup               | ^1.7.1   | Form validation             |
| @cloudinary/react | ^1.14.3  | Cloudinary React components |
| axios             | ^1.12.2  | HTTP client                 |
| vite              | ^7.1.9   | Build tool and dev server   |

---

## Common Patterns

### Error Handling Pattern

**Central Error Handler Middleware** (`backend/src/middleware/error-handler.js`):

The project uses a centralized error handling middleware that catches and formats errors consistently:

```javascript
import createError from "http-errors";
import { config } from "../config/index.js";

function errorHandler(err, _req, res, _next) {
  let error = err;

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map(e => e.message)
      .join(", ");
    error = createError(400, messages);
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    error = createError(400, `${err.path} is invalid`);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error = createError(401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = createError(401, "Token expired");
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = createError(409, `${field} already exists`);
  }

  // Handle unexpected errors
  if (!createError.isHttpError(error)) {
    console.error("Unexpected error:", error);
    error = createError(500, "Internal server error");
  }

  const status = error.statusCode || error.status || 500;

  const response = {
    error: error.message,
  };

  if (config.app.env === "development") {
    response.stack = error.stack;
  }

  res.status(status).json(response);
}

export default errorHandler;
```

**Controller Error Handling Patterns:**

The project uses Express 5.x which has **built-in async error handling**. This means:

- ✅ No try/catch blocks needed in controllers
- ✅ Express 5.x automatically catches errors from async route handlers
- ✅ Errors are automatically passed to the error handler middleware

**Standard Pattern (Recommended):**

```javascript
import createError from "http-errors";
import { throwNotFound } from "../utils/error-utils.js";

export async function deleteBoard(req, res) {
  const board = await boardService.deleteBoard(req.params.id);
  if (!board) throwNotFound("Board");
  res.status(204).send();
}
```

**Using Error Utility Functions:**

The project provides helper functions in [`backend/src/utils/error-utils.js`](backend/src/utils/error-utils.js:1):

- `throwNotFound(resource)` - Throws 404 Not Found error
- `throwBadRequest(message)` - Throws 400 Bad Request error
- `throwUnauthorized(message)` - Throws 401 Unauthorized error
- `throwForbidden(message)` - Throws 403 Forbidden error
- `throwConflict(message)` - Throws 409 Conflict error

**Common Error Codes:**

| Status Code | Use Case                             | Example                      |
| ----------- | ------------------------------------ | ---------------------------- |
| 400         | Invalid input or validation          | Missing required field       |
| 401         | Authentication failed                | Invalid token or credentials |
| 403         | Insufficient permissions             | User lacks permission        |
| 404         | Resource not found                   | Board/Card/User not found    |
| 409         | Resource conflict                    | Duplicate email/username     |
| 500         | Server error (handled by middleware) | Unexpected errors            |

**Do NOT:**

- ❌ Use try/catch blocks in controllers (Express 5.x handles this automatically)
- ❌ Manually return error responses (delegate to middleware instead)
- ❌ Duplicate error handling logic (middleware already handles common errors)

### Service Layer Pattern

```javascript
// services/board-service.js
import { Board } from "../models/Board.js";

export const getBoardById = async boardId => {
  const board = await Board.findById(boardId)
    .populate("owner.userId", "email username fullname")
    .populate("members.userId", "email username fullname");
  return board;
};

export const createBoard = async (boardData, userId) => {
  const board = await Board.create({
    ...boardData,
    owner: {
      userId,
      username: req.currentUser.username,
      fullname: req.currentUser.fullname,
    },
    members: [
      {
        userId,
        username: req.currentUser.username,
        fullname: req.currentUser.fullname,
      },
    ],
  });
  return board;
};
```

### Fractional Indexing Pattern

```javascript
import { generateKeyBetween } from "fractional-indexing";

// Get adjacent cards
const cards = await Card.find({ listId }).sort({ position: 1 });

// Calculate new position
let newPosition;
if (cards.length === 0) {
  newPosition = "a0"; // First position
} else if (index === 0) {
  newPosition = generateKeyBetween(null, cards[0].position);
} else if (index === cards.length) {
  newPosition = generateKeyBetween(cards[cards.length - 1].position, null);
} else {
  newPosition = generateKeyBetween(
    cards[index - 1].position,
    cards[index].position
  );
}

// Update card position
await Card.findByIdAndUpdate(cardId, { position: newPosition });
```

---

## Don't

- Don't hardcode values - use environment variables
- Don't add line comments unless really necessary
- Don't commit sensitive data (API keys, passwords)
- Don't use localStorage for authentication tokens
- Don't skip input validation
- Don't ignore error handling
- Don't make database queries in controllers - use services
- Don't create large monolithic components - split them up
- Don't use `any` types if TypeScript is added in the future

---

## Project-Specific Notes

### Migration System

- Uses Umzug for database migrations
- Migration files located in `backend/src/db/migrations/`
- Migration naming convention: `YYYY.MM.DDTHH.MM.SS.description.js`
- Commands:
  - `npm run migrate:up` - Apply pending migrations
  - `npm run migrate:down` - Rollback last migration
  - `npm run migrate:create` - Create new migration
  - `npm run db:clean` - Clean database (preserve users)

### Docker Setup

- MongoDB runs in Docker container
- Configuration in `backend/docker-compose.yml`
- Start with: `docker compose up -d mongodb`
- MongoDB accessible at `localhost:27017`

### Design System Integration

- Atlassian Design System tokens integrated with Material-UI
- Tokens defined in `@atlaskit/tokens` package
- Material-UI theme customized to match tokens
- Ensures consistent spacing, typography, and colors

### Redux State Management (Legacy)

- Redux used for state management (legacy pattern)
- Store configuration in `frontend/src/store/store.js`
- Actions in `frontend/src/store/actions/`
- Reducers in `frontend/src/store/reducers/`
- Note: Consider migrating to React Context or Zustand for new features

---

## Future Enhancements

### Planned Features

- Real-time collaboration via WebSockets
- Unit and integration testing
- Workspace hierarchy for multi-board organization
- Email notifications for card assignments
- Card templates and automation rules
- Performance monitoring and analytics

### Technical Debt

- Add comprehensive test coverage
- Implement rate limiting for API endpoints
- Add request validation middleware (e.g., Joi, express-validator)
- Improve error logging and monitoring
- Consider migrating from Redux to modern state management

---

## Additional Documentation

- [Main README](../README.md) - Project overview and quick start
- [Architecture Documentation](ARCHITECTURE.md) - Technical deep-dive and trade-offs
- [Development Guide](DEVELOPMENT.md) - Setup instructions and workflows
- [Team Contributions](TEAM.md) - Individual contributions and collaboration
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Backend Migrations](../backend/docs/MIGRATIONS.md) - Database migration documentation

---

**Last Updated:** 2026-02-04
**Maintainer:** Saveliy Shiryaev
