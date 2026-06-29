import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  // Application settings
  app: {
    name: process.env.APP_NAME || 'EcoHome Monitor',
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },

  // PostgreSQL configuration
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'ecohome_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    maxPoolSize: parseInt(process.env.POSTGRES_MAX_POOL_SIZE || '10', 10),
    minPoolSize: parseInt(process.env.POSTGRES_MIN_POOL_SIZE || '2', 10),
  },

  // InfluxDB configuration for time-series energy data
  influxdb: {
    url: process.env.INFLUXDB_URL || 'http://localhost:8086',
    token: process.env.INFLUXDB_TOKEN || '',
    organization: process.env.INFLUXDB_ORG || 'ecohome',
    bucket: process.env.INFLUXDB_BUCKET || 'energy_data',
  },

  // JWT configuration for authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};

export default config;