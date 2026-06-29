# DateMatch AI - AI-Powered Dating Compatibility Platform

An intelligent dating platform that uses AI algorithms to match users based on compatibility, interests, and personality traits.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **AI Compatibility Matching**: Advanced algorithms for matching compatible partners
- **Real-time Messaging**: Instant communication between matched users
- **Profile Management**: Comprehensive user profiles with preferences
- **Smart Recommendations**: AI-powered suggestions based on user behavior

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL (relational data storage)
- **Caching**: Redis (real-time features and caching)
- **Language**: TypeScript (type-safe development)
- **Testing**: Jest (unit and integration tests)

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- Redis >= 6.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd datematch-ai
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database and Redis credentials
```

4. Set up the database:
```bash
# Create PostgreSQL database
createdb datematch_dev

# Run migrations (if applicable)
npm run db:migrate

# Seed initial data
npm run db:seed
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
NODE_ENV=production npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user profile

### Health Check

- `GET /health` - Service health status

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test -- --coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

Lint code:
```bash
npm run lint
```

Type check:
```bash
npm run type-check
```

## Project Structure

```
datematch-ai/
├── src/
│   ├── controllers/      # Request handlers
│   │   └── authController.js
│   ├── models/          # Data models
│   │   └── userModel.js
│   ├── services/        # Business logic
│   │   └── authService.js
│   └── index.js         # Express app entry point
├── config/              # Configuration files
│   └── databaseConfig.js
├── tests/               # Test files
│   └── authController.test.js
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript config
├── jest.config.js       # Jest config
└── README.md            # This file
```

## Security Considerations

- Passwords are hashed using bcrypt before storage
- JWT tokens are used for authentication
- Rate limiting prevents brute force attacks
- Input validation on all endpoints
- CORS configuration restricts origins

## License

MIT