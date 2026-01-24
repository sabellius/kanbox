# Team Contributions

> Detailed breakdown of individual contributions to the Kanbox project

This document clarifies the roles and contributions of each team member during the initial 2-month collaborative development period.

---

## Project Overview

**Project Name:** Kanbox - Collaborative Kanban Board Application
**Development Period:** [Month Year] - [Month Year] (2 months)
**Team Size:** 3 full-stack developers
**Development Approach:** Agile methodology with weekly sprints, no formal team lead
**Version Control:** Git with feature branch workflow
**Final Outcome:** Full-stack MERN application with drag-and-drop interfaces and granular permissions

---

## Team Structure

### Core Team (Initial 2-Month Development)

All three developers were full-stack developers who contributed across the stack. We had no formal team lead and made decisions collaboratively. Each developer had areas of focus based on interest and expertise:

| Developer            | Focus Orientation | Primary Contributions                                                                       |
| -------------------- | ----------------- | ------------------------------------------------------------------------------------------- |
| **Saveliy Shiryaev** | Backend-Oriented  | API architecture, authentication, permissions, migrations, Redux, Design System integration |
| **Vlad G**           | Frontend-Oriented | React components, routing, drag-and-drop implementation                                     |
| **Lior R**           | Frontend-Oriented | UI/UX design, styling, form components, Cloudinary integration                              |

---

## Individual Contributions

### Saveliy Shiryaev - Full-Stack Developer (Backend-Oriented)

**Overview:** I focused primarily on backend architecture and database design, while also contributing key frontend infrastructure including Redux state management and design system integration.

#### Backend Contributions

**1. Backend Architecture & API Design**

- Designed RESTful API structure with resource-based routing
- Implemented Express.js application with middleware pipeline architecture
- Created clear separation between routes, controllers, services, and models
- Established project structure and coding standards for backend

**Key Files:**

- `backend/src/app.js` - Express application configuration
- `backend/src/server.js` - Server entry point and MongoDB connection
- `backend/src/routes/*` - All API endpoint definitions
- `backend/src/controllers/*` - Request handlers for all resources

**2. Authentication System**

- Implemented JWT cookie-based authentication from scratch
- Chose HTTP-only cookies over localStorage for XSS protection
- Built signup, login, and logout endpoints with proper error handling
- Created password hashing system with bcrypt (10 salt rounds)

**Key Files:**

- `backend/src/middleware/authenticate.js` - JWT verification middleware
- `backend/src/controllers/auth-controller.js` - Auth request handlers
- `backend/src/routes/auth.js` - Authentication endpoints

**Technical Decisions:**

- **JWT Cookies vs. localStorage:** Selected HTTP-only cookies for security against XSS attacks
- **Token Expiration:** Set 7-day expiration with automatic refresh consideration
- **CORS Configuration:** Enabled credentials for cross-origin cookie sharing

**3. Permission System Framework**

- Designed granular permission system for boards and cards
- Created reusable permission service with pure functions for testability
- Implemented middleware-based authorization checks
- Established permission hierarchy (Board Admin → Board Member)

**Key Files:**

- `backend/src/services/permissions/*` - All permission logic
- `backend/src/middleware/authorize.js` - Authorization middleware
- `backend/src/middleware/load-board.js` - Pre-fetch board for permission checks

**Architecture Pattern:**

```javascript
Route → authenticate → loadBoard → requirePermission → controller
```

**4. Database Schema Design**

- Designed MongoDB schema for hierarchical board/list/card structure
- Made strategic decisions on embedded vs. referenced documents
- Created Mongoose models with validation and indexes
- Implemented fractional indexing for efficient card positioning

**Key Files:**

- `backend/src/models/User.js` - User schema with password hashing
- `backend/src/models/Board.js` - Board with embedded members and style
- `backend/src/models/List.js` - List with position tracking
- `backend/src/models/Card.js` - Card with labels, comments, attachments

**Key Decisions:**

- **Embedded Members:** Chose embedded arrays over join tables for performance with small teams
- **Fractional Indexing:** Selected fractional-indexing library for O(1) drag-and-drop performance
- **Document References:** Used ObjectId references for parent-child relationships

**5. Migration Framework**

- Built custom database migration system using Umzug
- Created CLI tool for running, rolling back, and creating migrations
- Established version control for database schema changes
- Wrote all migration scripts for feature additions

**Key Files:**

- `backend/src/db/migrate.js` - Migration CLI tool
- `backend/src/db/umzug.js` - Umzug configuration
- `backend/src/db/migrations/*` - All migration files
- `backend/src/db/clean-db.js` - Database cleanup utility

**Commands Created:**

```bash
npm run migrate:up       # Apply pending migrations
npm run migrate:down     # Rollback last migration
npm run migrate:create   # Create new migration
npm run db:clean         # Clean database utility
```

**6. Docker Development Environment**

- Set up Docker Compose for local MongoDB container
- Created backend Dockerfile for containerized deployment
- Configured environment variables for Docker networking
- Wrote documentation for Docker setup

**Key Files:**

- `backend/docker-compose.yml`
- `backend/Dockerfile`
- `backend/.env.example` (comprehensive comments)

**7. Code Quality & Documentation**

- Set up ESLint and Prettier for code consistency
- Wrote comprehensive backend documentation
- Created API endpoint documentation
- Established error handling patterns

#### Frontend Contributions

**1. Redux State Management Infrastructure**

- Designed and implemented the complete Redux store architecture
- Created actions and reducers for boards, lists, and cards
- Established state management patterns for the team to follow
- Built async action creators for API integration

**Key Files:**

- `frontend/src/store/store.js` - Redux store configuration
- `frontend/src/store/actions/*` - Action creators
- `frontend/src/store/reducers/*` - State reducers

**Rationale:** Chose Redux over Context API for:

- Predictable state updates across complex component tree
- Time-travel debugging capabilities
- Centralized state management for multiple boards
- Better performance with memoized selectors

**2. Atlassian Design System Integration**

- Integrated Atlassian Design System tokens with Material-UI
- Mapped design system tokens to Material-UI theme structure
- Created consistent spacing, typography, and color schemes
- Enabled team to leverage battle-tested design patterns

**Technical Approach:**

- Used Atlassian design tokens as single source of truth
- Customized Material-UI theme to match token specifications
- Ensured consistent visual language across application
- Reduced need to reinvent common UI patterns

**Why Design System Integration Matters:**

- Faster development with pre-built patterns
- Consistent user experience
- Accessibility built-in
- Easier maintenance and updates

#### Technologies Used

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Umzug, Docker
- **Frontend:** Redux (legacy), Material-UI, Atlassian Design System
- **DevOps:** Docker, Docker Compose
- **Code Quality:** ESLint, Prettier

#### Lines of Code Contribution

- Approximately **4,500 lines** of backend code
- **1,000 lines** of frontend state management and configuration
- 15+ API endpoints across 6 resources
- 5+ middleware functions
- 10+ database migrations
- Comprehensive error handling throughout

#### Time Allocation

- **Week 1-2:** Project setup, authentication, user models, Redux infrastructure
- **Week 3-4:** Board/list/card CRUD operations, permission system
- **Week 5-6:** Migration framework, design system integration, refinement
- **Week 7-8:** Testing, bug fixes, documentation

---

### Vlad G - Full-Stack Developer (Frontend-Oriented)

**Overview:** Focused on React component architecture and UI functionality.

#### Core Contributions

**1. React Component Architecture**

- Built core Board, List, and Card components
- Implemented React Router for client-side routing
- Created protected route components for authentication
- Designed component hierarchy and folder structure

**2. Drag-and-Drop Implementation**

- Integrated Hello Pangea DnD for drag-and-drop functionality
- Implemented card and list reordering with position updates
- Created smooth drag animations and visual feedback
- Handled complex state updates during drag operations

**Key Files:**

- `frontend/src/pages/BoardDetails.jsx`
- `frontend/src/components/List.jsx`
- `frontend/src/components/Card.jsx`
- `frontend/src/components/CardModal.jsx`

**3. API Integration**

- Built service layer for backend API calls
- Integrated API calls with Redux actions
- Implemented error handling for failed requests
- Created loading states and user feedback

**4. Routing & Navigation**

- Set up React Router configuration
- Implemented protected routes requiring authentication
- Created navigation components and breadcrumbs
- Handled URL parameter parsing for boards and cards

#### Technologies Used

- React 19, React Hooks
- Hello Pangea DnD for drag-and-drop
- React Router for navigation
- Axios for HTTP requests

---

### Lior R - Full-Stack Developer (Frontend-Oriented)

**Overview:** Focused on user interface design, styling, and user experience.

#### Core Contributions

**1. UI/UX Design**

- Designed overall application user interface
- Created color schemes and board themes
- Designed responsive layouts for mobile and desktop
- Ensured accessibility standards

**2. CSS Architecture**

- Structured CSS with modular approach
- Created base styles and CSS variables
- Built component-specific stylesheets
- Implemented responsive breakpoints

**Key Files:**

- `frontend/src/assets/styles/*`
- `frontend/src/assets/styles/components/*`
- `frontend/src/assets/styles/pages/*`

**3. Form Components**

- Built form components with React Hook Form
- Implemented form validation with Yup
- Created input components (text, select, checkbox)
- Designed error message displays

**4. Material-UI Customization**

- Customized Material-UI theme
- Styled MUI components for consistent look
- Created custom theme variations
- Integrated component overrides

**5. Cloudinary Integration**

- Integrated Cloudinary for file uploads
- Built image upload components
- Implemented image preview and management
- Created attachment UI for cards

**Key Files:**

- `frontend/src/components/ImageUploader.jsx`
- `frontend/src/services/upload-service.js`
- Card attachment UI components

**6. Rich Text Editor Integration**

- Integrated TipTap editor for card descriptions
- Customized editor toolbar
- Styled editor content area
- Implemented markdown support

#### Technologies Used

- CSS3 with CSS Modules
- Material-UI (MUI)
- React Hook Form + Yup
- TipTap editor
- Cloudinary SDK

---

## Collaborative Work

### Joint Responsibilities

**API Contract Design**

- Collaborated on endpoint structure and response formats
- Agreed on error handling patterns
- Defined data models and validation rules
- Coordinated frontend-backend integration

**Feature Planning**

- Weekly sprint planning sessions
- Task prioritization and estimation
- Feature requirements discussions
- Backlog grooming

**Code Reviews**

- Reviewed each other's pull requests
- Provided feedback on code quality and architecture
- Caught bugs before merge
- Shared knowledge across stack

**Integration & Testing**

- Coordinated frontend-backend integration
- Tested API endpoints with frontend components
- Debugged CORS and authentication issues
- Manual testing of user flows

---

## Development Workflow

### Tools & Processes

- **Version Control:** Git + GitHub with feature branches
- **Code Editor:** VS Code with extensions
- **API Testing:** Postman for endpoint testing
- **Database:** MongoDB Compass for database inspection
- **Communication:** Slack/Discord for daily communication
- **Project Management:** Trello/Jira for task tracking

### Workflow Pattern

1. Sprint planning meeting (weekly)
2. Feature branch creation from main
3. Development and local testing
4. Pull request creation with description
5. Code review by team member(s)
6. Merge to main after approval
7. Integration testing
8. Demo at end of sprint

---

## Learning Outcomes

### What We Learned as a Team

**Technical Skills:**

- Full-stack development with MERN stack
- RESTful API design and implementation
- Authentication and authorization patterns
- Database design and optimization
- State management with Redux
- Docker containerization
- Git collaboration workflows

**Soft Skills:**

- Code review best practices
- Technical communication across stack
- Task estimation and planning
- Conflict resolution (merge conflicts!)
- Documentation importance
- Team coordination without formal lead

**Challenges Overcome:**

- CORS configuration between frontend and backend
- Database migration coordination across team
- Consistent coding standards without strict enforcement
- Balancing feature development with technical debt
- Time management with overlapping responsibilities

---

## Post-Collaboration Development

After the initial 2-month collaborative period, the project continues as individual forks with ongoing enhancements.

**Saveliy Shiryaev's Fork - Ongoing Work:**

- [ ] Enhanced documentation (this comprehensive set)
- [ ] Additional migration management tools
- [ ] Improved error handling and logging
- [ ] Performance optimizations

**Planned Future Enhancements:**

- [ ] Real-time collaboration via WebSockets
- [ ] Unit and integration test coverage
- [ ] Workspace hierarchy for multi-board organization
- [ ] Email notification system
- [ ] Card template functionality

---

## Contact Information

### Team Members

**Saveliy Shiryaev** - Full-Stack Developer (Backend-Oriented)

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com
- Portfolio: [your-portfolio.com](https://your-portfolio.com)

**Vlad G** - Full-Stack Developer (Frontend-Oriented)

- GitHub: [@teammember1](https://github.com/teammember1)
- LinkedIn: [Profile](https://linkedin.com/in/teammember1)

**Lior R** - Full-Stack Developer (Frontend-Oriented)

- GitHub: [@teammember2](https://github.com/teammember2)
- LinkedIn: [Profile](https://linkedin.com/in/teammember2)

---

## Repository Links

- **Original Team Repository:** [github.com/original-team/kanbox](https://github.com/original-team/kanbox)
- **Your Fork:** [github.com/yourusername/kanbox](https://github.com/yourusername/kanbox)

---

## Additional Documentation

- [Main README](../README.md) - Project overview and quick start
- [Architecture Documentation](ARCHITECTURE.md) - Technical deep-dive
- [Development Guide](DEVELOPMENT.md) - Setup and workflow instructions
- [Deployment Guide](DEPLOYMENT.md) - Production deployment guide

---

**This project demonstrates not just individual coding skills, but also the ability to collaborate effectively in a team environment, communicate technical decisions clearly, and deliver a production-quality application.**
