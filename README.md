# ☕ BrewBuddy Café
### AI-Powered Smart Café & QR Table Ordering System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Vitest](https://img.shields.io/badge/Tests-19%20Passing-brightgreen.svg)](https://vitest.dev/)

> **BrewBuddy Café** is a production-quality smart café web application built for college project demonstrations, hackathon assessments, and viva examinations. It integrates physical QR table ordering, a grounded natural-language AI Barista, live kitchen display (KDS), and a real-time staff operations dashboard.

---

## 🌟 Key Features

### 👤 Customer Experience
* **QR Table Scan (`/scan` & `/table/:tableId`):** Scan table stand with camera, upload a photo, enter manual code, or use demo picker. Table session is maintained in local storage without forcing login, phone numbers, or personal data collection.
* **Controlled Menu Catalog (`/menu`):** Handcrafted roasts, teas, coolers, and snacks with prices in INR (`₹`), dietary badges, allergen tags, and instant search/filters.
* **AI Barista (`/ai-barista`):** Conversational AI powered by Gemini 2.5 Flash with strict catalog grounding, budget enforcement, and zero hallucinations.
* **Interactive Drink Builder (`/build`):** Step-by-step beverage customization (base, milks, temperature, sweetness, sizes, gourmet extras) with live price calculation.
* **Demo Ordering & Real Timestamps (`/order`):** Unique order IDs (`#BB1024`), 5% GST calculation, and explicit demo notices.
* **Live Order Tracking (`/order/:orderId`):** Synchronized real-time status timeline (`NEW` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `SERVED`) with exact timestamps and preparation stopwatch timer.
* **In-Seat Table Services:** One-tap **Call Staff** (water, assistance) and **Request Bill** without leaving your seat.
* **Current Session Order History (`/orders`):** Review active and past orders placed from your table during the current visit.

### 👨‍🍳 Kitchen & Operations Experience
* **Kitchen Display System (`/kitchen`):** High-contrast touchscreen interface with 3 active columns (`NEW`, `PREPARING`, `READY`), elapsed stopwatch timers that flag overdue tickets, and soft synthesized audio chimes.
* **Staff Dashboard (`/admin/dashboard`):** Real-time operational overview with live order cards, customer assistance requests, bill settlement requests, and Recharts analytics.
* **Table QR Management (`/admin/tables`):** Real-time status for Tables 01 to 20 with dynamic SVG/PNG downloads and printable table stand templates.
* **AI Transparency & Integrity Lab (`/ai-lab`):** Interactive academic flowchart explaining the 7-stage verification sieve with a live hallucination rejection playground.

---

## 🏛️ System Architecture

```
User Request ──► Zod Validation ──► Deterministic Menu Sieve ──► Gemini 2.5 Flash
                                                                         │
                                                                         ▼
Customer UI  ◄── Server-Sent Events (SSE) ◄── Post-Validation Sieve ◄── Structured JSON
```

For complete architectural specifications, see [`docs/ARCHITECTURE.md`](file:///c:/myproject/cafe/docs/ARCHITECTURE.md).

---

## 🤖 AI Grounding & Security Policy

1. **Pre-Filtering:** Budget limits, allergen exclusions, and dietary rules are filtered by the backend *before* passing candidate items to Gemini.
2. **Catalog Integrity:** The AI can only select IDs from [`data/menu.json`](file:///c:/myproject/cafe/data/menu.json). If the model hallucinates an invalid ID (e.g. `dragon-coffee-999`), the backend sieve rejects it.
3. **Budget Guardrail:** An item costing ₹190 will *never* be suggested if the user's budget is ₹150.
4. **Key Security:** API keys are strictly server-side and never exposed to browser storage, GitHub, or client bundles.

For empirical testing records, see [`docs/AI-INTEGRITY-LOG.md`](file:///c:/myproject/cafe/docs/AI-INTEGRITY-LOG.md).

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js v20+ (tested on v24.13.0)
* npm v10+

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/brewbuddy-cafe/brewbuddy.git
cd cafe

# Install root, backend, and frontend packages
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note:** If `GEMINI_API_KEY` is not provided, BrewBuddy automatically runs in **Offline Grounded Mode** using its semantic catalog ranking engine, ensuring zero crashes during viva demonstration.

### 3. Run Development Servers
Start both the Express backend (port 5000) and Vite frontend (port 5173) with a single command:
```bash
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🧪 Automated Testing Suite

BrewBuddy includes 19 automated unit, integration, and security tests:

```bash
# Run all tests (backend + frontend)
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

For detailed test coverage, see [`docs/TESTING.md`](file:///c:/myproject/cafe/docs/TESTING.md).

---

## 📱 Table QR Generation

Generate genuine SVG and PNG QR codes for Tables 01 to 20:
```bash
npm run qr:generate
```
Or specify a production base URL:
```bash
node scripts/generate-qr.js --baseUrl=https://brewbuddy.cafe
```
QR codes are output directly to `frontend/public/qr-codes/`.

---

## 📋 Viva / Assessment Demo Script

To deliver a flawless 4 to 6 minute live demonstration, follow the exact sequence in [`docs/DEMO-SCRIPT.md`](file:///c:/myproject/cafe/docs/DEMO-SCRIPT.md).

Quick Routes for Demonstration:
* Customer Home: `http://localhost:5173/`
* Table 12: `http://localhost:5173/table/12`
* AI Barista: `http://localhost:5173/ai-barista`
* Drink Builder: `http://localhost:5173/build`
* Staff Operations Dashboard: `http://localhost:5173/admin/dashboard`
* Kitchen Display System (KDS): `http://localhost:5173/kitchen`
* Table QR Management: `http://localhost:5173/admin/tables`
* AI Transparency Lab: `http://localhost:5173/ai-lab`

---

## 📄 License & Credits

* **Academic Demonstration:** Built with precision for college viva, hackathon presentations, and technical portfolios.
* **Disclaimer:** BrewBuddy Café is a demonstration product. No actual monetary payments are processed and no personal customer data is stored.
* **License:** MIT License.
