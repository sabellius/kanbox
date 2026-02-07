# Development Guide

> Complete setup instructions and development workflow for Kanbox

This guide will help you set up the development environment and understand the project structure for contributing to Kanbox.

---

## Table of Contents

---

## API Testing

### Overview

The project uses **Vitest** as the test runner for backend unit testing with **mongodb-memory-server** for in-memory MongoDB database isolation.

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

### Key Features

- **Vitest**: Fast, modern test runner with native ESM support
- **mongodb-memory-server**: In-memory MongoDB for isolated database testing
- **ESLint globals**: Configured to recognize Vitest global functions
- **Test isolation**: Each test runs in isolation with database cleanup between tests
- **Fast execution**: All 49 tests complete in ~4.5 seconds

### Next Steps

To expand testing coverage:

1. Add tests for remaining services (list-service, workspace-service)
2. Add tests for utility functions (error-utils, sanitize, utils)
3. Add tests for middleware (authenticate, authorize, validate)
4. Add integration tests for API endpoints using Supertest
5. Add coverage reporting with @vitest/coverage-v8

---

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Development Workflow](#development-workflow)
6. [Running the Application](#running-the-application)
7. [Database Management](#database-management)
8. [API Testing](#api-testing)
9. [Code Quality Tools](#code-quality-tools)
10. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
11. [Production Build](#production-build)

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

| Software                    | Version        | Purpose             | Installation                                    |
| --------------------------- | -------------- | ------------------- | ----------------------------------------------- |
| **Node.js**                 | 18.x or higher | Runtime environment | [Download](https://nodejs.org/)                 |
| **npm**                     | 9.x or higher  | Package manager     | Comes with Node.js                              |
| **Docker & Docker Compose** | Latest         | MongoDB container   | [Download](https://docs.docker.com/get-docker/) |
| **Git**                     | Latest         | Version control     | [Download](https://git-scm.com/)                |

### Verify Installations

```bash
node --version    # Should output v18.x.x or higher
npm --version     # Should output 9.x.x or higher
docker --version  # Should output Docker version 20.x.x or higher
git --version     # Should output git version 2.x.x or higher
```

### Optional but Recommended

- **VS Code** - Code editor with excellent Node.js support
- **Postman** or **Insomnia** - API testing
- **MongoDB Compass** - GUI for MongoDB (optional)
- **Git GUI** - GitKraken, Sourcetree, or GitHub Desktop

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/kanbox.git

# Navigate to project directory
cd kanbox
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# See "Environment Configuration" section below for details
```

**Install Time:** ~2-3 minutes depending on internet speed

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your Cloudinary cloud name
# See "Environment Configuration" section below for details
```

**Install Time:** ~3-5 minutes depending on internet speed

### 4. Start MongoDB with Docker

```bash
# Navigate to backend directory
cd backend

# Start MongoDB container in detached mode
docker compose up -d mongodb

# Verify MongoDB is running
docker ps
# You should see a container named "backend-mongodb-1" running
```

**MongoDB will be accessible at:** `localhost:27017`

### 5. Run Database Migrations

```bash
# From backend directory
npm run migrate:up
```

This will:

- Create necessary collections
- Set up indexes
- Seed initial data (optional demo data)

**Expected Output:**

```
Connected to MongoDB
Applying migrations...
✅ 2025.11.27T17.20.48.seed-db.js
✅ 2025.12.04T19.44.06.seed-card-labels.js
✅ 2026.01.10T11.22.00.add-workspace.js
All migrations completed successfully!
```

### 6. Start Development Servers

You'll need **two terminal windows** open:

**Terminal 1 - Backend Server:**

```bash
cd backend
npm run dev
```

**Expected Output:**

```
[nodemon] starting `node src/server.js`
Connected to MongoDB: kanbox_development
Server running on http://localhost:3000
```

**Terminal 2 - Frontend Server:**

```bash
cd frontend
npm run dev
```

**Expected Output:**

```
VITE v7.1.9  ready in 823 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 7. Verify Setup

Open your browser and navigate to:

- **Frontend:** http://localhost:5173
- **Backend Health Check:** http://localhost:3000/health

You should see:

- Frontend: Kanbox landing page or login screen
- Backend: `{"status":"OK","timestamp":"..."}`

---

## Project Structure

### Backend Directory Structure

```
backend/
├── src/
│   ├── server.js                 # Entry point, connects to MongoDB
│   ├── app.js                    # Express app configuration
│   │
│   ├── routes/                   # API endpoint definitions
│   │   ├── index.js              # Route aggregation
│   │   ├── auth.js               # /api/auth/* (login, signup)
│   │   ├── workspaces.js         # /api/workspaces/*
│   │   ├── boards.js             # /api/boards/*
│   │   ├── list.js               # /api/lists/*
│   │   ├── cards.js              # /api/cards/*
│   │   └── upload.js             # /api/upload
│   │
│   ├── controllers/              # Request handlers (HTTP layer)
│   │   ├── auth-controller.js    # Handle login, signup, logout
│   │   ├── workspace-controller.js
│   │   ├── board-controller.js
│   │   ├── list-controller.js
│   │   ├── card-controller.js
│   │   └── upload-controller.js
│   │
│   ├── services/                 # Business logic (reusable functions)
│   │   ├── workspace-service.js  # Workspace CRUD operations
│   │   ├── board-service.js      # Board CRUD operations
│   │   ├── list-service.js       # List CRUD operations
│   │   ├── card-service.js       # Card CRUD operations
│   │   ├── upload-service.js     # Cloudinary integration
│   │   ├── position-service.js   # Fractional indexing logic
│   │   ├── filter-service.js     # Card filtering utilities
│   │   ├── utils-service.js      # Common helpers
│   │   └── permissions/          # Authorization rules
│   │       ├── index.js          # Export all permissions
│   │       ├── workspace.js      # Workspace permissions
│   │       ├── board.js          # Board permissions
│   │       ├── list.js           # List permissions
│   │       ├── card.js           # Card permissions
│   │       └── helpers.js        # Permission utilities
│   │
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js               # User model (email, password, fullName)
│   │   ├── Workspace.js          # Workspace model
│   │   ├── Board.js              # Board model (title, members, style)
│   │   ├── List.js               # List model (title, position, boardId)
│   │   └── Card.js               # Card model (title, description, labels, etc.)
│   │
│   ├── middleware/               # Request interceptors
│   │   ├── authenticate.js       # JWT verification, attach currentUser
│   │   ├── authorize.js          # Permission checks
│   │   ├── load-board.js         # Pre-fetch board data
│   │   └── error-handler.js      # Centralized error handling
│   │
│   ├── db/                       # Database management
│   │   ├── migrate.js            # Migration CLI tool
│   │   ├── umzug.js              # Migration configuration
│   │   ├── clean-db.js           # Database cleanup utility
│   │   └── migrations/           # Version-controlled schema changes
│   │       ├── 2025.11.27T17.20.48.seed-db.js
│   │       ├── 2025.12.04T19.44.06.seed-card-labels.js
│   │       └── 2026.01.10T11.22.00.add-workspace.js
│   │
│   ├── config/                   # Configuration files
│   │   ├── env.js                # Environment variable parsing
│   │   └── database.js           # MongoDB connection setup
│   │
│   └── utils/                    # Utility functions
│       └── utils.js              # Common helper functions
│
├── public/                       # Static files (production build)
│   └── index.html                # SPA entry point (production)
│
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── docker-compose.yml            # Docker services definition
├── Dockerfile                    # Backend container image
├── package.json                  # Dependencies and scripts
└── README.md                     # Backend-specific documentation
```

**Key Architectural Patterns:**

- **Routes** → Define endpoints and HTTP methods
- **Controllers** → Handle requests, call services, send responses
- **Services** → Contain business logic, reusable across controllers
- **Models** → Define data structure and validation
- **Middleware** → Request interceptors (auth, permissions, error handling)

### Frontend Directory Structure

```
frontend/
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component with routes
│   │
│   ├── pages/                    # Route components
│   │   ├── HomePage.jsx          # Landing page
│   │   ├── LoginPage.jsx         # Login screen
│   │   ├── SignupPage.jsx        # Registration screen
│   │   ├── WorkspaceIndex.jsx    # Workspace list
│   │   ├── WorkspaceDetails.jsx  # Workspace view
│   │   ├── BoardIndex.jsx        # Board list
│   │   ├── BoardDetails.jsx      # Main board view (lists + cards)
│   │   ├── CardDetails.jsx       # Card modal
│   │   ├── UserDetails.jsx       # User profile
│   │   └── AboutUs.jsx           # About page
│   │
│   ├── components/               # Reusable components
│   │   ├── Header.jsx            # Top navigation bar
│   │   ├── Footer.jsx            # Footer
│   │   ├── UserMessage.jsx       # Toast notifications
│   │   ├── List.jsx              # List container
│   │   ├── Card.jsx              # Card component
│   │   ├── CardModal.jsx         # Card details modal
│   │   ├── CardPopover.jsx       # Card quick actions
│   │   ├── AddCardForm.jsx       # New card form
│   │   ├── AddList.jsx           # New list form
│   │   ├── FilterMenu.jsx        # Card filtering
│   │   ├── LabelMenu.jsx         # Label management
│   │   ├── LabelEditor.jsx       # Label editor
│   │   ├── CreateBoardForm.jsx   # New board form
│   │   ├── CreateWorkspaceForm.jsx
│   │   ├── BackgroundSelector.jsx
│   │   ├── ImageUploader.jsx     # File upload component
│   │   └── ProtectedRoute.jsx    # Auth guard
│   │
│   ├── store/                    # Redux state management
│   │   ├── store.js              # Redux store configuration
│   │   ├── actions/              # Action creators
│   │   │   ├── board-actions.js
│   │   │   ├── user-actions.js
│   │   │   └── ui-actions.js
│   │   └── reducers/             # State reducers
│   │       ├── board-reducer.js
│   │       ├── user-reducer.js
│   │       └── ui-reducer.js
│   │
│   ├── services/                 # API calls and utilities
│   │   ├── board-service.js      # Board API calls
│   │   ├── user-service.js       # User/auth API calls
│   │   ├── upload-service.js     # File upload
│   │   ├── socket-service.js     # WebSocket connection
│   │   ├── event-bus-service.js  # Pub/sub messaging
│   │   ├── filter-service.js     # Card filtering logic
│   │   └── util-service.js       # Common helpers
│   │
│   ├── hooks/                    # Custom React hooks (optional)
│   │   └── useClickOutside.jsx
│   │
│   ├── assets/                   # Static assets
│   │   ├── styles/               # CSS files
│   │   │   ├── main.css          # Main stylesheet
│   │   │   ├── basics/           # Base styles
│   │   │   ├── components/       # Component styles
│   │   │   ├── pages/            # Page styles
│   │   │   └── setup/            # Variables, typography
│   │   └── images/               # Images, icons
│   │
│   └── utils/                    # Utility functions
│       └── constants.js          # App constants
│
├── public/                       # Public static files
│   └── icon.svg                  # App icon
│
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── eslint.config.js              # ESLint configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Frontend-specific documentation
```

**Data Flow:**

```
User Interaction → Component → Redux Action → API Service → Backend
                       ↓
                 Update State
                       ↓
                Re-render Component
```

---

## Environment Configuration

### Backend Environment Variables

**File:** `backend/.env`

```bash
# ============================================================================
# Kanbox Backend Environment Configuration
# ============================================================================

# ----------------------------------------------------------------------------
# Application Environment
# ----------------------------------------------------------------------------
NODE_ENV="development"              # Options: development | production | test

# ----------------------------------------------------------------------------
# Server Configuration
# ----------------------------------------------------------------------------
PORT=3000                           # Backend server port
CORS_ORIGIN="http://localhost:5173" # Frontend URL for CORS

# ----------------------------------------------------------------------------
# Authentication
# ----------------------------------------------------------------------------
# IMPORTANT: Generate a secure random string for production
# Command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_jwt_secret_here_change_in_production"

# ----------------------------------------------------------------------------
# MongoDB Configuration
# ----------------------------------------------------------------------------
MONGO_USERNAME="admin"
MONGO_PASSWORD="your_secure_password"
MONGO_DATABASE="kanbox_development"

# Full MongoDB connection URI
# For local Docker: mongodb://admin:password@localhost:27017/kanbox_development?authSource=admin
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/kanbox?retryWrites=true&w=majority
MONGODB_URI="mongodb://admin:your_secure_password@localhost:27017/kanbox_development?authSource=admin"

# ----------------------------------------------------------------------------
# Cloudinary Configuration (Required for file uploads)
# ----------------------------------------------------------------------------
# Sign up at: https://cloudinary.com
# Find credentials at: https://console.cloudinary.com/console

CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Optional: Specify upload folder
CLOUDINARY_FOLDER="kanbox/attachments"

# Alternative: Full connection URL
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

**Configuration Steps:**

1. **JWT Secret:**

   ```bash
   # Generate secure random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **MongoDB:**
   - Use default credentials for local development
   - For production, use MongoDB Atlas or secure password

3. **Cloudinary:**
   - Sign up at https://cloudinary.com (free tier available)
   - Copy credentials from dashboard
   - Paste into `.env` file

### Frontend Environment Variables

**File:** `frontend/.env`

```bash
# ============================================================================
# Kanbox Frontend Environment Configuration
# ============================================================================

# ----------------------------------------------------------------------------
# Cloudinary Configuration
# ----------------------------------------------------------------------------
# Used for rendering uploaded images in the UI
# This is safe to expose (read-only cloud name)
VITE_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"

# ----------------------------------------------------------------------------
# API Configuration (Optional)
# ----------------------------------------------------------------------------
# Backend API URL - defaults to same origin in production
# Development: http://localhost:3000/api
# Production: Leave empty to use same-origin
# VITE_API_URL="http://localhost:3000/api"
```

**Note:** Only variables prefixed with `VITE_` are exposed to the browser. Never put secrets here!

---

## Development Workflow

### Git Workflow (Recommended)

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-card-templates

# Make changes, test locally

# Stage and commit changes
git add .
git commit -m "feat: add card template functionality"

# Push to remote
git push origin feature/add-card-templates

# Create pull request on GitHub
```

**Commit Message Convention:**

```
type(scope): short description

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

**Examples:**

```bash
git commit -m "feat: add board member management"
git commit -m "fix: resolve card drag-and-drop position bug"
git commit -m "docs: update API endpoint documentation"
git commit -m "refactor: extract permission logic to service layer"
```

### Running Migrations

**View Migration Status:**

```bash
# Show pending migrations
npm run migrate:pending

# Show executed migrations
npm run migrate:executed
```

**Apply Migrations:**

```bash
# Apply all pending migrations
npm run migrate:up

# Apply next pending migration only
npm run migrate:up -- --step 1
```

**Rollback Migrations:**

```bash
# Rollback last migration
npm run migrate:down

# Rollback specific number of migrations
npm run migrate:down -- --step 2
```

**Create New Migration:**

```bash
# Generate new migration file
npm run migrate:create add-field-name

# This creates: migrations/YYYY.MM.DDTHH.mm.ss.add-field-name.js
```

**Migration File Template:**

```javascript
// migrations/2026.01.24T12.00.00.add-card-priority.js

export async function up({ context: mongoose }) {
  console.log("Adding priority field to cards...");

  await mongoose.connection.db
    .collection("cards")
    .updateMany({}, { $set: { priority: "medium" } });

  console.log("✅ Priority field added to all cards");
}

export async function down({ context: mongoose }) {
  console.log("Removing priority field from cards...");

  await mongoose.connection.db
    .collection("cards")
    .updateMany({}, { $unset: { priority: 1 } });

  console.log("✅ Priority field removed from all cards");
}
```

---

## Running the Application

### Development Mode

**Option 1: Run Both Servers Separately (Recommended)**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Benefits:**

- See backend and frontend logs separately
- Easy to restart individual services
- Better for debugging

**Option 2: Run with Docker Compose (Full Stack)**

```bash
# From backend directory
docker compose up

# This starts:
# - MongoDB container
# - Backend container
# - Frontend served by Vite (if configured)
```

### Production Mode

**Build Frontend:**

```bash
cd frontend
npm run build

# Output in: frontend/dist/
```

**Copy Frontend Build to Backend:**

```bash
# From project root
cp -r frontend/dist/* backend/public/
```

**Start Backend (serves frontend):**

```bash
cd backend
npm start

# Access app at: http://localhost:3000
```

### Access the Application

- **Development:**
  - Frontend: http://localhost:5173
  - Backend API: http://localhost:3000/api
  - Health Check: http://localhost:3000/health

- **Production:**
  - App: http://localhost:3000
  - API: http://localhost:3000/api

---

## Database Management

### MongoDB Access

**Via Docker CLI:**

```bash
# Access MongoDB shell
docker exec -it backend-mongodb-1 mongosh "mongodb://admin:123123@localhost:27017/kanbox_development?authSource=admin"
```

**Common MongoDB Commands:**

```javascript
// Show databases
show dbs

// Use database
use kanbox_development

// Show collections
show collections

// Count documents
db.boards.countDocuments()
db.cards.countDocuments()

// Find documents
db.boards.find().pretty()
db.cards.find({ listId: 'list_id_here' })

// Find one
db.users.findOne({ email: 'user@example.com' })

// Update document
db.boards.updateOne(
  { _id: ObjectId('board_id_here') },
  { $set: { title: 'New Title' } }
)

// Delete document
db.cards.deleteOne({ _id: ObjectId('card_id_here') })

// Drop collection (careful!)
db.cards.drop()
```

### Database Cleanup Scripts

**Clean Database (Keep Users):**

```bash
npm run db:clean
```

This removes:

- All boards
- All lists
- All cards

Keeps:

- Users (for re-login)
- Migrations history

**Clean Everything:**

```bash
npm run db:clean:all
```

**⚠️ Warning:** This removes ALL data including users!

**Database Statistics:**

```bash
npm run db:stats
```

Shows:

- Collection counts
- Database size
- Index information

---

## API Testing

### Using cURL

**Health Check:**

```bash
curl http://localhost:3000/health
```

**Create User:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Boards (with auth cookie):**

```bash
curl http://localhost:3000/api/boards \
  -b cookies.txt
```

**Create Board:**

```bash
curl -X POST http://localhost:3000/api/boards \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "My New Board",
    "style": {
      "background": "#0079bf"
    }
  }'
```

### Using Postman

1. **Import Collection:**
   - Create a new collection: "Kanbox API"
   - Set base URL variable: `{{baseUrl}}` = `http://localhost:3000`

2. **Configure Auth:**
   - Postman automatically handles cookies
   - Login once, subsequent requests will include cookie

3. **Example Requests:**

**Login:**

```
POST {{baseUrl}}/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Create Board:**

```
POST {{baseUrl}}/api/boards
Body (JSON):
{
  "title": "Sprint Planning",
  "style": {
    "background": "#0079bf"
  }
}
```

**Get Board:**

```
GET {{baseUrl}}/api/boards/BOARD_ID_HERE
```

---

## Code Quality Tools

### ESLint (Linting)

**Run Linter:**

```bash
# Backend
cd backend
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues

# Frontend
cd frontend
npm run lint              # Check for issues
```

**Common ESLint Errors:**

```
- 'variable' is defined but never used
- Unexpected console statement
- Missing semicolon
- 'require' is not defined (use ES6 imports)
```

### Prettier (Code Formatting)

**Format Code:**

```bash
# Backend
cd backend
npm run format            # Format all files
npm run format:check      # Check without modifying

# Frontend formatting is handled by Vite/ESLint
```

**Editor Integration (VS Code):**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Pre-commit Hooks (Optional)

**Install Husky:**

```bash
npm install --save-dev husky lint-staged

# Setup
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Configure lint-staged:**

```json
// package.json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Common Issues & Troubleshooting

### MongoDB Connection Fails

**Symptom:**

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Check Docker is running:**

   ```bash
   docker ps
   # Should show backend-mongodb-1 container
   ```

2. **Start MongoDB container:**

   ```bash
   cd backend
   docker compose up -d mongodb
   ```

3. **Verify connection string in `.env`:**

   ```bash
   # For local Docker:
   MONGODB_URI="mongodb://admin:password@localhost:27017/kanbox_development?authSource=admin"
   ```

4. **Check Docker logs:**
   ```bash
   docker logs backend-mongodb-1
   ```

### Port Already in Use

**Symptom:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Find process using port:**

   ```bash
   # Linux/Mac
   lsof -i :3000

   # Windows
   netstat -ano | findstr :3000
   ```

2. **Kill process:**

   ```bash
   # Linux/Mac
   kill -9 <PID>

   # Windows
   taskkill /PID <PID> /F
   ```

3. **Change port in `.env`:**
   ```bash
   PORT=3001
   ```

### CORS Errors

**Symptom:**

```
Access to fetch at 'http://localhost:3000/api/boards' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solutions:**

1. **Verify CORS_ORIGIN in backend `.env`:**

   ```bash
   CORS_ORIGIN="http://localhost:5173"
   ```

2. **Check frontend is running on correct port:**

   ```bash
   # Frontend should be on 5173 (Vite default)
   npm run dev
   ```

3. **Ensure credentials are included in frontend requests:**
   ```javascript
   // services/http-service.js
   axios.defaults.withCredentials = true;
   ```

### JWT Token Issues

**Symptom:**

```
401 Unauthorized
{ "message": "Authentication required" }
```

**Solutions:**

1. **Clear browser cookies:**
   - Open DevTools → Application → Cookies
   - Delete all cookies for localhost:5173

2. **Verify JWT_SECRET is set:**

   ```bash
   # backend/.env
   JWT_SECRET="your_secret_here"
   ```

3. **Login again:**

   ```bash
   # Make sure you login to get new token
   POST /api/auth/login
   ```

4. **Check cookie settings:**
   ```javascript
   // Should have these flags
   res.cookie("token", jwt, {
     httpOnly: true,
     sameSite: "strict",
   });
   ```

### Migration Fails

**Symptom:**

```
Error applying migration: duplicate key error
```

**Solutions:**

1. **Check which migrations are executed:**

   ```bash
   npm run migrate:executed
   ```

2. **Rollback and re-apply:**

   ```bash
   npm run migrate:down
   npm run migrate:up
   ```

3. **Clean database and re-run:**
   ```bash
   npm run db:clean:all
   npm run migrate:up
   ```

### Cloudinary Upload Fails

**Symptom:**

```
Error uploading to Cloudinary: Invalid credentials
```

**Solutions:**

1. **Verify Cloudinary credentials:**

   ```bash
   # backend/.env
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

2. **Check Cloudinary dashboard:**
   - Visit https://console.cloudinary.com
   - Verify credentials are correct

3. **Test with curl:**
   ```bash
   curl -X POST "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload" \
     -F "file=@image.jpg" \
     -F "api_key=YOUR_API_KEY" \
     -F "timestamp=1234567890" \
     -F "signature=YOUR_SIGNATURE"
   ```

### Frontend Build Fails

**Symptom:**

```
Error: Could not resolve 'some-module'
```

**Solutions:**

1. **Clean install:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear Vite cache:**

   ```bash
   rm -rf node_modules/.vite
   ```

3. **Check for version conflicts:**
   ```bash
   npm list
   # Look for UNMET PEER DEPENDENCY warnings
   ```

---

## Production Build

### Build Frontend

```bash
cd frontend

# Build for production
npm run build

# Output in: dist/
```

**Build Output:**

```
dist/
├── assets/
│   ├── index-[hash].js      # Bundled JavaScript
│   └── index-[hash].css     # Bundled CSS
└── index.html               # Entry HTML
```

### Copy to Backend

```bash
# From project root
cp -r frontend/dist/* backend/public/

# Or use a script
npm run build:full
```

### Deploy Backend

```bash
cd backend

# Set environment to production
export NODE_ENV=production

# Start server
npm start

# Server will:
# 1. Serve API at /api/*
# 2. Serve frontend at /*
```

### Environment Variables for Production

**Backend Production `.env`:**

```bash
NODE_ENV="production"
PORT=3000

# Use secure values!
JWT_SECRET="[64-character-random-string]"

# MongoDB Atlas connection
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/kanbox?retryWrites=true&w=majority"

# Cloudinary (same as dev)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Set CORS to your deployed frontend URL
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to secure random string
- [ ] Update `MONGODB_URI` to production database
- [ ] Set `NODE_ENV="production"`
- [ ] Update `CORS_ORIGIN` to production frontend URL
- [ ] Run `npm run migrate:up` on production database
- [ ] Test API endpoints in production environment
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure automated backups
- [ ] Set up error tracking (Sentry, etc.)

---

## Additional Resources

### Documentation Links

- [Main README](../README.md) - Project overview
- [Architecture Docs](ARCHITECTURE.md) - Technical deep-dive
- [Team Contributions](TEAM.md) - Role breakdown

### Technology Docs

- [Express.js](https://expressjs.com/)
- [MongoDB](https://docs.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [React](https://react.dev/)
- [Redux](https://redux.js.org/)
- [Vite](https://vitejs.dev/)
- [Material-UI](https://mui.com/)

### Tools

- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check existing issues:** [GitHub Issues](#)
2. **Search documentation:** Use Ctrl+F in docs
3. **Ask the team:** Contact via [email/Slack/Discord]
4. **Create an issue:** Provide error logs and steps to reproduce

---

**Happy coding! 🚀**
