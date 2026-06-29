# Plan: EcoHome Monitor

## Framework Decision
- **Language**: TypeScript
- **Runtime/Framework**: Node.js with Express (backend), React.js (web dashboard)
- **Package Manager**: npm
- **Database**: PostgreSQL (relational data), InfluxDB (time-series energy data)
- **Rationale**: TypeScript provides type safety for complex IoT device integrations and predictive analytics. Express offers rapid API development for real-time energy monitoring endpoints. React.js enables responsive dashboards with Chart.js visualizations. PostgreSQL handles structured user/device data while InfluxDB efficiently stores high-frequency time-series energy consumption metrics.

## Applicable .clinerules
- [.clinerules/instructions/api-design.instructions.md](.clinerules/instructions/api-design.instructions.md)
- [.clinerules/instructions/containers.instructions.md](.clinerules/instructions/containers.instructions.md)
- [.clinerules/instructions/typescript.instructions.md](.clinerules/instructions/typescript.instructions.md)

## Test Command
`npm test`

## Phase 1: Project Setup (4 tasks)
- [x] Initialize project with package.json, TypeScript configuration, and core dependencies (express, pg, influxdb-client, react, chart.js)
- [x] Create project directory structure (src/config/, src/models/, src/routes/, src/controllers/, src/services/, tests/)
- [x] Create multi-stage Dockerfile with non-root user, healthcheck, and environment variable support
- [x] Create README.md with setup instructions, feature overview, and development guide

## Phase 2: Data Layer - User Management (4 tasks)
- [x] Define User data model with fields (id, email, passwordHash, name, createdAt, updatedAt)
- [x] Create PostgreSQL migration for users table with indexes on email
- [x] Define Device data model with fields (id, userId, deviceName, deviceType, ipAddress, status, lastSeenAt)
- [x] Create PostgreSQL migration for devices table with foreign key to users and indexes

## Phase 3: Data Layer - Energy Metrics (4 tasks)
- [x] Define EnergyReading data model with fields (id, deviceId, timestamp, electricityKwh, waterGallons, gasCcf, carbonEmissionsKg)
- [x] Create InfluxDB bucket configuration for time-series energy readings
- [x] Define CarbonFootprint data model with fields (id, userId, periodStart, periodEnd, totalEmissionsKg, nationalAverageKg, reductionPercent)
- [x] Create PostgreSQL migration for carbon_footprints table with composite index on userId and period

## Phase 4: Data Layer - Automation Rules (3 tasks)
- [x] Define AutomationRule data model with fields (id, userId, name, triggerType, conditions, actions, isActive, createdAt)
- [x] Create PostgreSQL migration for automation_rules table with indexes on userId and isActive
- [x] Define RuleCondition and RuleAction sub-models for flexible automation configuration

## Phase 5: API Routes - Authentication (2 tasks)
- [x] Implement POST /api/v1/auth/register route with email validation and password hashing
- [x] Implement POST /api/v1/auth/login route with JWT token generation and rate limiting

## Phase 6: API Routes - Users & Devices (4 tasks)
- [x] Implement GET /api/v1/users/:id and PUT /api/v1/users/:id routes for user profile management
- [x] Implement POST /api/v1/devices route with device type validation and user authorization
- [x] Implement GET /api/v1/devices and GET /api/v1/devices/:id routes for device listing and details
- [x] Implement PUT /api/v1/devices/:id and DELETE /api/v1/devices/:id routes for device updates

## Phase 7: API Routes - Energy Data (3 tasks)
- [x] Implement POST /api/v1/energy/readings route with timestamp validation and InfluxDB write
- [x] Implement GET /api/v1/energy/readings?deviceId=:id&start=:date&end=:date for time-range queries
- [x] Implement GET /api/v1/energy/summary/:userId/:period for aggregated consumption statistics

## Phase 8: API Routes - Carbon & Analytics (2 tasks)
- [x] Implement POST /api/v1/carbon/footprint route with calculation logic and national average comparison
- [x] Implement GET /api/v1/analytics/predictions/:userId for ML-based cost forecasting

## Phase 9: API Routes - Automation (3 tasks)
- [x] Implement POST /api/v1/automation/rules route with condition/action validation
- [x] Implement GET /api/v1/automation/rules and PUT /api/v1/automation/rules/:id routes
- [x] Implement DELETE /api/v1/automation/rules/:id route for rule removal

## Phase 10: Business Logic Services (3 tasks)
- [x] Implement EnergyOptimizationService with usage pattern analysis and recommendations
- [x] Implement CarbonCalculationService with emission factors and footprint tracking
- [x] Implement AutomationExecutionService with trigger evaluation and action dispatch

## Phase 11: Testing & Polish (4 tasks)
- [x] Write unit tests for authentication service (register, login, JWT validation)
- [x] Write integration tests for energy readings API endpoints
- [x] Add GET /api/v1/health endpoint with dependency health checks
- [x] Final cleanup: add error handling middleware, request logging, and CORS configuration
