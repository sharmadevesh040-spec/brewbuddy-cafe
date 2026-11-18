#!/usr/bin/env node

/**
 * BrewBuddy Café — Table QR Code Batch Generator
 * Generates genuine SVG and PNG QR codes for Tables 01–20.
 *
 * Usage:
 *   node scripts/generate-qr.js
 *   node scripts/generate-qr.js --baseUrl=https://brewbuddy.cafe
 *   node scripts/generate-qr.js --table=12
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../frontend/public/qr-codes');

// Parse CLI arguments
const args = process.argv.slice(2);
let baseUrl = 'http://localhost:5173'; // Default dev URL
let specificTable = null;

for (const arg of args) {
  if (arg.startsWith('--baseUrl=')) {
    baseUrl = arg.split('=')[1].replace(/\/$/, '');
  } else if (arg.startsWith('--table=')) {
    specificTable = arg.split('=')[1].padStart(2, '0');
  }
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('========================================================');
console.log('☕ BrewBuddy Café — Table QR Code Generator');
console.log(`📍 Base URL: ${baseUrl}`);
console.log(`📁 Output Folder: ${outputDir}`);
console.log('========================================================\n');

async function generateTableQR(tableNum) {
  const tableId = tableNum.toString().padStart(2, '0');
  const destinationUrl = `${baseUrl}/table/${tableId}`;

  const pngPath = path.join(outputDir, `table-${tableId}.png`);
  const svgPath = path.join(outputDir, `table-${tableId}.svg`);

  // 1. Generate High-Res PNG with BrewBuddy brand colors
  await QRCode.toFile(pngPath, destinationUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#2A201C', // Espresso
      light: '#FFFCF7', // Off-white
    },
    errorCorrectionLevel: 'H',
  });

  // 2. Generate Scalable SVG
  const svgString = await QRCode.toString(destinationUrl, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#2A201C',
      light: '#FFFCF7',
    },
    errorCorrectionLevel: 'H',
  });

  fs.writeFileSync(svgPath, svgString, 'utf-8');

  console.log(`✓ Table ${tableId} -> ${destinationUrl}`);
  console.log(`  PNG: table-${tableId}.png | SVG: table-${tableId}.svg`);
}

async function run() {
  try {
    if (specificTable) {
      await generateTableQR(specificTable);
    } else {
      for (let i = 1; i <= 20; i++) {
        await generateTableQR(i);
      }
    }

    // Also generate GitHub repository QR code placeholder
    const githubRepoUrl = 'https://github.com/brewbuddy-cafe/brewbuddy';
    const repoPngPath = path.join(outputDir, 'github-repo.png');
    await QRCode.toFile(repoPngPath, githubRepoUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#2A201C',
        light: '#FFFCF7',
      },
      errorCorrectionLevel: 'H',
    });
    console.log(`\n✓ GitHub Repo QR -> ${githubRepoUrl} (github-repo.png)`);

    console.log('\n🎉 All QR codes successfully generated with genuine destination URLs!');
  } catch (err) {
    console.error('Error generating QR codes:', err);
    process.exit(1);
  }
}

run();
