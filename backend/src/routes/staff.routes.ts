import { Router } from 'express';
import { store } from '../data/store.js';
import { staffRequestSchema, billRequestSchema } from '../validation/schemas.js';

export const staffRouter = Router();

// POST staff request (Call Staff)
staffRouter.post('/staff-request', (req, res) => {
  const result = staffRequestSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  const { tableId, reason, details } = result.data;
  const table = store.getTableById(tableId);
  if (!table) {
    res.status(400).json({ error: `Table "${tableId}" not found` });
    return;
  }

  const request = store.createStaffRequest({ tableId: table.id, reason, details });
  res.status(201).json({
    success: true,
    message: 'Staff notified. A team member is on the way to your table.',
    request,
  });
});

// GET all staff requests
staffRouter.get('/staff-requests', (_req, res) => {
  const requests = store.getStaffRequests();
  res.json({
    count: requests.length,
    requests,
  });
});

// PATCH mark staff request handled
staffRouter.patch('/staff-requests/:id/handled', (req, res) => {
  const handled = store.handleStaffRequest(req.params.id);
  if (!handled) {
    res.status(404).json({ error: 'Staff request not found' });
    return;
  }
  res.json({ success: true, request: handled });
});

// POST bill request
staffRouter.post('/bill-request', (req, res) => {
  const result = billRequestSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  const { tableId, orderId } = result.data;
  const table = store.getTableById(tableId);
  if (!table) {
    res.status(400).json({ error: `Table "${tableId}" not found` });
    return;
  }

  const bill = store.createBillRequest({ tableId: table.id, orderId });
  res.status(201).json({
    success: true,
    message: 'Bill requested. Staff has been notified.',
    bill,
  });
});

// GET all bill requests
staffRouter.get('/bill-requests', (_req, res) => {
  const bills = store.getBillRequests();
  res.json({
    count: bills.length,
    bills,
  });
});

// PATCH handle bill request status
staffRouter.patch('/bill-requests/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['PREPARED', 'SETTLED'].includes(status)) {
    res.status(400).json({ error: 'Status must be PREPARED or SETTLED' });
    return;
  }

  const handled = store.handleBillRequest(req.params.id, status);
  if (!handled) {
    res.status(404).json({ error: 'Bill request not found' });
    return;
  }
  res.json({ success: true, bill: handled });
});
