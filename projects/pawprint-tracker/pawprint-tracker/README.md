# PawPrint Tracker 🐾

A comprehensive pet health management application built with Node.js, Express, and PostgreSQL. Track your pets' profiles, vaccinations, vet visits, medications, and maintain a detailed health journal.

## Features

### Core Modules

- **Pet Profiles** - Manage multiple pets with detailed information including breed, age, weight, and contact details for owners
- **Vaccination Records** - Track vaccination schedules, due dates, and administer reminders for upcoming shots
- **Vet Visits** - Schedule and record veterinary appointments with notes, diagnoses, and treatment plans
- **Medications** - Monitor prescription medications, dosages, administration schedules, and refill alerts
- **Health Journal** - Maintain a chronological log of health observations, symptoms, and wellness notes

### Key Capabilities

- Automated reminders for vaccinations and medication refills
- Health metrics tracking over time
- Search and filter across all records
- RESTful API for integration with mobile apps or third-party services
- Docker-ready deployment with PostgreSQL

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker & Docker Compose
- **Validation**: Zod schema validation
- **Testing**: Jest for unit and integration tests

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Docker (optional, for containerized development)

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd pawprint-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL (if not running locally)
docker-compose up -d postgres

# Run migrations and seed data
npm run db:migrate
npm run db:seed

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Docker Development

```bash
# Start all services (app + database)
docker-compose up -d

# Access the application
# API: http://localhost:3000
# Database: localhost:5432 (postgres)
```

## Project Structure

```
pawprint-tracker/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── pets.controller.ts
│   │   ├── vaccinations.controller.ts
│   │   ├── vet-visits.controller.ts
│   │   ├── medications.controller.ts
│   │   └── health-journal.controller.ts
│   ├── models/              # Data access layer
│   │   ├── pet.model.ts
│   │   ├── vaccination.model.ts
│   │   ├── vet-visit.model.ts
│   │   ├── medication.model.ts
│   │   └── health-journal.model.ts
│   ├── routes/              # API route definitions
│   │   ├── pets.routes.ts
│   │   ├── vaccinations.routes.ts
│   │   ├── vet-visits.routes.ts
│   │   ├── medications.routes.ts
│   │   └── health-journal.routes.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── services/            # Business logic
│   │   ├── reminder.service.ts
│   │   └── notification.service.ts
│   ├── utils/               # Utility functions
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── app.ts              # Express application setup
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── tests/                   # Test files
│   ├── unit/
│   │   ├── pet.test.ts
│   │   └── ...
│   └── integration/
├── docker-compose.yml       # Local development services
├── Dockerfile               # Production container
├── .env.example             # Environment template
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## API Endpoints

### Pets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pets` | List all pets |
| GET | `/api/v1/pets/:id` | Get pet by ID |
| POST | `/api/v1/pets` | Create new pet |
| PUT | `/api/v1/pets/:id` | Update pet |
| DELETE | `/api/v1/pets/:id` | Delete pet |

### Vaccinations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vaccinations` | List all vaccinations |
| GET | `/api/v1/vaccinations/:id` | Get vaccination by ID |
| POST | `/api/v1/vaccinations` | Create new vaccination |
| PUT | `/api/v1/vaccinations/:id` | Update vaccination |
| DELETE | `/api/v1/vaccinations/:id` | Delete vaccination |

### Vet Visits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vet-visits` | List all vet visits |
| GET | `/api/v1/vet-visits/:id` | Get visit by ID |
| POST | `/api/v1/vet-visits` | Create new visit |
| PUT | `/api/v1/vet-visits/:id` | Update visit |
| DELETE | `/api/v1/vet-visits/:id` | Delete visit |

### Medications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/medications` | List all medications |
| GET | `/api/v1/medications/:id` | Get medication by ID |
| POST | `/api/v1/medications` | Create new medication |
| PUT | `/api/v1/medications/:id` | Update medication |
| DELETE | `/api/v1/medications/:id` | Delete medication |

### Health Journal

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health-journal` | List all entries |
| GET | `/api/v1/health-journal/:id` | Get entry by ID |
| POST | `/api/v1/health-journal` | Create new entry |
| PUT | `/api/v1/health-journal/:id` | Update entry |
| DELETE | `/api/v1/health-journal/:id` | Delete entry |

## Development Guide

### Code Style & Conventions

This project follows strict TypeScript and API design conventions:

- **TypeScript**: Strict mode enabled, no `any` types
- **API Design**: RESTful endpoints with consistent error responses `{ error: { code, message } }`
- **Database**: Parameterized queries only, eager loading to prevent N+1 issues
- **Error Handling**: Never ignore errors, distinguish recoverable from non-recoverable
- **Security**: No secrets in code, validate all input at trust boundaries

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run linting
npm run lint

# Type checking
npm run type-check

# Build production bundle
npm run build
```

### Database Management

```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations to database
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Seed database with sample data
npm run db:seed
```

### Environment Variables

Required variables in `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/pawprint_tracker"
PORT=3000
NODE_ENV=development
```

## Deployment

### Production Docker Build

```bash
# Build production image
docker build -t pawprint-tracker:latest --target production .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  pawprint-tracker:latest
```

### Health Check

The application includes a health check endpoint at `/api/v1/health` that verifies database connectivity and service status.

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues or questions, please open an issue on the GitHub repository.
