#!/usr/bin/env node

/**
 * BrewBuddy Café — Vercel Build Preparation Script
 * Ensures frontend/dist contains both static assets and Node.js server entrypoints
 * (index.js, server.js, app.js) so Vercel succeeds regardless of whether the project
 * is configured as Vite Static or Node.js Server preset.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const frontendDist = path.join(root, 'frontend', 'dist');

if (!fs.existsSync(frontendDist)) {
  fs.mkdirSync(frontendDist, { recursive: true });
}

// Create an entrypoint in frontend/dist that exports or starts the app
const serverEntrypointContent = `// Auto-generated Vercel full-stack bridge
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to import backend app
let app;
try {
  const backend = await import('../../backend/dist/index.js');
  app = backend.default;
} catch {
  app = express();
}

// Serve current directory as static files
app.use(express.static(__dirname));

// Fallback to index.html for SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => console.log('BrewBuddy running on port ' + PORT));
}

export default app;
`;

fs.writeFileSync(path.join(frontendDist, 'index.js'), serverEntrypointContent);
fs.writeFileSync(path.join(frontendDist, 'server.js'), serverEntrypointContent);
fs.writeFileSync(path.join(frontendDist, 'app.js'), serverEntrypointContent);

console.log('✓ Vercel server entrypoints (index.js, server.js, app.js) generated in frontend/dist');
