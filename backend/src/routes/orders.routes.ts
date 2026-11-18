import { Router } from 'express';
import { store } from '../data/store.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validation/schemas.js';

export const ordersRouter = Router();

// POST create order
ordersRouter.post('/', (req, res) => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  const { tableId, items, specialNotes } = result.data;

  // Validate that table exists
  const table = store.getTableById(tableId);
  if (!table) {
    res.status(400).json({ error: `Invalid table ID: "${tableId}". Please scan a valid table QR.` });
    return;
  }

  // Validate that all items exist in catalog
  for (const item of items) {
    const catalogItem = store.getMenuItemById(item.menuItemId);
    if (!catalogItem) {
      res.status(400).json({ error: `Menu item with ID "${item.menuItemId}" does not exist in catalog.` });
      return;
    }
  }

  const order = store.createOrder({
    tableId: table.id,
    items,
    specialNotes,
  });

  res.status(201).json({
    success: true,
    message: 'Demo order created successfully — no real payment is processed.',
    order,
  });
});

// GET all orders
ordersRouter.get('/', (req, res) => {
  const { status, tableId } = req.query;
  let orders = store.getAllOrders();

  if (status && typeof status === 'string' && status !== 'ALL') {
    orders = orders.filter((o) => o.status === status);
  }

  if (tableId && typeof tableId === 'string') {
    const formatted = tableId.padStart(2, '0');
    orders = orders.filter((o) => o.tableId === tableId || o.tableId === formatted);
  }

  res.json({
    count: orders.length,
    orders,
  });
});

// GET single order by ID
ordersRouter.get('/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

// PATCH update order status
ordersRouter.patch('/:id/status', (req, res) => {
  const result = updateOrderStatusSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  const { status, note } = result.data;
  const updated = store.updateOrderStatus(req.params.id, status, note);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({
    success: true,
    order: updated,
  });
});
