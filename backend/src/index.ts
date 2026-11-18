import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Routes
import { menuRouter } from './routes/menu.routes.js';
import { tablesRouter } from './routes/tables.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { staffRouter } from './routes/staff.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { eventsRouter } from './routes/events.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env or backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Security & Parsing Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '500kb' }));

// Custom Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple In-Memory Rate Limiter for AI endpoint to prevent abuse
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const aiRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests to AI Barista. Please pause for a moment before trying again.',
    });
    return;
  }

  record.count += 1;
  next();
};

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BrewBuddy Café Backend',
    timestamp: new Date().toISOString(),
    aiProvider: process.env.GEMINI_API_KEY ? 'gemini-live' : 'grounded-engine-fallback',
  });
});

// Mount API Routers
app.use('/api/menu', menuRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api', aiRateLimiter, aiRouter);
app.use('/api', staffRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/events', eventsRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested API endpoint does not exist on BrewBuddy server.',
  });
});

// Global Error Handler — NEVER expose stack traces to client
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Uncaught Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred while processing your request.',
  });
});

// Only listen when executed directly, not when imported during tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`☕ BrewBuddy Café API server running on http://localhost:${PORT}`);
    console.log(`🤖 AI Barista Mode: ${process.env.GEMINI_API_KEY ? 'Gemini 2.5 Flash' : 'Grounded Semantic Engine'}`);
  });
}

export default app;
