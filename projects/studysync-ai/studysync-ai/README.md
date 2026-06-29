# StudySync AI

AI-powered study session scheduler and tracker.

## Features

- 📚 Subject management
- ⏰ Study session scheduling
- 🤖 AI-powered recommendations
- 📊 Progress tracking

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL
- **Testing**: Jest + Supertest

## Setup

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

### Development

```bash
# Start development server
npm run dev
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Lint check
npm run lint

# Type checking
npm run type-check
```

## API Endpoints

- `GET /` - Service information
- `GET /health` - Health check
- `POST /api/v1/subjects` - Create a new subject
- `POST /api/v1/study-sessions` - Schedule a study session

## License

MIT