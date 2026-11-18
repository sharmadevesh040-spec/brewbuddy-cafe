# BrewBuddy Café — System Architecture & Design Specification

## 1. High-Level Architecture Overview

BrewBuddy Café is a decoupled, modern full-stack web application designed for table QR ordering, AI barista consultations, and live kitchen management.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                     │
│  - Customer PWA / QR Table Experience (/table/:id, /scan)             │
│  - AI Barista Interface (/ai-barista)                                 │
│  - Bespoke Drink Builder (/build)                                     │
│  - Kitchen Display System (/kitchen)                                  │
│  - Staff Operations Dashboard (/admin/dashboard, /admin/tables)       │
│  - AI Transparency Lab (/ai-lab)                                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP JSON / SSE Stream
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express + Zod)                  │
│  - Zod Request Validation Middleware                                  │
│  - In-Memory + Disk-Persisted Data Store (StateStore)                 │
│  - Server-Sent Events (SSE) Event Broker                              │
│  - Deterministic Menu Grounding Engine                                │
│  - QR Code Generation Engine (SVG / PNG)                              │
│  - Rate Limiter & Security Header Middleware                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AI GENERATIVE ENGINE                            │
│  - Server-Side Gemini 2.5 Flash API Integration                       │
│  - Zero-Hallucination Post-Validation Sieve                           │
│  - Fallback Semantic Grounding Engine                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout

```
cafe/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   └── gemini.ts           # Grounded AI Barista engine & validation
│   │   ├── data/
│   │   │   └── store.ts            # State store, persistence & event broker
│   │   ├── routes/
│   │   │   ├── ai.routes.ts        # /api/recommend endpoint
│   │   │   ├── analytics.routes.ts # /api/analytics endpoint
│   │   │   ├── events.routes.ts    # /api/events SSE stream
│   │   │   ├── menu.routes.ts      # /api/menu & item endpoints
│   │   │   ├── orders.routes.ts    # /api/orders lifecycle & status
│   │   │   ├── staff.routes.ts     # /api/staff-request & /api/bill-request
│   │   │   └── tables.routes.ts    # /api/tables & live QR endpoints
│   │   ├── types/
│   │   │   └── index.ts            # Type definitions
│   │   ├── validation/
│   │   │   └── schemas.ts          # Zod validation schemas
│   │   └── index.ts                # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessibilityModal.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── TableSelectorModal.tsx
│   │   ├── context/
│   │   │   ├── CartContext.tsx
│   │   │   ├── EventsContext.tsx
│   │   │   ├── TableContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── pages/
│   │   │   ├── AboutPage.tsx
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminTablesPage.tsx
│   │   │   ├── AiBaristaPage.tsx
│   │   │   ├── AiLabPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── DrinkBuilderPage.tsx
│   │   │   ├── GalleryPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── KitchenKDSPage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   ├── OrderTrackingPage.tsx
│   │   │   ├── OrdersHistoryPage.tsx
│   │   │   ├── ScanPage.tsx
│   │   │   └── TablePage.tsx
│   │   ├── services/
│   │   │   └── api.ts              # Typed API client
│   │   ├── types/
│   │   │   └── index.ts            # Shared frontend types
│   │   ├── App.tsx
│   │   ├── index.css               # Tailwind CSS v4 design tokens
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   ├── customizations.json         # Drink builder bases, milks, extras
│   ├── menu.json                   # Master controlled catalog (25 items)
│   └── tables.json                 # Tables 01 to 20 metadata
├── docs/
│   ├── AI-INTEGRITY-LOG.md
│   ├── ARCHITECTURE.md
│   ├── DEMO-SCRIPT.md
│   └── TESTING.md
├── scripts/
│   └── generate-qr.js              # CLI table QR generator (PNG/SVG)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Data Models & Entities

### Order Entity (`Order`)
* `id`: Unique alphanumeric ID (`BB1024`)
* `tableId`: Table station string (`12`)
* `items`: Array of ordered items with customizations
* `subtotal`, `tax` (5% GST), `total`: Financial calculations
* `status`: `NEW` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `SERVED` -> `CANCELLED`
* `createdAt`, `acceptedAt`, `preparingAt`, `readyAt`, `servedAt`: Exact ISO timestamps
* `statusHistory`: Ordered array of `OrderStatusHistoryItem` records
* `estimatedPreparationMinutes`: Computed preparation duration
* `preparationDurationSeconds`: Stopwatch elapsed preparation time

### Table Entity (`Table`)
* `id`: `01` to `20`
* `name`: `Table 12`
* `section`: `Patio Garden`, `Window View`, `Indoor Lounge`, `Quiet Booth`
* `capacity`: `2`, `4`, `6`, `8`
* `status`: `AVAILABLE`, `OCCUPIED`, `PREPARING`, `READY`, `BILL_REQUESTED`

---

## 4. Real-Time Synchronization via Server-Sent Events (SSE)

Instead of CPU-heavy polling loops, the server exposes `/api/events` (HTTP EventSource stream). When state changes occur:
1. Customer places order -> broadcasts `ORDER_CREATED` -> Kitchen and Dashboard update instantly.
2. Kitchen starts ticket -> broadcasts `ORDER_UPDATED` -> Customer order tracking screen updates in real time.
3. Customer calls staff -> broadcasts `STAFF_REQUEST_CREATED` -> Staff dashboard triggers alert.
