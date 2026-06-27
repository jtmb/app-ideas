# First Dup — Implementation Plan

## Framework Decision
- **Frontend**: React (with Vite)
- **Backend**: Express.js
- **Database**: SQLite
- **Language**: TypeScript
- **Why**: This is a simple test/duplicate application with no specific feature requirements. The React + Express + SQLite stack provides rapid development speed for solo projects, excellent ecosystem maturity, and easy deployment. TypeScript ensures type safety throughout the codebase while maintaining developer productivity. SQLite is ideal for testing/demo apps as it's file-based and requires no separate database server setup.

## Applicable .clinerules/instructions/
- api-design.instructions.md — REST API design (status codes, error shapes, versioning)
- containers.instructions.md — Docker multi-stage, non-root, healthchecks
- typescript.instructions.md — TypeScript/Node.js conventions
- generic.instructions.md — Fallback if no framework-specific file exists

---

## Phase 1: Project Scaffolding
- [x] Initialize project with Vite + React + TypeScript
- [x] Configure ESLint + Prettier
- [x] Set up project directory structure (feature-based)
- [x] Create Express.js backend server
- [x] Create Dockerfile (multi-stage, non-root) + docker-compose for local dev
- [x] Create README.md with setup instructions

## Phase 2: Database & Data Layer
- [x] Design database schema (tables, relationships, indexes)
- [x] Write migration files
- [x] Create seed data for development
- [x] Implement data access layer (SQLite with better-sqlite3 or sql.js)

## Phase 3: Core Backend
- [x] Set up API framework (Express.js)
- [x] Implement health check endpoint (GET /health)
- [x] Design and implement REST API routes (follow api-design.instructions.md)
- [x] Input validation on all endpoints
- [x] Standardized error responses ({ error: { code, message } })
- [x] Request logging middleware

## Phase 4: Core Frontend
- [ ] Set up component tree and routing (React Router)
- [ ] Create API client with error handling
- [ ] Build responsive layout and design system
- [ ] Implement loading, empty, and error states for every view

## Phase 5: Feature Implementation
- [ ] Implement basic CRUD operations for test data
- [ ] Add data display views (list and detail)
- [ ] Add form inputs for creating/editing records
- [ ] Implement search/filter functionality
- [ ] Add pagination support

## Phase 6: Testing
- [ ] Write unit tests for core business logic (target: 80%+ coverage)
- [ ] Write integration tests for API endpoints
- [ ] Write E2E smoke tests for critical user flows
- [ ] Lint passes with zero warnings
- [ ] Type-check passes with zero errors
- [ ] Build succeeds with zero warnings

## Phase 7: Production Readiness
- [ ] Production Dockerfile (multi-stage, non-root user, healthcheck)
- [ ] Environment configuration with sensible defaults (12-factor)
- [ ] Health check endpoint verifies actual dependencies
- [ ] README with setup, run, test, and deploy instructions
- [ ] LICENSE file

## Test Command
`npm test`
