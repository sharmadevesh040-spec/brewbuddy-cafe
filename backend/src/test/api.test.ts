import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { filterEligibleMenuItems } from '../ai/gemini.js';
import { store } from '../data/store.js';

describe('BrewBuddy Café API & Grounding Suite', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('Menu APIs', () => {
    it('GET /api/menu returns full catalog', async () => {
      const res = await request(app).get('/api/menu');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(15);
      expect(Array.isArray(res.body.items)).toBe(true);

      const first = res.body.items[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('price');
      expect(first).toHaveProperty('category');
      expect(first).toHaveProperty('dietaryTags');
      expect(first).toHaveProperty('allergens');
      expect(first).toHaveProperty('caffeine');
      expect(first).toHaveProperty('temperature');
      expect(first).toHaveProperty('preparationTime');
    });

    it('GET /api/menu with search and category filters', async () => {
      const res = await request(app).get('/api/menu?category=Coffee&search=latte');
      expect(res.status).toBe(200);
      for (const item of res.body.items) {
        expect(item.category).toBe('Coffee');
        expect(
          item.name.toLowerCase().includes('latte') || item.description.toLowerCase().includes('latte')
        ).toBe(true);
      }
    });

    it('GET /api/menu/:id returns specific item or 404', async () => {
      const resValid = await request(app).get('/api/menu/classic-cappuccino');
      expect(resValid.status).toBe(200);
      expect(resValid.body.name).toBe('Velvet Cappuccino');

      const resInvalid = await request(app).get('/api/menu/non-existent-drink-123');
      expect(resInvalid.status).toBe(404);
    });
  });

  describe('Table APIs & QR Routing', () => {
    it('GET /api/tables returns tables 01 through 20', async () => {
      const res = await request(app).get('/api/tables');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(20);
      expect(res.body.tables.some((t: any) => t.id === '12')).toBe(true);
    });

    it('GET /api/tables/12 returns Table 12 details and active orders', async () => {
      const res = await request(app).get('/api/tables/12');
      expect(res.status).toBe(200);
      expect(res.body.table.id).toBe('12');
      expect(res.body.table.name).toBe('Table 12');
      expect(Array.isArray(res.body.activeOrders)).toBe(true);
    });

    it('GET /api/tables/99 returns 404 for invalid table ID', async () => {
      const res = await request(app).get('/api/tables/99');
      expect(res.status).toBe(404);
    });
  });

  describe('Order System & Timestamps', () => {
    let createdOrderId = '';

    it('POST /api/orders creates a new order with unique ID and exact timestamps', async () => {
      const payload = {
        tableId: '12',
        items: [
          {
            menuItemId: 'classic-cappuccino',
            name: 'Velvet Cappuccino',
            quantity: 2,
            unitPrice: 190,
            customization: {
              milk: 'oat-milk',
              extraPrice: 40,
            },
          },
          {
            menuItemId: 'lemon-iced-tea',
            name: 'Lemon Citrus Blossom Iced Tea',
            quantity: 1,
            unitPrice: 130,
          },
        ],
        specialNotes: 'Table near the patio fountain',
      };

      const res = await request(app).post('/api/orders').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toHaveProperty('id');
      expect(res.body.order.id).toMatch(/^BB\d+$/);
      expect(res.body.order.tableId).toBe('12');
      expect(res.body.order.status).toBe('NEW');
      expect(res.body.order).toHaveProperty('createdAt');
      expect(res.body.order).toHaveProperty('createdAtDisplay');
      expect(res.body.order).toHaveProperty('estimatedPreparationMinutes');
      expect(res.body.order).toHaveProperty('estimatedReadyTime');

      // Price calculation check: (190 + 40) * 2 + 130 = 460 + 130 = 590; GST 5% = 29.5; Total = 619.5
      expect(res.body.order.subtotal).toBe(590);
      expect(res.body.order.tax).toBe(29.5);
      expect(res.body.order.total).toBe(619.5);

      // Verify initial status history
      expect(res.body.order.statusHistory.length).toBe(1);
      expect(res.body.order.statusHistory[0].status).toBe('NEW');

      createdOrderId = res.body.order.id;
    });

    it('PATCH /api/orders/:id/status updates status sequentially with history and preparation duration', async () => {
      expect(createdOrderId).toBeTruthy();

      // 1. Transition to ACCEPTED
      const resAccepted = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .send({ status: 'ACCEPTED', note: 'Kitchen confirmed order' });
      expect(resAccepted.status).toBe(200);
      expect(resAccepted.body.order.status).toBe('ACCEPTED');
      expect(resAccepted.body.order.acceptedAt).toBeDefined();

      // 2. Transition to PREPARING
      const resPrep = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .send({ status: 'PREPARING', note: 'Barista started pulling shots' });
      expect(resPrep.status).toBe(200);
      expect(resPrep.body.order.status).toBe('PREPARING');
      expect(resPrep.body.order.preparingAt).toBeDefined();

      // 3. Transition to READY
      const resReady = await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .send({ status: 'READY', note: 'Ready for pickup at counter' });
      expect(resReady.status).toBe(200);
      expect(resReady.body.order.status).toBe('READY');
      expect(resReady.body.order.readyAt).toBeDefined();
      expect(resReady.body.order.preparationDurationSeconds).toBeGreaterThan(0);

      // 4. Verify history log
      const resGet = await request(app).get(`/api/orders/${createdOrderId}`);
      expect(resGet.status).toBe(200);
      expect(resGet.body.statusHistory.length).toBe(4);
      const statuses = resGet.body.statusHistory.map((h: any) => h.status);
      expect(statuses).toEqual(['NEW', 'ACCEPTED', 'PREPARING', 'READY']);
    });
  });

  describe('Staff and Bill Requests', () => {
    it('POST /api/staff-request creates assistance request', async () => {
      const res = await request(app).post('/api/staff-request').send({
        tableId: '12',
        reason: 'water',
        details: 'Two extra tumblers of warm water',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.request.status).toBe('PENDING');
      expect(res.body.request.tableId).toBe('12');
    });

    it('POST /api/bill-request marks table as bill requested', async () => {
      const res = await request(app).post('/api/bill-request').send({
        tableId: '12',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.bill.tableId).toBe('12');

      // Verify table status is now BILL_REQUESTED
      const tableRes = await request(app).get('/api/tables/12');
      expect(tableRes.body.table.status).toBe('BILL_REQUESTED');
    });
  });

  describe('AI Grounding, Budget & Hallucination Enforcement', () => {
    it('Strict Budget Rule: If budget is ₹150, items costing ₹160+ MUST NEVER be recommended', () => {
      const catalog = store.getMenuItems();
      const { eligible } = filterEligibleMenuItems(catalog, { maxBudget: 150 });

      expect(eligible.length).toBeGreaterThan(0);
      for (const item of eligible) {
        expect(item.price).toBeLessThanOrEqual(150);
      }

      // Check specific items: classic-cappuccino is 190, should NOT be in eligible list
      const cappuccino = eligible.find((i) => i.id === 'classic-cappuccino');
      expect(cappuccino).toBeUndefined();

      // lemon-iced-tea is 130, single-origin-espresso is 140, both should be eligible
      expect(eligible.some((i) => i.id === 'lemon-iced-tea')).toBe(true);
      expect(eligible.some((i) => i.id === 'single-origin-espresso')).toBe(true);
    });

    it('Strict Allergen Rule: Items with excluded allergens MUST be rejected', () => {
      const catalog = store.getMenuItems();
      const { eligible } = filterEligibleMenuItems(catalog, { allergenExclusions: ['dairy'] });

      for (const item of eligible) {
        expect(item.allergens).not.toContain('dairy');
      }
    });

    it('Strict Dietary Rule: Vegan constraint returns only certified vegan items', () => {
      const catalog = store.getMenuItems();
      const { eligible } = filterEligibleMenuItems(catalog, { vegan: true });

      for (const item of eligible) {
        expect(item.dietaryTags).toContain('vegan');
      }
    });

    it('POST /api/recommend endpoint validates and returns verified recommendations', async () => {
      const res = await request(app).post('/api/recommend').send({
        message: 'Suggest a cold non-coffee drink under ₹150',
        maxBudget: 150,
        temperature: 'cold',
        coffeePreference: 'non-coffee',
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.recommendations)).toBe(true);
      expect(res.body.recommendations.length).toBeGreaterThan(0);

      // Verify every recommended item adheres to all constraints
      for (const rec of res.body.recommendations) {
        expect(rec.item.price).toBeLessThanOrEqual(150);
        expect(rec.item.temperature).toBe('cold');
        expect(rec.item.category).not.toBe('Coffee');
        expect(rec).toHaveProperty('reason');
      }

      expect(res.body).toHaveProperty('disclaimer');
      expect(res.body).toHaveProperty('modelUsed');
    });

    it('Hallucination Rejection: If user asks for an impossible combination, never fabricate items', async () => {
      const res = await request(app).post('/api/recommend').send({
        message: 'Give me a hot coffee under ₹20',
        maxBudget: 20, // No coffee exists under ₹20
        temperature: 'hot',
        coffeePreference: 'coffee',
      });

      expect(res.status).toBe(200);
      expect(res.body.recommendations.length).toBe(0);
      expect(res.body.greeting).toContain('relax');
    });
  });

  describe('Analytics Endpoint', () => {
    it('GET /api/analytics returns accurate aggregated dashboard metrics', async () => {
      const res = await request(app).get('/api/analytics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalOrders');
      expect(res.body).toHaveProperty('demoRevenue');
      expect(res.body).toHaveProperty('averagePreparationMinutes');
      expect(res.body).toHaveProperty('popularItem');
      expect(res.body).toHaveProperty('activeTables');
      expect(res.body).toHaveProperty('statusCounts');
      expect(res.body).toHaveProperty('categoryDistribution');
    });
  });
});
