# Plan: StudySync AI

## Framework Decision
- **Language**: TypeScript
- **Runtime/Framework**: Node.js with Express
- **Package Manager**: npm
- **Database**: PostgreSQL
- **Rationale**: TypeScript provides type safety essential for a complex scheduling and tracking system. Node.js/Express offers rapid development speed for the MVP while maintaining scalability. PostgreSQL is ideal for relational data (users, subjects, study sessions) with robust querying capabilities. This stack aligns with .clinerules conventions and ensures maintainability.

## Applicable .clinerules
- [.clinerules/instructions/api-design.instructions.md](.clinerules/instructions/api-design.instructions.md) - REST API design patterns, status codes, error shapes
- [.clinerules/instructions/containers.instructions.md](.clinerules/instructions/containers.instructions.md) - Multi-stage Docker builds, non-root users, healthchecks
- [.clinerules/instructions/typescript.instructions.md](.clinerules/instructions/typescript.instructions.md) - TypeScript conventions and strict mode
- [.clinerules/instructions/shell.instructions.md](.clinerules/instructions/shell.instructions.md) - Shell script safety practices

## Test Command
`npm test`

---

## Phase 1: Project Setup (4 tasks)
- [x] Initialize project with package.json, TypeScript configuration, and core dependencies (express, pg, typescript, ts-node)
- [x] Create project directory structure (src/, src/config/, src/models/, src/routes/, src/middleware/, tests/)
- [x] Create multi-stage Dockerfile with non-root user and healthcheck
- [x] Create README.md with setup, run, test, and deploy instructions

---

## Phase 2: Data Layer - User Management (4 tasks)
- [x] Define TypeScript data model for User entity (id, email, passwordHash, name, createdAt, updatedAt)
- [x] Create PostgreSQL migration for users table with indexes on email
- [x] Define TypeScript data model for StudySession entity (id, userId, subjectId, startTime, endTime, durationMinutes, notes)
- [x] Create PostgreSQL migration for study_sessions table with foreign key to users

---

## Phase 3: Data Layer - Subjects & Goals (4 tasks)
- [x] Define TypeScript data model for Subject entity (id, name, difficultyLevel, category, estimatedStudyTimePerWeek)
- [x] Create PostgreSQL migration for subjects table with indexes on name and category
- [x] Define TypeScript data model for StudyGoal entity (id, userId, subjectId, targetHoursPerWeek, currentHours, deadline)
- [x] Create PostgreSQL migration for study_goals table with foreign keys to users and subjects

---

## Phase 4: API Routes - Users (3 tasks)
- [x] Implement POST /api/v1/users route with email validation and password hashing
- [x] Implement GET /api/v1/users/:id and PUT /api/v1/users/:id routes for user profile management
- [x] Implement DELETE /api/v1/users/:id route with soft delete pattern

---

## Phase 5: API Routes - Subjects (3 tasks)
- [x] Implement POST /api/v1/subjects route with difficulty level validation
- [x] Implement GET /api/v1/subjects and GET /api/v1/subjects/:id routes
- [x] Implement PUT /api/v1/subjects/:id and DELETE /api/v1/subjects/:id routes

---

## Phase 6: API Routes - Study Sessions (3 tasks)
- [x] Implement POST /api/v1/study-sessions route with subject assignment validation
- [x] Implement GET /api/v1/study-sessions and GET /api/v1/study-sessions/:id routes
- [x] Implement PUT /api/v1/study-sessions/:id and DELETE /api/v1/study-sessions/:id routes

---

## Phase 7: API Routes - Study Goals (3 tasks)
- [x] Implement POST /api/v1/study-goals route with target validation
- [x] Implement GET /api/v1/study-goals and GET /api/v1/study-goals/:id routes
- [x] Implement PUT /api/v1/study-goals/:id and DELETE /api/v1/study-goals/:id routes

---

## Phase 8: Business Logic - Spaced Repetition (2 tasks)
- [x] Implement calculateNextReview() service function using spaced repetition algorithm
- [x] Implement generateStudySchedule() service function that optimizes sessions based on energy levels and subject difficulty

---

## Phase 9: Middleware & Utilities (2 tasks)
- [x] Implement authentication middleware with JWT token validation
- [x] Create error handling middleware for standardized error responses per api-design.instructions.md

---

## Phase 10: Testing & Polish (3 tasks)
- [x] Write unit tests for User service (create, update, delete operations)
- [x] Write integration tests for study session CRUD endpoints
- [x] Add health check endpoint GET /health and final code cleanup