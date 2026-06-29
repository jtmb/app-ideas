# Plan: Test App

## Framework Decision
- **Language**: TypeScript
- **Runtime/Framework**: Express.js (Node.js)
- **Package Manager**: npm
- **Database**: SQLite (lightweight, no setup required for testing)
- **Rationale**: This is a simple test application with minimal features. TypeScript provides type safety for API contracts, Express is lightweight and perfect for a single-purpose app, and SQLite requires zero database setup—ideal for quick verification of the slop-api workflow.

## Applicable .clinerules
- [.clinerules/instructions/api-design.instructions.md](.clinerules/instructions/api-design.instructions.md) — REST API design (status codes, error shapes, versioning)
- [.clinerules/instructions/containers.instructions.md](.clinerules/instructions/containers.instructions.md) — Multi-stage Dockerfile, non-root user, healthcheck
- [.clinerules/instructions/typescript.instructions.md](.clinerules/instructions/typescript.instructions.md) — TypeScript conventions and strict mode
- [.clinerules/instructions/shell.instructions.md](.clinerules/instructions/shell.instructions.md) — Shell script safety

## Test Command
`npm test`

---

## Phase 1: Project Setup (4 tasks)
- [x] Initialize project with package.json, TypeScript config, and dependencies (express, sqlite3, cors, dotenv, ts-node-dev)
- [x] Create project directory structure (src/, src/routes/, src/controllers/, src/services/, src/middleware/, tests/)
- [x] Create Dockerfile (multi-stage build, non-root user, healthcheck endpoint)
- [x] Create README.md with setup, run, test, and deploy instructions

---

## Phase 2: Data Layer (3 tasks)
- [x] Define TypeScript interfaces for TestItem entity (id, name, description, createdAt, updatedAt)
- [x] Set up SQLite database connection in src/config/database.ts
- [x] Create migration file to initialize test_items table with proper schema and indexes

---

## Phase 3: API Routes (6 tasks — ONE endpoint per task)
- [x] Implement POST /api/v1/test-items route with request validation and error handling
- [x] Implement GET /api/v1/test-items route with pagination support
- [x] Implement GET /api/v1/test-items/:id route for single item retrieval
- [x] Implement PUT /api/v1/test-items/:id route for item updates with partial update support
- [x] Implement DELETE /api/v1/test-items/:id route for item deletion
- [x] Add middleware stack (cors, error handling, request logging)

---

## Phase 4: Business Logic (3 tasks)
- [x] Implement TestItemService class with create, findAll, findById, update, delete methods
- [x] Implement input validation utilities for test item data
- [x] Build React component for displaying test items list (if frontend needed)

---

## Phase 5: Testing & Polish (4 tasks)
- [x] Write unit tests for TestItemService create and update methods
- [x] Write integration test for POST /api/v1/test-items endpoint
- [x] Add GET /health health check endpoint with dependency verification
- [x] Final cleanup: environment configuration, .env.example file, lint and type-check pass
