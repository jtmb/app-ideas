# First Dup

A simple test application built with React, Express.js, and SQLite to demonstrate CRUD operations.

## Features

- **React Frontend**: Modern UI with TypeScript
- **Express Backend**: RESTful API with validation
- **SQLite Database**: File-based database for easy deployment
- **CRUD Operations**: Full create, read, update, delete functionality

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: SQLite (via sql.js)
- **Validation**: Zod
- **Security**: Helmet for HTTP headers

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the frontend (port 5173) and backend (port 3001).

### API Endpoints

- `GET /api/v1/records` - List all records
- `GET /api/v1/records/:id` - Get a single record
- `POST /api/v1/records` - Create a new record
- `PUT /api/v1/records/:id` - Update a record
- `DELETE /api/v1/records/:id` - Delete a record

### Health Check

```bash
curl http://localhost:3001/health
```

## Project Structure

```
src/
├── components/      # React components
│   ├── Layout.tsx
│   ├── LoadingSpinner.tsx
│   ├── RecordForm.tsx
│   ├── RecordItem.tsx
│   └── RecordList.tsx
├── hooks/           # Custom React hooks
│   └── useRecords.ts
├── pages/           # Page components
│   └── Home.tsx
├── server/          # Backend server
│   ├── index.ts     # Express app entry point
│   ├── db.ts        # Database initialization
│   └── routes/
│       └── records.ts
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check with TypeScript

## License

ISC
