# Architecture Documentation

> Deep-dive into Kanbox's technical architecture, design decisions, and trade-off analysis

This document explains the "why" behind technical choices, not just the "what" was built. It demonstrates architectural thinking, consideration of alternatives, and understanding of trade-offs in real-world software development.

---

## Table of Contents

1. [Tech Stack Rationale](#tech-stack-rationale)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [Authentication & Security](#authentication--security)
5. [Permission System](#permission-system)
6. [API Design](#api-design)
7. [Migration Framework](#migration-framework)
8. [Performance Considerations](#performance-considerations)
9. [Design Trade-offs Summary](#design-trade-offs-summary)
10. [Future Improvements](#future-improvements)

---

## Tech Stack Rationale

### Backend Technology Choices

#### Node.js + Express

**Decision:** Use Node.js with Express framework for the backend API

**Rationale:**

- **JavaScript Everywhere:** Unified language across frontend and backend reduces context switching
- **Async I/O:** Event-driven architecture handles I/O-bound operations efficiently
- **Rich Ecosystem:** Extensive npm package availability for common patterns
- **Team Familiarity:** Team had prior experience with Node.js

**Alternatives Considered:**

- **Python + Django/Flask:** More structured but different language from frontend
- **Java + Spring Boot:** Enterprise-grade but steeper learning curve and verbosity
- **Go:** High performance but less familiar to team, smaller ecosystem

**Trade-offs Accepted:**

- Less strict type safety (mitigated with careful validation)
- Single-threaded nature limits CPU-intensive operations
- Callback/promise complexity (addressed with async/await)

#### MongoDB + Mongoose

**Decision:** NoSQL document database with Mongoose ODM

**Rationale:**

- **Document Model:** Naturally maps to hierarchical workspace → board → list → card structure
- **Flexible Schema:** Cards can have varying fields (labels, attachments, custom properties) without rigid schema migrations
- **Nested Documents:** Efficient for embedded member arrays and label objects
- **JSON Native:** Direct serialization to/from JSON for API responses

**Alternatives Considered:**

- **PostgreSQL:** Relational integrity guarantees, but complex joins for nested hierarchies
- **Redis:** Extreme performance but no complex querying
- **MySQL:** Traditional choice but less flexible schema evolution

**Trade-offs Accepted:**

- Less data integrity enforcement (no foreign key constraints)
- Potential for data duplication (embedded documents)
- No ACID transactions across collections (MongoDB has document-level atomicity)
- Higher memory usage compared to SQL databases

**Why Mongoose ODM?**

- Schema validation in application layer
- Middleware hooks for business logic
- Population for references (virtual joins)
- Type casting and data sanitization

#### JWT (JSON Web Tokens) in HTTP-only Cookies

**Decision:** Store JWT authentication tokens in HTTP-only cookies

**Rationale:**

- **XSS Protection:** JavaScript cannot access HTTP-only cookies, preventing token theft via XSS attacks
- **Stateless:** No server-side session storage required, enabling horizontal scaling
- **Automatic Transmission:** Browser automatically sends cookies with requests
- **Mobile-Friendly:** Can still use bearer tokens for mobile apps if needed

**Alternatives Considered:**

| Approach                 | Pros                      | Cons                                    | Decision                    |
| ------------------------ | ------------------------- | --------------------------------------- | --------------------------- |
| **localStorage JWT**     | Simple, accessible to JS  | Vulnerable to XSS                       | ❌ Rejected - Security risk |
| **Session-based**        | Secure, traditional       | Requires session store, harder to scale | ❌ Rejected - Scalability   |
| **HTTP-only Cookie JWT** | XSS protection, stateless | CSRF vulnerability, CORS complexity     | ✅ **Chosen**               |

**Trade-offs Accepted:**

- CSRF vulnerability (mitigated with SameSite=strict cookie attribute)
- CORS configuration complexity (requires credentials: true)
- Cannot access token from client-side JavaScript
- More complex setup than simple localStorage

#### Cloudinary for File Storage

**Decision:** Use Cloudinary CDN for image uploads instead of local storage

**Rationale:**

- **CDN Distribution:** Global edge servers for fast image delivery
- **Automatic Optimization:** Image transformation (resize, crop, format conversion)
- **No Server Storage:** Don't burden backend server with file storage
- **URL-based Transformations:** On-the-fly image manipulation via URL parameters

**Alternatives Considered:**

- **AWS S3:** More infrastructure setup, additional service management
- **Local File System:** Simple but not scalable, no CDN benefits
- **GridFS (MongoDB):** Stores in database but no optimization features

**Trade-offs Accepted:**

- External service dependency
- Monthly quota limits on free tier
- Vendor lock-in (mitigatable with abstraction layer)

## System Architecture

### High-Level Component Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Redux    │  │  React     │  │ Material-UI│            │
│  │   Store    │  │ Components │  │   Theme    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP Requests (REST API)
             │
┌────────────▼──────────────────────────────────────────────────┐
│                    Backend (Express API)                       │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           Middleware Pipeline                         │    │
│  │  CORS → Body Parser → authenticate → authorize       │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Routes    │  │Controllers │  │  Services  │             │
│  │            │→ │            │→ │            │             │
│  │ /api/*     │  │ Business   │  │ DB Logic   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└────────────┬──────────────────────────┬───────────────────────┘
             │                          │
    ┌────────▼──────────┐     ┌────────▼────────┐
    │   MongoDB         │     │   Cloudinary    │
    │   (Document DB)   │     │   (CDN Storage) │
    └───────────────────┘     └─────────────────┘
```

### Backend Directory Structure

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   │
│   ├── routes/                   # API endpoint definitions
│   │   ├── index.js              # Route aggregation
│   │   ├── auth.js               # /api/auth/*
│   │   ├── workspaces.js         # /api/workspaces/*
│   │   ├── boards.js             # /api/boards/*
│   │   ├── list.js               # /api/lists/*
│   │   ├── cards.js              # /api/cards/*
│   │   └── upload.js             # /api/upload
│   │
│   ├── controllers/              # Request handlers (HTTP layer)
│   │   ├── auth-controller.js    # Login, signup, logout
│   │   ├── workspace-controller.js
│   │   ├── board-controller.js
│   │   ├── list-controller.js
│   │   ├── card-controller.js
│   │   └── upload-controller.js
│   │
│   ├── services/                 # Business logic (reusable)
│   │   ├── workspace-service.js
│   │   ├── board-service.js
│   │   ├── list-service.js
│   │   ├── card-service.js
│   │   ├── upload-service.js
│   │   ├── position-service.js   # Fractional indexing logic
│   │   ├── filter-service.js     # Card filtering utilities
│   │   └── permissions/          # Authorization rules
│   │       ├── workspace.js
│   │       ├── board.js
│   │       ├── list.js
│   │       ├── card.js
│   │       └── helpers.js
│   │
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Workspace.js
│   │   ├── Board.js
│   │   ├── List.js
│   │   └── Card.js
│   │
│   ├── middleware/               # Request interceptors
│   │   ├── authenticate.js       # JWT verification
│   │   ├── authorize.js          # Permission checks
│   │   ├── load-board.js         # Pre-fetch board data
│   │   └── error-handler.js      # Centralized error handling
│   │
│   ├── db/                       # Database management
│   │   ├── migrate.js            # Migration CLI
│   │   ├── umzug.js              # Migration config
│   │   ├── clean-db.js           # Database cleanup utility
│   │   └── migrations/           # Version-controlled schema changes
│   │       └── 2026.01.10T11.22.00.add-workspace.js
│   │
│   ├── config/                   # Configuration
│   │   ├── env.js                # Environment variable parsing
│   │   └── database.js           # MongoDB connection
│   │
│   └── utils/                    # Utility functions
│       └── utils.js
│
├── public/                       # Static files (production build)
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── docker-compose.yml            # Local MongoDB container
└── Dockerfile                    # Backend container image
```

### Request Flow with Middleware Pipeline

```
1. Client HTTP Request
   ↓
2. CORS Middleware
   - Validate origin
   - Set CORS headers
   ↓
3. Body Parser
   - Parse JSON body
   - Parse URL-encoded data
   ↓
4. Cookie Parser
   - Extract cookies from headers
   ↓
5. Authenticate Middleware (if route requires auth)
   - Extract JWT from HTTP-only cookie
   - Verify token signature
   - Decode user ID
   - Fetch user from database
   - Attach req.currentUser
   ↓
6. Load Board Middleware (for board-related routes)
   - Extract boardId from params
   - Fetch board with members
   - Attach req.board
   ↓
7. Authorize Middleware (if route requires specific permissions)
   - Check if currentUser has required role
   - Throw 403 if unauthorized
   ↓
8. Controller
   - Validate request data
   - Delegate to service layer
   ↓
9. Service Layer
   - Execute business logic
   - Interact with database
   - Return result or throw error
   ↓
10. Response / Error Handler
    - Success: Send JSON response
    - Error: Catch and format error response
```

**Example Route with Full Middleware Chain:**

```javascript
// routes/boards.js
router.put(
  "/boards/:boardId",
  authenticate, // Step 5: Verify JWT, attach currentUser
  loadBoard, // Step 6: Fetch board, attach req.board
  requireBoardAdmin, // Step 7: Check if user is board admin
  boardController.update // Step 8-9: Execute update logic
);
```

**Benefits of This Architecture:**

- ✅ **Separation of Concerns:** Each middleware has single responsibility
- ✅ **Reusability:** Middleware can be composed for different routes
- ✅ **Testability:** Each layer can be unit tested independently
- ✅ **Readability:** Route definitions show exactly what checks happen
- ✅ **Maintainability:** Changes to auth logic happen in one place

---

## Database Design

### Entity-Relationship Structure

```
┌─────────────┐
│    User     │
│ ─────────── │
│ _id         │
│ email       │
│ password    │
│ fullName    │
└──────┬──────┘
       │
       │ creates/members
       │
       ▼
┌─────────────┐
│    Board    │
│ ─────────── │
│ _id         │
│ title       │
│ members[]   │
│ createdBy   │
│ style{bg}   │
└──────┬──────┘
       │
       │ contains
       │
       ▼
┌─────────────┐
│    List     │
│ ─────────── │
│ _id         │
│ title       │
│ boardId     │
│ position    │
└──────┬──────┘
       │
       │ contains
       │
       ▼
┌─────────────┐
│    Card     │
│ ─────────── │
│ _id         │
│ title       │
│ description │
│ listId      │
│ position    │
│ labels[]    │
│ members[]   │
│ attachments │
│ comments[]  │
│ dueDate     │
│ cover{url}  │
└─────────────┘
```

### Schema Decisions & Rationale

#### 1. Hierarchical Data Model

**Board → List → Card**

```javascript
// Example data structure
{
  board: {
    _id: "board_456",
    title: "Sprint Planning",
    members: [
      { userId: "user_1", role: "admin" },
      { userId: "user_2", role: "member" }
    ]
  },
  list: {
    _id: "list_789",
    title: "To Do",
    boardId: "board_456",   // Reference to parent board
    position: "a0"          // Fractional index
  },
  card: {
    _id: "card_abc",
    title: "Implement auth",
    listId: "list_789",     // Reference to parent list
    position: "a0V",        // Fractional index
    labels: [...],          // Embedded array
    members: [...],         // Embedded array
    comments: [...]         // Embedded subdocuments
  }
}
```

**Why This Structure?**

- Clear parent-child relationships
- Easy to query "all lists in board" or "all cards in list"
- Simple permission model through board membership

#### 2. Embedded vs. Referenced Data

**Decision Matrix:**

| Data              | Storage Strategy  | Rationale                                         |
| ----------------- | ----------------- | ------------------------------------------------- |
| **User Info**     | Referenced by ID  | Users change independently, avoid duplication     |
| **Board Members** | Embedded in Board | Small arrays (<50), frequently accessed together  |
| **Card Labels**   | Embedded in Card  | Card-specific, displayed with card                |
| **Card Comments** | Embedded in Card  | Lifecycle tied to card, not queried independently |
| **Attachments**   | Embedded URLs     | Just metadata, actual files in Cloudinary         |

**Example: Why Embed Members in Board?**

```javascript
// Embedded approach (CHOSEN)
const board = await Board.findById(boardId);
// Already have member data, no additional query needed
const canEdit = board.members.some(
  m => m.userId.equals(currentUser._id) && m.role === "admin"
);

// Referenced approach (ALTERNATIVE)
const board = await Board.findById(boardId);
const members = await BoardMember.find({ boardId }); // Extra query
const canEdit = members.some(
  m => m.userId.equals(currentUser._id) && m.role === "admin"
);
```

**Benefits of Embedding:**

- ✅ Single database query to get board with members
- ✅ Atomic updates (members array updated with board in one operation)
- ✅ Simpler code, no join logic needed

**Drawbacks:**

- ❌ Potential for large documents if many members (MongoDB has 16MB limit)
- ❌ Less normalized, member data duplicated if in multiple boards
- ❌ Harder to query "all boards where user is member" (requires array query)

**Acceptable Because:**

- Most boards have <20 members (well under document size limit)
- Query pattern is "get board data" not "get user's boards" (optimize for common case)

#### 3. Fractional Indexing for Card Positioning

**Problem:** How to efficiently reorder cards with drag-and-drop?

**Traditional Approach (Integer Positioning):**

```javascript
// List with 5 cards
cards: [
  { id: 1, position: 0 },
  { id: 2, position: 1 },
  { id: 3, position: 2 },
  { id: 4, position: 3 },
  { id: 5, position: 4 },
];

// Drag card #2 to position 0
// Must re-index ALL cards: O(n) database updates
cards: [
  { id: 2, position: 0 }, // Update
  { id: 1, position: 1 }, // Update (was 0)
  { id: 3, position: 2 }, // Update (was 1)
  { id: 4, position: 3 }, // Update (was 2)
  { id: 5, position: 4 }, // Update (was 3)
];
```

**Fractional Indexing Approach:**

```javascript
// Initial positions (lexicographic strings)
cards: [
  { id: 1, position: "a0" },
  { id: 2, position: "a1" },
  { id: 3, position: "a2" },
  { id: 4, position: "a3" },
  { id: 5, position: "a4" },
];

// Drag card #2 between positions "a0" and "a1"
// Only update moved card: O(1) database update!
const newPosition = generateKeyBetween("a0", "a1"); // "a0V"
cards: [
  { id: 1, position: "a0" },
  { id: 2, position: "a0V" }, // Only this card updated!
  { id: 3, position: "a1" },
  { id: 4, position: "a2" },
  { id: 5, position: "a3" },
];
```

**Library Used:** [`fractional-indexing`](https://www.npmjs.com/package/fractional-indexing)

**Benefits:**

- ✅ O(1) position updates instead of O(n)
- ✅ No race conditions with concurrent drag operations
- ✅ Infinite precision (can always find a position between any two)

**Trade-offs:**

- ❌ More complex algorithm than simple integers
- ❌ Positions grow in string length over time (mitigated with occasional re-indexing)
- ❌ Harder to debug (positions like "a0V" vs. clean integers)

**Implementation Example:**

```javascript
// services/position-service.js
import { generateKeyBetween } from "fractional-indexing";

export function calculateNewPosition(prevPosition, nextPosition) {
  return generateKeyBetween(prevPosition, nextPosition);
}

// Usage in controller
const newPosition = calculateNewPosition(
  listCards[targetIndex - 1]?.position || null,
  listCards[targetIndex]?.position || null
);

await Card.findByIdAndUpdate(cardId, { position: newPosition });
```

#### 4. Schema Validation with Mongoose

**Example: Board Schema**

```javascript
// models/Board.js
const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Board title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null, // Boards can exist without workspace
    },

    members: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],

    style: {
      background: {
        type: String,
        default: "#0079bf", // Trello blue
      },
      backgroundImage: String,
    },
  },
  {
    timestamps: true, // Automatic createdAt, updatedAt
  }
);

// Index for efficient queries
boardSchema.index({ "members._id": 1 }); // Find boards by member
```

**Benefits of Schema Validation:**

- ✅ Data integrity enforced at application layer
- ✅ Clear error messages for invalid data
- ✅ Defaults reduce boilerplate in controllers
- ✅ Middleware hooks for complex validation

---

## Authentication & Security

### JWT Cookie Authentication Implementation

#### Architecture Decision

**Chosen Approach:** JWT tokens stored in HTTP-only cookies

**Flow:**

```
┌──────────┐                                ┌──────────┐
│  Client  │                                │  Server  │
└────┬─────┘                                └────┬─────┘
     │                                           │
     │  POST /api/auth/login                     │
     │  { email, password }                      │
     ├──────────────────────────────────────────▶│
     │                                           │
     │                                      ┌────▼────┐
     │                                      │ Verify  │
     │                                      │password │
     │                                      └────┬────┘
     │                                           │
     │                                      ┌────▼────┐
     │                                      │Generate │
     │                                      │  JWT    │
     │                                      └────┬────┘
     │                                           │
     │  Set-Cookie: token=JWT; HttpOnly         │
     │  { success: true, user: {...} }          │
     │◀──────────────────────────────────────────┤
     │                                           │
     │                                           │
     │  GET /api/boards                          │
     │  Cookie: token=JWT                        │
     ├──────────────────────────────────────────▶│
     │                                           │
     │                                      ┌────▼────┐
     │                                      │ Verify  │
     │                                      │  JWT    │
     │                                      └────┬────┘
     │                                           │
     │  { boards: [...] }                        │
     │◀──────────────────────────────────────────┤
```

#### Implementation Details

**Login Flow:**

```javascript
// controllers/auth-controller.js
export async function login(req, res) {
  const { email, password } = req.body;

  // 1. Find user
  const user = await User.findOne({ email });
  if (!user) throw createError(401, "Invalid credentials");

  // 2. Verify password (bcrypt comparison)
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw createError(401, "Invalid credentials");

  // 3. Generate JWT
  const token = jwt.sign(
    { userId: user._id }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: "7d" } // Expiration
  );

  // 4. Set HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 5. Return user data (without password)
  res.json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}
```

**Authentication Middleware:**

```javascript
// middleware/authenticate.js
export async function authenticate(req, res, next) {
  try {
    // 1. Extract token from cookie
    const token = req.cookies.token;
    if (!token) {
      throw createError(401, "Authentication required");
    }

    // 2. Verify token signature and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch current user from database
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      throw createError(401, "User not found");
    }

    // 4. Attach user to request object
    req.currentUser = currentUser;

    // 5. Continue to next middleware
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw createError(401, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw createError(401, "Token expired");
    }
    throw error;
  }
}
```

#### Security Measures

**1. Password Hashing with bcrypt**

```javascript
// models/User.js
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();

  // Hash with 10 salt rounds (2^10 iterations)
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**Why 10 Rounds?**

- Balance between security and performance
- ~100ms to hash (acceptable for login)
- Exponentially increases brute-force time
- Industry standard for web applications

**2. HTTP-only Cookie Protection**

```javascript
// Cookie flags explained
{
  httpOnly: true,        // ✅ Prevents JavaScript access (XSS protection)
  secure: true,          // ✅ HTTPS only (prevents MITM attacks)
  sameSite: 'strict',    // ✅ Blocks CSRF attacks
  maxAge: 604800000      // ✅ 7-day expiration
}
```

**Security Benefits:**

- **XSS Protection:** Even if attacker injects malicious script, they cannot steal the token
- **CSRF Protection:** `sameSite: strict` prevents token from being sent in cross-origin requests
- **Transport Security:** `secure` flag ensures token only transmitted over HTTPS

**3. CORS Configuration**

```javascript
// app.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN, // Only allow frontend domain
  credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));
```

**Why `credentials: true`?**

- Required for browser to send cookies in cross-origin requests
- Without this, cookies won't be included in fetch() calls from frontend

**4. Input Validation**

```javascript
// Example: Mongoose schema validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters"],
  },
});
```

**Additional Validation Layer (Future Improvement):**

- Consider adding express-validator or Joi for request validation
- Sanitize HTML input to prevent XSS in card descriptions

#### Security Vulnerabilities & Mitigations

| Vulnerability      | Risk                                  | Mitigation                               |
| ------------------ | ------------------------------------- | ---------------------------------------- |
| **XSS**            | Malicious script steals tokens        | ✅ HTTP-only cookies (JS cannot access)  |
| **CSRF**           | Attacker forces user to make requests | ✅ SameSite=strict cookie attribute      |
| **MITM**           | Token intercepted in transit          | ✅ Secure flag (HTTPS only)              |
| **Brute Force**    | Password guessing                     | ⚠️ TODO: Add rate limiting               |
| **SQL Injection**  | N/A (using MongoDB)                   | ✅ Mongoose query escaping               |
| **Password Leaks** | Plaintext passwords stolen            | ✅ bcrypt hashing with salt              |
| **Token Replay**   | Old tokens used after logout          | ⚠️ TODO: Token blacklist or short expiry |

---

## Permission System

### Design Philosophy

**Principle:** Fail-secure by default - explicitly grant access, implicitly deny

**Granularity Levels:**

1. **Workspace Level:** Admin can manage all boards in workspace
2. **Board Level:** Admin can configure board, Member can view/edit
3. **Card Level:** Inherited from board membership

### Permission Hierarchy

```
┌──────────────────────────────────────────────────────┐
│              Workspace Admin                         │
│  ✓ Create/delete boards in workspace                │
│  ✓ Add/remove workspace members                     │
│  ✓ Implicit board admin access to all boards        │
└────────────────┬─────────────────────────────────────┘
                 │ (inherits)
                 ▼
┌──────────────────────────────────────────────────────┐
│              Board Admin                             │
│  ✓ Configure board settings (title, background)     │
│  ✓ Add/remove board members                         │
│  ✓ Delete board                                      │
│  ✓ Implicit member access                           │
└────────────────┬─────────────────────────────────────┘
                 │ (inherits)
                 ▼
┌──────────────────────────────────────────────────────┐
│              Board Member                            │
│  ✓ View board and all cards                         │
│  ✓ Create/edit/delete cards                         │
│  ✓ Comment on cards                                 │
│  ✓ Upload attachments                               │
└──────────────────────────────────────────────────────┘
```

### Implementation Architecture

**Structure:** Separation of permission logic from route handlers

```
routes/boards.js          → Define endpoints
    ↓
middleware/authorize.js   → Check permissions
    ↓
services/permissions/     → Permission logic
```

#### Permission Service (Pure Functions)

```javascript
// services/permissions/board.js

/**
 * Check if user can view a board
 * @param {User} user - Current user
 * @param {Board} board - Board to check
 * @returns {boolean}
 */
export function canViewBoard(user, board) {
  // Must be a member of the board
  return board.members.some(member => member._id.equals(user._id));
}

/**
 * Check if user can edit a board (title, settings)
 * @param {User} user - Current user
 * @param {Board} board - Board to check
 * @returns {boolean}
 */
export function canEditBoard(user, board) {
  // Must be an admin member
  return board.members.some(
    member => member._id.equals(user._id) && member.role === "admin"
  );
}

/**
 * Check if user can delete a board
 * @param {User} user - Current user
 * @param {Board} board - Board to check
 * @returns {boolean}
 */
export function canDeleteBoard(user, board) {
  // Must be an admin member
  return canEditBoard(user, board);
}

/**
 * Check if user can add members to a board
 * @param {User} user - Current user
 * @param {Board} board - Board to check
 * @returns {boolean}
 */
export function canAddMember(user, board) {
  // Must be an admin member
  return canEditBoard(user, board);
}
```

**Benefits of Pure Functions:**

- ✅ **Testable:** Easy to unit test without mocking database
- ✅ **Reusable:** Import in controllers, middleware, or services
- ✅ **Composable:** Combine permissions for complex checks
- ✅ **Clear:** Single source of truth for permission rules

#### Authorization Middleware

```javascript
// middleware/authorize.js
import * as permissions from "../services/permissions/index.js";
import createError from "http-errors";

/**
 * Require user to be board admin
 * Assumes req.currentUser and req.board are already set
 */
export function requireBoardAdmin(req, res, next) {
  if (!permissions.board.canEditBoard(req.currentUser, req.board)) {
    throw createError(403, "Insufficient permissions - board admin required");
  }
  next();
}

/**
 * Require user to be board member
 * Assumes req.currentUser and req.board are already set
 */
export function requireBoardMember(req, res, next) {
  if (!permissions.board.canViewBoard(req.currentUser, req.board)) {
    throw createError(403, "Board access denied");
  }
  next();
}
```

#### Complete Route Example

```javascript
// routes/boards.js
import express from "express";
import * as boardController from "../controllers/board-controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { loadBoard } from "../middleware/load-board.js";
import {
  requireBoardAdmin,
  requireBoardMember,
} from "../middleware/authorize.js";

const router = express.Router();

// Get board details (requires membership)
router.get(
  "/boards/:boardId",
  authenticate, // 1. Verify JWT, attach currentUser
  loadBoard, // 2. Fetch board, attach req.board
  requireBoardMember, // 3. Check if user is member
  boardController.getById
);

// Update board (requires admin)
router.put(
  "/boards/:boardId",
  authenticate,
  loadBoard,
  requireBoardAdmin, // 3. Check if user is admin
  boardController.update
);

// Delete board (requires admin)
router.delete(
  "/boards/:boardId",
  authenticate,
  loadBoard,
  requireBoardAdmin,
  boardController.remove
);

export default router;
```

**Benefits of This Pattern:**

- ✅ Route definitions clearly show required permissions
- ✅ Permission logic is centralized and reusable
- ✅ Easy to add new permission levels without changing routes
- ✅ Middleware composition makes intent explicit

### Permission Edge Cases Handled

**1. Workspace Admin Implicit Access**

```javascript
// services/permissions/board.js
export function canEditBoard(user, board) {
  // Check direct board membership
  const isBoardAdmin = board.members.some(m =>
    m._id.equals(user._id) && m.role === 'admin'
  );

  if (isBoardAdmin) return true;

  // Check if user is workspace admin (if board belongs to workspace)
  if (board.workspaceId) {
    const workspace = await Workspace.findById(board.workspaceId);
    const isWorkspaceAdmin = workspace.members.some(m =>
      m._id.equals(user._id) && m.role === 'admin'
    );
    return isWorkspaceAdmin;
  }

  return false;
}
```

**2. Card Permissions Inherited from Board**

```javascript
// services/permissions/card.js
export async function canEditCard(user, card) {
  // Fetch parent board
  const list = await List.findById(card.listId);
  const board = await Board.findById(list.boardId);

  // Can edit card if member of board
  return permissions.board.canViewBoard(user, board);
}
```

### Future Permission Enhancements

- [ ] **Workspace Roles:** Owner, Admin, Member, Guest with different levels
- [ ] **Board Privacy:** Public (view-only), Private, Secret
- [ ] **Card-Level Permissions:** Restrict editing to assigned members only
- [ ] **Permission Caching:** Redis cache for frequently checked permissions
- [ ] **Audit Log:** Track permission changes and access attempts

---

## API Design

### RESTful Resource Structure

**Principle:** Resources are nouns, actions are HTTP verbs

#### Endpoint Organization

```
Authentication
POST   /api/auth/signup        Create new user account
POST   /api/auth/login         Authenticate user
POST   /api/auth/logout        Clear auth cookie

Workspaces
GET    /api/workspaces                    List user's workspaces
POST   /api/workspaces                    Create workspace
GET    /api/workspaces/:workspaceId       Get workspace details
PUT    /api/workspaces/:workspaceId       Update workspace
DELETE /api/workspaces/:workspaceId       Delete workspace

Boards
GET    /api/boards                        List user's boards
POST   /api/boards                        Create board
GET    /api/boards/:boardId               Get board with lists/cards
PUT    /api/boards/:boardId               Update board settings
DELETE /api/boards/:boardId               Delete board
POST   /api/boards/:boardId/members       Add member to board
DELETE /api/boards/:boardId/members/:userId  Remove member

Lists
POST   /api/boards/:boardId/lists         Create list in board
GET    /api/lists/:listId                 Get list details
PUT    /api/lists/:listId                 Update list (title, position)
DELETE /api/lists/:listId                 Delete list

Cards
POST   /api/lists/:listId/cards           Create card in list
GET    /api/cards/:cardId                 Get card with full details
PUT    /api/cards/:cardId                 Update card
DELETE /api/cards/:cardId                 Delete card
POST   /api/cards/:cardId/comments        Add comment
POST   /api/cards/:cardId/attachments     Upload attachment
PUT    /api/cards/:cardId/move            Move card to different list

Uploads
POST   /api/upload                        Upload file to Cloudinary
```

### Consistent Response Format

**Success Response:**

```json
{
  "success": true,
  "data": {
    "_id": "board_123",
    "title": "Project Board",
    "members": [...]
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Board not found",
  "error": {
    "code": 404,
    "details": "Board with ID board_123 does not exist"
  }
}
```

### Middleware Pipeline Pattern

**Example: Update Card Endpoint**

```javascript
router.put(
  "/cards/:cardId",
  authenticate, // 1. Verify user
  loadCard, // 2. Fetch card and parent board
  requireBoardMember, // 3. Check board access
  cardController.update // 4. Execute update
);
```

**Middleware Responsibilities:**

**1. `authenticate`** - Verify JWT and attach user

```javascript
export async function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) throw createError(401, "Authentication required");

  const decoded = jwt.verify(token, JWT_SECRET);
  req.currentUser = await User.findById(decoded.userId);
  next();
}
```

**2. `loadCard`** - Pre-fetch card and related data

```javascript
export async function loadCard(req, res, next) {
  const card = await Card.findById(req.params.cardId);
  if (!card) throw createError(404, "Card not found");

  const list = await List.findById(card.listId);
  const board = await Board.findById(list.boardId);

  req.card = card;
  req.list = list;
  req.board = board;
  next();
}
```

**3. `requireBoardMember`** - Check permissions

```javascript
export function requireBoardMember(req, res, next) {
  if (!permissions.board.canViewBoard(req.currentUser, req.board)) {
    throw createError(403, "Access denied");
  }
  next();
}
```

**4. `cardController.update`** - Business logic

```javascript
export async function update(req, res) {
  const { title, description, labels } = req.body;

  // Update card
  req.card.title = title || req.card.title;
  req.card.description = description || req.card.description;
  req.card.labels = labels || req.card.labels;

  await req.card.save();

  res.json({ success: true, data: req.card });
}
```

### Error Handling Strategy

**Centralized Error Handler:**

```javascript
// middleware/error-handler.js
export default function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error(err);

  // Default to 500 if no status code
  const statusCode = err.statusCode || 500;

  // Send consistent error response
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    error: {
      code: statusCode,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
}
```

**Usage in Routes:**

```javascript
// Any thrown error is caught by error handler
router.get("/boards/:id", async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw createError(404, "Board not found"); // Auto-handled

  res.json({ success: true, data: board });
});
```

---

## Migration Framework

### Why Custom Migrations?

**Problem:** Manual database updates are error-prone and hard to coordinate across team

**Requirements:**

- Version-controlled schema changes
- Repeatable deployments
- Rollback capability
- Team synchronization (everyone runs same migrations)

**Solution:** Umzug migration framework with custom CLI

### Migration Structure

```
backend/src/db/
├── migrate.js                              # CLI tool
├── umzug.js                                # Configuration
├── clean-db.js                             # Database cleanup utility
└── migrations/
    ├── 2025.11.27T17.20.48.seed-db.js              # Initial seed
    ├── 2025.12.04T19.44.06.seed-card-labels.js     # Add labels
    ├── 2026.01.10T11.22.00.add-workspace.js        # Add workspace model
    └── ...
```

### Migration File Format

**Example: Add Workspace Feature**

```javascript
// migrations/2026.01.10T11.22.00.add-workspace.js

/**
 * Add workspaceId field to all boards
 * @param {Object} params
 * @param {import('mongoose')} params.context - Mongoose instance
 */
export async function up({ context: mongoose }) {
  console.log("Adding workspaceId field to boards...");

  // Add workspaceId field (defaults to null for existing boards)
  await mongoose.connection.db
    .collection("boards")
    .updateMany({}, { $set: { workspaceId: null } });

  console.log("✅ workspaceId field added to all boards");
}

/**
 * Remove workspaceId field from all boards (rollback)
 * @param {Object} params
 * @param {import('mongoose')} params.context - Mongoose instance
 */
export async function down({ context: mongoose }) {
  console.log("Removing workspaceId field from boards...");

  await mongoose.connection.db
    .collection("boards")
    .updateMany({}, { $unset: { workspaceId: 1 } });

  console.log("✅ workspaceId field removed from all boards");
}
```

### Migration Commands

```bash
# Apply all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Show pending migrations
npm run migrate:pending

# Show executed migrations
npm run migrate:executed

# Create new migration file
npm run migrate:create add-field-name
```

### Migration CLI Implementation

```javascript
// db/migrate.js
import { Umzug } from "umzug";
import mongoose from "mongoose";

const umzug = new Umzug({
  migrations: {
    glob: "src/db/migrations/*.js",
  },
  context: mongoose,
  storage: {
    // Store migration state in MongoDB collection
    collectionName: "migrations",
    async logMigration({ name }) {
      await mongoose.connection.db
        .collection("migrations")
        .insertOne({ name, migratedAt: new Date() });
    },
    async unlogMigration({ name }) {
      await mongoose.connection.db.collection("migrations").deleteOne({ name });
    },
    async executed() {
      const migrations = await mongoose.connection.db
        .collection("migrations")
        .find()
        .toArray();
      return migrations.map(m => m.name);
    },
  },
  logger: console,
});

// CLI commands
const command = process.argv[2];

switch (command) {
  case "up":
    await umzug.up();
    break;
  case "down":
    await umzug.down();
    break;
  case "pending":
    const pending = await umzug.pending();
    console.log("Pending migrations:", pending);
    break;
  case "executed":
    const executed = await umzug.executed();
    console.log("Executed migrations:", executed);
    break;
  case "create":
    const name = process.argv[3];
    await umzug.create({ name });
    break;
  default:
    console.log("Unknown command:", command);
}
```

### Benefits of This System

- ✅ **Version Control:** Migration files tracked in Git
- ✅ **Team Sync:** Everyone runs same migrations in same order
- ✅ **Auditability:** MongoDB `migrations` collection tracks what's applied
- ✅ **Rollback:** Can undo changes with `down()` method
- ✅ **Deployment:** CI/CD can run migrations automatically
- ✅ **Data Seeding:** Can populate demo data via migrations

### Best Practices

**1. Naming Convention:**

```
YYYY.MM.DDTHH.mm.ss.description.js
2026.01.10T11.22.00.add-workspace.js
```

**2. Idempotent Migrations:**

```javascript
// Check if field exists before adding
export async function up({ context: mongoose }) {
  const sample = await mongoose.connection.db.collection("boards").findOne();

  if (!sample.workspaceId) {
    await mongoose.connection.db
      .collection("boards")
      .updateMany({}, { $set: { workspaceId: null } });
  }
}
```

**3. Always Implement down():**

```javascript
// Every up() should have a corresponding down()
export async function down({ context: mongoose }) {
  await mongoose.connection.db
    .collection("boards")
    .updateMany({}, { $unset: { workspaceId: 1 } });
}
```

---

## Performance Considerations

### Implemented Optimizations

#### 1. Fractional Indexing for Drag-and-Drop

**Complexity Reduction:** O(n) → O(1)

```javascript
// Traditional approach: O(n) updates
await Card.updateMany(
  { listId, position: { $gte: targetPosition } },
  { $inc: { position: 1 } }
);

// Fractional indexing: O(1) update
const newPosition = generateKeyBetween(prevCard?.position, nextCard?.position);
await Card.findByIdAndUpdate(cardId, { position: newPosition });
```

**Performance Impact:**

- List with 100 cards: 1 DB update instead of 50+ updates
- Eliminates race conditions in concurrent drag operations
- Instant response for user

#### 2. Mongoose `lean()` for Read-Only Queries

**Use Case:** When you don't need Mongoose document methods

```javascript
// Without lean: Full Mongoose document (slower, more memory)
const boards = await Board.find({ "members._id": userId });

// With lean: Plain JavaScript objects (faster, less memory)
const boards = await Board.find({ "members._id": userId }).lean();
```

**Performance Impact:**

- ~50% faster query execution
- 30-40% less memory usage
- Use when you don't need `.save()`, `.populate()`, virtuals, etc.

#### 3. Selective Field Population

**Avoid Over-Fetching:**

```javascript
// Bad: Fetch all user fields for every board member
const board = await Board.findById(boardId).populate("members._id"); // Returns password hash, timestamps, etc.

// Good: Only fetch needed fields
const board = await Board.findById(boardId).populate(
  "members._id",
  "fullName email"
); // Only name and email
```

#### 4. Cloudinary CDN for Image Delivery

**Benefits:**

- Offload static file serving from backend
- Global CDN edge servers (low latency worldwide)
- Automatic image optimization
- On-the-fly transformations

```javascript
// Example: Responsive image URLs
const thumbnailUrl = cloudinary.url(publicId, {
  width: 200,
  height: 150,
  crop: "fill",
  quality: "auto",
  fetch_format: "auto",
});
```

### Database Indexing Strategy

**Current Indexes:**

```javascript
// Board model
boardSchema.index({ "members._id": 1 }); // Find boards by member
boardSchema.index({ workspaceId: 1 }); // Find boards in workspace

// Card model
cardSchema.index({ listId: 1 }); // Find cards in list
cardSchema.index({ position: 1 }); // Sort cards by position

// List model
listSchema.index({ boardId: 1 }); // Find lists in board
listSchema.index({ position: 1 }); // Sort lists by position
```

**Impact:**

- Query time reduction from O(n) to O(log n)
- Essential for queries on large collections

### Planned Performance Improvements

#### 1. Redis Caching Layer

**Use Cases:**

- Cache frequently accessed boards
- Cache user permissions
- Cache board member lists

**Expected Impact:**

- 80-90% reduction in database queries for popular boards
- Sub-millisecond response times for cached data

**Implementation Approach:**

```javascript
// Cache pattern
const cacheKey = `board:${boardId}`;
let board = await redis.get(cacheKey);

if (!board) {
  board = await Board.findById(boardId);
  await redis.setex(cacheKey, 300, JSON.stringify(board)); // 5 min TTL
}

return JSON.parse(board);
```

#### 2. Database Query Optimization

**Pagination:**

```javascript
// Limit results for large lists
GET /api/boards/:boardId/cards?page=1&limit=50

const skip = (page - 1) * limit;
const cards = await Card.find({ listId })
  .skip(skip)
  .limit(limit)
  .lean();
```

**Aggregation Pipeline:**

```javascript
// Complex queries with MongoDB aggregation
const boardStats = await Board.aggregate([
  { $match: { "members._id": userId } },
  {
    $lookup: {
      from: "lists",
      localField: "_id",
      foreignField: "boardId",
      as: "lists",
    },
  },
  { $addFields: { listCount: { $size: "$lists" } } },
]);
```

#### 3. WebSocket Optimization

**Current Issue:** All clients in board room receive all updates

**Improvement:** Selective event broadcasting

```javascript
// Only emit to clients who need the update
io.to(`board:${boardId}`)
  .except(socket.id) // Don't send to originating client
  .emit("cardUpdated", card);
```

#### 4. API Response Compression

```javascript
// Add compression middleware
import compression from "compression";

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);
```

**Expected Impact:**

- 60-70% reduction in response size
- Faster load times on slow networks

---

## Design Trade-offs Summary

### Key Architectural Decisions

| Decision                           | Benefits                           | Drawbacks                           | Rationale                                       |
| ---------------------------------- | ---------------------------------- | ----------------------------------- | ----------------------------------------------- |
| **JWT Cookies vs localStorage**    | XSS protection, stateless auth     | CSRF risk, CORS complexity          | Security priority outweighs setup complexity    |
| **MongoDB vs PostgreSQL**          | Flexible schema, hierarchical data | Less data integrity                 | Document model fits Kanban structure naturally  |
| **Embedded Members vs Join Table** | Fast queries, atomic updates       | Less normalized, duplication        | Small teams (<50), optimize for read pattern    |
| **Fractional Indexing**            | O(1) position updates              | Complex algorithm, string positions | Better UX for drag-drop interactions            |
| **Mongoose ODM**                   | Schema validation, easier queries  | Slight overhead                     | Developer productivity > minor performance cost |
| **Docker Compose**                 | Easy local setup                   | Not production-ready                | Focus on development experience                 |
| **Cloudinary**                     | CDN, optimization, transformations | External dependency, cost           | Offload file handling from backend              |
| **Custom Migrations**              | Version control, rollback          | Manual management                   | Database evolution requires discipline          |
| **Middleware Pipeline**            | Composable, testable               | More abstractions                   | Clear separation of concerns                    |

### Why Not...?

**Q: Why not use GraphQL instead of REST?**

- ✅ **REST Chosen:** Simpler for team, easier debugging, predictable endpoints
- ❌ **GraphQL:** Adds complexity, requires more frontend boilerplate, overkill for this use case

**Q: Why not use TypeScript?**

- ✅ **JavaScript:** Team familiarity, faster development in bootcamp setting
- ❌ **TypeScript:** Learning curve, build step complexity, longer development time
- 💭 **Future:** Consider TypeScript for solo improvements

**Q: Why not use Passport.js for authentication?**

- ✅ **Custom JWT:** Full control, understand auth flow, simpler for this use case
- ❌ **Passport:** Abstraction hides learning, more dependencies
- 💭 **Consideration:** Passport would make sense for OAuth providers (Google, GitHub login)

**Q: Why not use Prisma instead of Mongoose?**

- ✅ **Mongoose:** Native MongoDB ODM, established ecosystem
- ❌ **Prisma:** Newer, less documentation for MongoDB, adds abstraction layer

**Q: Why not use Next.js API routes?**

- ✅ **Separate Backend:** Clear separation of concerns, easier to scale independently
- ❌ **Next.js API:** Tight coupling, harder to deploy separately

---

## Future Improvements

### Short-Term (Next 2-4 Weeks)

#### 1. API Rate Limiting

**Goal:** Prevent abuse and ensure fair usage

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later",
});

app.use("/api/", limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use("/api/auth/login", authLimiter);
```

#### 2. Input Validation with Express Validator

```javascript
import { body, validationResult } from "express-validator";

router.post(
  "/boards",
  authenticate,
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be 1-100 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  boardController.create
);
```

### Medium-Term (1-2 Months)

#### 3. Redis Caching Layer

**Architecture:**

```
Client Request
    ↓
Check Redis Cache
    ├─ HIT: Return cached data (fast!)
    └─ MISS: Query MongoDB → Cache result → Return
```

**Implementation:**

```javascript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// Cache middleware
export function cacheMiddleware(duration = 300) {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Store original res.json
    const originalJson = res.json;

    // Override res.json to cache response
    res.json = function (data) {
      redis.setex(key, duration, JSON.stringify(data));
      originalJson.call(this, data);
    };

    next();
  };
}

// Usage
router.get(
  "/boards/:boardId",
  authenticate,
  loadBoard,
  requireBoardMember,
  cacheMiddleware(300), // Cache for 5 minutes
  boardController.getById
);
```

**Cache Invalidation:**

```javascript
// Invalidate cache when board is updated
export async function update(req, res) {
  const board = await Board.findByIdAndUpdate(req.params.boardId, req.body);

  // Clear cache
  await redis.del(`cache:/api/boards/${board._id}`);

  res.json({ success: true, data: board });
}
```

#### 5. Email Notifications

**Use Cases:**

- New card assignment
- Card due date reminders
- Board invitation
- Comment mentions (@username)

**Service:** SendGrid or AWS SES

```javascript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendAssignmentNotification(user, card, board) {
  await sgMail.send({
    to: user.email,
    from: "notifications@kanbox.com",
    subject: `You've been assigned to: ${card.title}`,
    html: `
      <h2>New Card Assignment</h2>
      <p>You've been assigned to the card "${card.title}" on board "${board.title}".</p>
      <a href="${process.env.FRONTEND_URL}/board/${board._id}">View Board</a>
    `,
  });
}
```

#### 6. Advanced Search with Elasticsearch

**Features:**

- Full-text search across cards
- Filter by labels, members, dates
- Search within attachments (PDF, DOCX)
- Fuzzy matching for typos

### Long-Term (3+ Months)

#### 7. Card Templates & Automation

**Templates:**

```javascript
const bugTemplate = {
  title: "Bug: [Title]",
  labels: ["bug", "high-priority"],
  checklist: [
    "Reproduce bug",
    "Identify root cause",
    "Write fix",
    "Verify on local",
    "Deploy to staging",
  ],
};
```

**Automation Rules:**

```javascript
// When card moved to "Done" list, add completion comment
const automationRules = [
  {
    trigger: "card.moved",
    condition: { toList: "Done" },
    action: "addComment",
    params: { text: "Card completed! 🎉" },
  },
];
```

#### 8. Activity Timeline & Audit Log

```javascript
const activitySchema = new mongoose.Schema({
  boardId: ObjectId,
  userId: ObjectId,
  action: String, // 'card.created', 'card.moved', 'member.added'
  entityType: String, // 'card', 'list', 'board'
  entityId: ObjectId,
  changes: Object, // { field: 'title', from: 'Old', to: 'New' }
  timestamp: Date,
});

// Track all changes
boardSchema.post("save", async function () {
  await Activity.create({
    boardId: this._id,
    action: "board.updated",
    changes: this.getChanges(),
  });
});
```

#### 9. Mobile App with React Native

**Shared Code:**

- Redux store logic
- API service functions
- Business logic utilities

**Platform-Specific:**

- UI components (native vs. web)
- Navigation patterns
- Push notifications

#### 10. Internationalization (i18n)

```javascript
import i18n from "i18next";

i18n.init({
  lng: "en",
  resources: {
    en: {
      translation: {
        "board.create": "Create Board",
        "card.assignTo": "Assign to",
      },
    },
    es: {
      translation: {
        "board.create": "Crear Tablero",
        "card.assignTo": "Asignar a",
      },
    },
  },
});

// Usage
<button>{t("board.create")}</button>;
```

---

## Conclusion

This architecture documentation demonstrates not just what was built, but **why specific choices were made** and **what trade-offs were accepted**. The system is designed for:

1. **Security** - JWT cookies, bcrypt, HTTP-only flags
2. **Scalability** - Stateless auth, fractional indexing, planned caching
3. **Maintainability** - Middleware pipeline, migration framework, separation of concerns
4. **Performance** - Selective population, lean queries, CDN for static assets
5. **Developer Experience** - Clear structure, Docker setup, comprehensive docs

The permission system, migration framework, and API design patterns showcase understanding of production-ready backend development beyond tutorial-level projects. Future improvements demonstrate awareness of real-world application needs and growth planning.

**For more details on specific implementations, see:**

- [Development Guide](DEVELOPMENT.md) for setup instructions
- [Team Contributions](TEAM.md) for role breakdown
- [Main README](../README.md) for project overview
