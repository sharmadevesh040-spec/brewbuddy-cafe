import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
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

// Locate frontend production build directory if built
const candidateDistPaths = [
  path.resolve(__dirname, 'public'),
  path.resolve(__dirname, '../public'),
  path.resolve(process.cwd(), 'backend/dist/public'),
  path.resolve(process.cwd(), 'backend/public'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
];
const frontendDist = candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (frontendDist) {
  // Serve static assets (JS, CSS, images, icons, manifest)
  app.use(express.static(frontendDist, { maxAge: '1h' }));
}

// Serve SPA at root
app.get('/', (_req, res, next) => {
  if (frontendDist && fs.existsSync(path.join(frontendDist, 'index.html'))) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  next();
});

// Health Check (support both /api/health and /health)
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BrewBuddy Café Backend',
    timestamp: new Date().toISOString(),
    aiProvider: process.env.GEMINI_API_KEY ? 'gemini-live' : 'grounded-engine-fallback',
  });
});

// API Directory & Discovery Root (support both /api and /api/)
app.get(['/api', '/api/'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BrewBuddy Café API',
    version: '1.0.0',
    documentation: 'https://github.com/sharmadevesh040-spec/brewbuddy-cafe',
    endpoints: {
      health: '/api/health',
      menu: '/api/menu',
      tables: '/api/tables',
      orders: '/api/orders',
      recommend: '/api/recommend',
      staffRequests: '/api/staff/requests',
      analytics: '/api/analytics',
      events: '/api/events',
    },
  });
});

// Mount API Routers (supporting both /api/xxx and direct /xxx for proxy/serverless flexibility)
app.use(['/api/menu', '/menu'], menuRouter);
app.use(['/api/tables', '/tables'], tablesRouter);
app.use(['/api/orders', '/orders'], ordersRouter);
app.use(['/api', '/'], aiRateLimiter, aiRouter);
app.use(['/api', '/'], staffRouter);
app.use(['/api/analytics', '/analytics'], analyticsRouter);
app.use(['/api/events', '/events'], eventsRouter);

// Handler for Unrecognized Endpoints & SPA Client-Side Fallback
app.use((req: Request, res: Response) => {
  // If browser GET request and frontend exists, serve SPA
  if (frontendDist && req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/events')) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }

  res.status(404).json({
    error: 'Route not found',
    message: `The requested API endpoint '${req.method} ${req.originalUrl}' does not exist on BrewBuddy server.`,
    availableEndpoints: [
      '/api/health',
      '/api/menu',
      '/api/tables',
      '/api/orders',
      '/api/recommend',
      '/api/analytics',
      '/api/events',
    ],
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

export default app;
