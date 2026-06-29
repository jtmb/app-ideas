import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import visitsRouter from './routes/visits.js';
import { authenticate } from './middleware/auth.js';
import { pool } from './database.js';
import VisitService from './services/visitService.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/v1', limiter);

// Body parsing
app.use(express.json());

// Initialize VisitService and inject into app
const visitService = new VisitService(pool);
app.set('visitService', visitService);

// Mount routes
app.use('/api/v1/visits', visitsRouter);

export default app;
