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

### File Size Guidelines

- Keep components under 200 lines when possible
- Split large components into smaller sub-components
- Extract reusable logic into custom hooks or utility functions

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

### Security Best Practices

- Never commit API keys or secrets - use environment variables
- Validate all user inputs on both client and server
- Use parameterized queries for database access (Mongoose handles this)
- Implement rate limiting for API endpoints (not yet implemented)
- Sanitize file uploads using Cloudinary
- Use HTTPS in production
- Set CORS origin to specific frontend URL in production

---

## Testing

### Current State

- No unit tests or integration tests currently implemented
- Manual testing performed during development
- API testing done with Postman or similar tools

### Testing Guidelines (Future)

- Write unit tests for all business logic in services
- Maintain >80% code coverage
- Use Jest for testing (backend)
- Use React Testing Library for frontend components
- Test authentication and permission middleware
- Test database migrations

---

## Development Workflow

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
import { config } from "../config/env.js";

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
