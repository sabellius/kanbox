# Kanbox - Collaborative Project Management Board

> A full-featured Kanban board application built with the MERN stack, featuring drag-and-drop interfaces and granular permission controls.

<!-- TODO: Add badges once deployed -->
<!-- [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)]() -->

[🚀 Live Demo](#) | [📖 Architecture Docs](docs/ARCHITECTURE.md) | [👥 Team Contributions](docs/TEAM.md)

---

## 📋 Overview

Kanbox is a collaborative Kanban board application inspired by Trello, designed to help teams organize projects with an intuitive drag-and-drop interface. This project was developed as a 3-person team effort over 2 months as part of a full-stack development bootcamp.

**My Role:** Full-Stack Developer (Backend-Oriented) - I focused primarily on backend architecture including the RESTful API, JWT cookie authentication, granular permission framework, and custom database migration pipeline. On the frontend, I built the Redux state management infrastructure and integrated the Atlassian Design System tokens to leverage an existing, battle-tested design system.

The application supports hierarchical board and list structures, rich card editing with labels and comments, and a flexible permission system that scales from personal projects to team collaboration.

---

## ✨ Key Features

- **📊 Board & List Management** - Organize projects with multiple boards containing customizable lists
- **🎯 Drag-and-Drop Interface** - Intuitive card and list reordering with fractional indexing (O(1) performance)
- **🔐 Secure Authentication** - JWT cookie-based auth protecting against XSS attacks
- **👥 Role-Based Permissions** - Granular access control at board and card levels
- **🏷️ Labels & Organization** - Categorize cards with customizable color-coded labels
- **📝 Card Comments** - Collaborate with threaded comments on cards
- **📎 File Attachments** - Upload images and files to cards via Cloudinary integration
- **🎨 Custom Board Themes** - Personalize boards with various background options

---

## 🛠 Tech Stack

### Backend (My Primary Focus)

- **Runtime:** Node.js 18+ with ESM syntax
- **Framework:** Express.js for RESTful API architecture
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens in HTTP-only cookies
- **Migrations:** Custom Umzug-based migration framework
- **DevOps:** Docker Compose for local MongoDB

> 💡 **Why these choices?** See detailed technology rationale and trade-off analysis in [Architecture Documentation →](docs/ARCHITECTURE.md)

### Frontend (Team Effort + My Contributions)

- **Library:** React 19 with hooks and functional components
- **State Management:** Redux (my implementation)
- **UI Framework:** Material-UI with Atlassian Design System tokens (my integration)
- **Forms:** React Hook Form with Yup validation
- **Drag-and-Drop:** Hello Pangea DnD (react-beautiful-dnd fork)
- **Rich Text:** TipTap editor for card descriptions
- **File Storage:** Cloudinary for image uploads and CDN delivery
- **Build Tool:** Vite for fast development and optimized builds

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/kanbox.git
cd kanbox

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (JWT_SECRET, MongoDB, Cloudinary)

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Add your VITE_CLOUDINARY_CLOUD_NAME

# Start MongoDB
cd ../backend
docker compose up -d mongodb

# Run migrations
npm run migrate:up

# Start servers (separate terminals)
cd backend && npm run dev    # http://localhost:3000
cd frontend && npm run dev   # http://localhost:5173
```

📖 **Complete setup guide:** [Development Documentation →](docs/DEVELOPMENT.md)

---

## 🎯 Project Highlights

### 1. JWT Cookie Authentication

Implemented secure authentication using HTTP-only cookies instead of localStorage, protecting against XSS attacks. The system includes automatic CORS handling, secure cookie configuration (SameSite=strict), and proper password hashing with bcrypt.

### 2. Granular Permission System

Designed a flexible, middleware-based permission framework with fine-grained access control (board admin vs. member). The system uses composable permission functions and middleware for clean, testable authorization logic that separates concerns.

### 3. Custom Migration Framework

Built a version-controlled database migration system using Umzug, enabling repeatable deployments, team synchronization, and safe schema evolution with rollback capability. Includes CLI tools for managing migration lifecycle.

### 4. Fractional Indexing for Performance

Integrated fractional-indexing algorithm for card positioning, reducing drag-and-drop complexity from O(n) to O(1) by eliminating the need to re-index all cards when reordering. Enables instant UI updates even with hundreds of cards.

### 5. Redux State Management Architecture

Designed and implemented the complete Redux store architecture with actions and reducers for managing boards, lists, cards, and UI state. Created reusable action creators and normalized state shape for efficient updates.

### 6. Design System Integration

Integrated Atlassian Design System tokens with Material-UI to leverage an existing, battle-tested design system instead of building from scratch. Ensures consistent spacing, typography, and color schemes across the application.

---

## 📚 What I Learned

**Backend Architecture:** RESTful API design patterns, middleware pipelines, stateless JWT authentication, MongoDB schema design (embedded vs. referenced documents), database migration strategies for team collaboration.

**Frontend State Management:** Redux architecture patterns, action creators and reducers, design system integration, managing complex application state.

**Security:** HTTP-only cookie security vs. localStorage vulnerabilities, CSRF protection with SameSite, bcrypt password hashing, input validation and sanitization.

**DevOps:** Docker Compose for local development, environment configuration management, database versioning with migrations.

**Collaboration:** Git workflows, API contract design between frontend and backend, code review practices, technical documentation for team knowledge sharing.

---

## 👥 Team Contributions

This project was developed collaboratively by 3 full-stack developers with no formal team lead, working together through pair programming and code reviews:

- **[Your Name]** - Backend-oriented (API, auth, permissions, migrations) + Frontend (Redux, Design System integration)
- **[Team Member 1]** - Frontend-oriented (React components, routing, drag-and-drop implementation)
- **[Team Member 2]** - Frontend-oriented (UI/UX design, styling, form components, Cloudinary integration)

📖 **Detailed contribution breakdown:** [Team Documentation →](docs/TEAM.md)

---

## 📖 Documentation

- **[Architecture Decisions](docs/ARCHITECTURE.md)** - Technical deep-dive, technology rationale, and trade-off analysis
- **[Development Guide](docs/DEVELOPMENT.md)** - Complete setup instructions, project structure, and workflows
- **[Team Contributions](docs/TEAM.md)** - Individual contributions and collaboration approach
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions (for when ready to deploy)

---

## 🚧 Roadmap

### Completed ✅

- [x] Core Kanban functionality (boards, lists, cards)
- [x] JWT authentication with secure cookies
- [x] Role-based permission system
- [x] Drag-and-drop with fractional indexing
- [x] Database migration framework
- [x] Redux state management
- [x] Atlassian Design System integration
- [x] File upload system (Cloudinary)

### Planned 🎯

- [ ] Real-time collaboration via WebSockets
- [ ] Unit and integration testing
- [ ] Workspace hierarchy for multi-board organization
- [ ] Email notifications for card assignments
- [ ] Card templates and automation rules
- [ ] Performance monitoring and analytics

---

## 🔧 Available Scripts

### Backend

```bash
npm run dev         # Start development server with nodemon
npm run migrate:up  # Apply pending migrations
npm run db:clean    # Clean database (preserve users)
npm run lint        # Run ESLint
```

### Frontend

```bash
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run lint        # Run ESLint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

## 📬 Contact

**[Your Name]**

- Portfolio: [your-portfolio.com](#)
- LinkedIn: [linkedin.com/in/yourprofile](#)
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

<p align="center">Built with ❤️ using the MERN stack</p>
