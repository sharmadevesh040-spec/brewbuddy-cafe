import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.resolve(__dirname, '../frontend/public/icons');
const publicDir = path.resolve(__dirname, '../frontend/public');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// CRC32 table implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createSolidPng(width, height, r, g, b, innerR, innerG, innerB) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit depth (8), color type (6: RGBA), compression (0), filter (0), interlace (0)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = createPngChunk('IHDR', ihdr);

  // Raw image scanlines: filter byte (0) + 4 bytes per pixel
  const scanlineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;
  const innerRadius = width * 0.28;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineSize;
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= innerRadius) {
        // Center accent (Caramel)
        rawData[pxOffset] = innerR;
        rawData[pxOffset + 1] = innerG;
        rawData[pxOffset + 2] = innerB;
        rawData[pxOffset + 3] = 255;
      } else if (dist <= radius) {
        // Outer disc (Espresso)
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      } else {
        // Background rounded corner (Off-white / Warm Cream)
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 252;
        rawData[pxOffset + 2] = 247;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createPngChunk('IDAT', compressed);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate 192x192 and 512x512 icons (Espresso #2A201C: 42, 32, 28; Caramel #B77B4B: 183, 123, 75)
const icon192 = createSolidPng(192, 192, 42, 32, 28, 183, 123, 75);
const icon512 = createSolidPng(512, 512, 42, 32, 28, 183, 123, 75);

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), icon192);

// Also write an SVG version of the app icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#2A201C"/>
  <circle cx="256" cy="256" r="180" fill="#3D302A"/>
  <circle cx="256" cy="256" r="130" fill="#B77B4B"/>
  <path d="M200 210h112v48a56 56 0 0 1-56 56h0a56 56 0 0 1-56-56v-48z" fill="#FFFCF7"/>
  <path d="M312 225h18a18 18 0 0 1 18 18v2a18 18 0 0 1-18 18h-18v-38z" fill="none" stroke="#FFFCF7" stroke-width="12"/>
  <path d="M224 175c0-15 10-25 10-35M256 175c0-15 10-25 10-35M288 175c0-15 10-25 10-35" stroke="#FFFCF7" stroke-width="10" stroke-linecap="round"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon, 'utf-8');

console.log('✓ Successfully generated PWA icons: icon-192x192.png, icon-512x512.png, apple-touch-icon.png, favicon.svg');
