# Plan: RenoTrack Pro

## Framework Decision
- **Language**: TypeScript
- **Runtime/Framework**: Node.js with Express
- **Package Manager**: npm
- **Database**: PostgreSQL (with Prisma ORM)
- **Rationale**: This stack fits the home renovation project management app perfectly. TypeScript provides type safety for complex data models (projects, budgets, materials). Node.js/Express offers rapid development for REST APIs with rich ecosystem. PostgreSQL handles relational data efficiently for tracking projects, expenses, and inventory. Prisma ORM simplifies database operations while maintaining type safety.

## Applicable .clinerules
- [.clinerules/instructions/api-design.instructions.md](.clinerules/instructions/api-design.instructions.md) - REST API design with standardized error responses
- [.clinerules/instructions/containers.instructions.md](.clinerules/instructions/containers.instructions.md) - Multi-stage Docker builds, non-root user, healthchecks
- [.clinerules/instructions/typescript.instructions.md](.clinerules/instructions/typescript.instructions.md) - Strict TypeScript mode conventions
- [.clinerules/instructions/sql.instructions.md](.clinerules/instructions/sql.instructions.md) - Database queries and migrations

## Phase 1: Project Setup (3 tasks)
- [x] Initialize project with npm, create package.json with dependencies (express, prisma, typescript, cors, helmet), configure tsconfig.json with strict mode, set up ESLint + Prettier
- [x] Create project structure (src/, src/controllers/, src/models/, src/services/, src/middleware/, tests/, config/) and initialize Prisma schema with core tables (projects, budget_items, materials, contractors, photos)
- [x] Create multi-stage Dockerfile (non-root user, healthcheck), docker-compose for local dev, and README.md with setup instructions

## Phase 2: Data & Backend (3 tasks)
- [x] Define Prisma schema models (Project, BudgetItem, Material, Contractor, Photo, User) with relationships and indexes, create migration files, implement database connection in config/prisma.ts
- [x] Implement REST API routes for projects CRUD (/api/v1/projects), budget tracking (/api/v1/budgets), material inventory (/api/v1/materials), contractor management (/api/v1/contractors) with input validation and standardized error responses
- [x] Add middleware stack (cors, helmet for security, request logging, rate limiting on auth endpoints), implement authentication with JWT tokens, add error handling middleware

## Phase 3: Features & Logic (4 tasks)
- [x] Implement service layer for budget calculations (estimate based on square footage, track variance alerts), material inventory management (low-stock notifications, supplier contacts), and project timeline tracking (phase milestones)
- [x] Build React.js web dashboard with Gantt chart component for project timeline visualization, budget tracker UI with variance charts, and material inventory list with low-stock indicators
- [x] Implement contractor coordination hub features (communication platform, photo uploads, change order approvals) and before/after photo documentation galleries organized by room and phase
- [x] Integrate all features end-to-end: project creation flow with budget estimation, material tracking with notifications, contractor assignments, and photo documentation workflow

## Phase 4: Polish & Test (3 tasks)
- [x] Write unit tests for business logic (budget calculations, inventory checks), integration tests for API endpoints using Jest + Supertest, achieve 80%+ code coverage
- [x] Add health check endpoint (/health), implement comprehensive logging with Winston, add error recovery mechanisms and resource cleanup on failures
- [x] Final cleanup (remove console.logs, fix lint warnings), security hardening (input sanitization, SQL injection prevention via Prisma), documentation updates, and production readiness checklist