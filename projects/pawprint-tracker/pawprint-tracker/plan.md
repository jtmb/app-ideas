# Plan: PawPrint Tracker

## Framework Decision
- **Language**: TypeScript
- **Runtime/Framework**: Node.js with Express
- **Package Manager**: npm
- **Database**: PostgreSQL for structured data (pet profiles, vaccination records, vet visits, medications, health journal entries)
- **Rationale**: TypeScript provides type safety critical for managing complex pet health data relationships. Node.js/Express offers rapid development speed for a solo developer while maintaining strong ecosystem support. PostgreSQL is ideal for relational data like pets → vaccinations → appointments hierarchies. This stack aligns with .clinerules conventions and ensures maintainability for a production-ready app.

## Applicable .clinerules
- [.clinerules/instructions/api-design.instructions.md](.clinerules/instructions/api-design.instructions.md) — REST API design, status codes, error shapes
- [.clinerules/instructions/containers.instructions.md](.clinerules/instructions/containers.instructions.md) — Multi-stage Dockerfile, non-root user, healthchecks
- [.clinerules/instructions/typescript.instructions.md](.clinerules/instructions/typescript.instructions.md) — TypeScript conventions, strict mode
- [.clinerules/instructions/sql.instructions.md](.clinerules/instructions/sql.instructions.md) — Database queries, migrations, indexing

## Test Command
`npm test`

---

## Phase 1: Project Setup (4 tasks)
- [x] Initialize project with package.json, TypeScript configuration (tsconfig.json), and ESLint/Prettier setup
- [x] Create project directory structure (src/, src/config/, src/controllers/, src/models/, src/routes/, src/middleware/, tests/)
- [x] Create multi-stage Dockerfile with non-root user, healthcheck, and layer optimization
- [x] Create README.md with setup instructions, feature overview, and development guide

---

## Phase 2: Data Layer (6 tasks)
- [x] Define TypeScript interfaces for Pet entity (id, name, species, breed, age, owner_id, created_at, updated_at)
- [x] Create PostgreSQL migration for pets table with appropriate indexes
- [x] Define TypeScript interfaces for VaccinationRecord entity (id, pet_id, vaccine_name, date_administered, next_due_date, status, notes, created_at)
- [x] Create PostgreSQL migration for vaccination_records table with foreign key to pets
- [x] Define TypeScript interfaces for VetVisit entity (id, pet_id, visit_date, clinic_name, diagnosis, treatment_notes, cost, created_at)
- [x] Create PostgreSQL migration for vet_visits table with foreign key to pets

---

## Phase 3: API Routes - Pets Resource (4 tasks)
- [x] Implement POST /api/v1/pets route with validation for creating new pet profile
- [x] Implement GET /api/v1/pets route with pagination and optional owner_id filter
- [x] Implement GET /api/v1/pets/:id route for retrieving single pet details
- [x] Implement PUT /api/v1/pets/:id and DELETE /api/v1/pets/:id routes for updating/deleting pets

---

## Phase 4: API Routes - Vaccination Records (4 tasks)
- [x] Implement POST /api/v1/vaccinations route with validation for recording vaccination
- [x] Implement GET /api/v1/vaccinations route with pagination and optional pet_id filter
- [x] Implement GET /api/v1/vaccinations/:id route for retrieving single vaccination record
- [x] Implement PUT /api/v1/vaccinations/:id and DELETE /api/v1/vaccinations/:id routes

---

## Phase 5: API Routes - Vet Visits (3 tasks)
- [x] Implement POST /api/v1/visits route with validation for recording vet visit
- [x] Implement GET /api/v1/visits route with pagination and optional pet_id filter
- [x] Implement GET /api/v1/visits/:id route for retrieving single vet visit details

---

## Phase 6: Business Logic & Utilities (3 tasks)
- [x] Implement reminder service to calculate next vaccination due dates and generate alerts
- [x] Implement appointment booking utility with date validation and conflict detection
- [x] Create health journal entity interface and migration for tracking symptoms/observations

---

## Phase 7: Testing & Polish (2 tasks)
- [x] Write unit tests for pet CRUD operations and reminder calculation logic
- [x] Add GET /api/v1/health endpoint, final cleanup, and environment configuration