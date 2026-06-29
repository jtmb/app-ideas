# Creative Studio Sync

A real-time collaborative platform for creative teams to work together on projects.

## Features

- **Real-time Collaboration**: Multiple team members can edit and view projects simultaneously
- **Project Management**: Organize work into structured projects with tasks and milestones
- **Media Storage**: Secure file storage using AWS S3 for project assets
- **Caching Layer**: Redis-powered caching for fast data access and real-time updates
- **RESTful API**: Well-documented API following REST best practices

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL (relational data storage)
- **Cache**: Redis (caching and real-time features)
- **Storage**: AWS S3 (media file storage)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- AWS CLI configured (for S3 access)

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd creativestudio-sync
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_URL`: Redis connection string
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`: S3 credentials
   - `PORT`: Application port (default: 3000)

4. Start all services:
```bash
docker-compose up -d
```

5. Wait for services to initialize, then access the application at http://localhost:3000

## Development

### Available Scripts

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Application port | 3000 |
| DATABASE_URL | PostgreSQL connection string | - |
| REDIS_URL | Redis connection string | - |
| AWS_ACCESS_KEY_ID | AWS access key | - |
| AWS_SECRET_ACCESS_KEY | AWS secret key | - |
| AWS_REGION | AWS region | us-east-1 |
| NODE_ENV | Environment mode | development |

## API Documentation

The REST API follows these conventions:

- **Base URL**: `/api/v1`
- **Authentication**: Bearer token in `Authorization` header
- **Error Format**: `{ "error": { "code": "ERROR_CODE", "message": "description" } }`
- **Success Responses**: Status codes 200, 201 (with Location header), 204

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/auth/login` | User authentication |
| GET | `/api/v1/projects` | List all projects |
| POST | `/api/v1/projects` | Create new project |
| GET | `/api/v1/projects/:id` | Get project details |
| PUT | `/api/v1/projects/:id` | Update project |
| DELETE | `/api/v1/projects/:id` | Delete project |

## Testing

Run the test suite:
```bash
npm test
```

Tests include:
- Unit tests for business logic
- Integration tests for API endpoints
- E2E smoke tests for critical flows

## License

MIT