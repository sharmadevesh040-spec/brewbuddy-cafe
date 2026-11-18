#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const frontendDist = path.join(root, 'frontend', 'dist');
const backendDistPublic = path.join(root, 'backend', 'dist', 'public');
const backendPublic = path.join(root, 'backend', 'public');

function copyFolder(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(frontendDist)) {
  copyFolder(frontendDist, backendDistPublic);
  copyFolder(frontendDist, backendPublic);
  console.log('✓ Successfully copied frontend/dist to backend/dist/public and backend/public');
} else {
  console.warn('! frontend/dist not found to copy');
}
