# BrewBuddy Café — Testing Suite & Quality Assurance

This document details the automated tests covering the backend API, AI grounding, security checks, and frontend UI components.

---

## 1. Test Overview

* **Backend Tests:** 16 automated tests covering the menu, tables, orders lifecycle, staff requests, bill requests, budget constraints, and hallucination rejection.
* **Frontend Tests:** 3 automated tests covering home rendering, interactive drink builder calculations, and AI Lab simulation.
* **Test Runners:** Vitest 5.1.1, Supertest 7.3.2, React Testing Library.

---

## 2. Running Automated Tests

### Run All Tests (Backend + Frontend)
```bash
npm test
```

### Run Backend Tests Only
```bash
npm run test:backend
# or
npm --prefix backend test
```

### Run Frontend Tests Only
```bash
npm run test:frontend
# or
npm --prefix frontend test
```

---

## 3. Key Test Cases

### 1. Strict Budget Enforcement Test
```typescript
it('Strict Budget Rule: If budget is ₹150, items costing ₹160+ MUST NEVER be recommended', () => {
  const catalog = store.getMenuItems();
  const { eligible } = filterEligibleMenuItems(catalog, { maxBudget: 150 });
  for (const item of eligible) {
    expect(item.price).toBeLessThanOrEqual(150);
  }
  expect(eligible.find(i => i.id === 'classic-cappuccino')).toBeUndefined();
});
```
* **Why it matters:** Ensures mathematical compliance. If a student or guest asks for a cold drink under ₹150, expensive items (e.g. ₹190 Cappuccino) can never be recommended.

### 2. Hallucination Rejection Sieve Test
```typescript
it('Hallucination Rejection: If user asks for an impossible combination, never fabricate items', async () => {
  const res = await request(app).post('/api/recommend').send({
    message: 'Give me a hot coffee under ₹20',
    maxBudget: 20,
    temperature: 'hot',
    coffeePreference: 'coffee',
  });
  expect(res.status).toBe(200);
  expect(res.body.recommendations.length).toBe(0);
  expect(res.body.greeting).toContain('relax');
});
```
* **Why it matters:** Proves the model cannot fabricate cheap fictional items when none exist in the catalog.

### 3. Sequential Order Lifecycle & Stopwatch Test
* Validates `NEW` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `SERVED`.
* Verifies exact ISO timestamps in `order.statusHistory`.
* Verifies calculation of `preparationDurationSeconds` when transitioning to `READY`.

### 4. Drink Builder Live Price Calculation Test
* Verifies that selecting Cappuccino base (₹190) + Oat Milk (₹40) + Grande Size (₹40) + Vanilla syrup (₹30) correctly computes ₹300 live.
