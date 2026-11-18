import { Router } from 'express';
import QRCode from 'qrcode';
import { store } from '../data/store.js';

export const tablesRouter = Router();

// GET all tables
tablesRouter.get('/', (_req, res) => {
  const tables = store.getTables();
  res.json({
    count: tables.length,
    tables,
  });
});

// GET single table details with active orders
tablesRouter.get('/:id', (req, res) => {
  const table = store.getTableById(req.params.id);
  if (!table) {
    res.status(404).json({ error: 'Table not found' });
    return;
  }

  const activeOrders = store.getOrdersByTableId(table.id).filter(
    (o) => !['CANCELLED', 'SERVED'].includes(o.status)
  );

  const sessionOrders = store.getOrdersByTableId(table.id);

  res.json({
    table,
    activeOrders,
    sessionOrders,
  });
});

// PATCH table status
tablesRouter.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['AVAILABLE', 'OCCUPIED', 'PREPARING', 'READY', 'BILL_REQUESTED'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid table status' });
    return;
  }

  const updated = store.setTableStatus(req.params.id, status);
  if (!updated) {
    res.status(404).json({ error: 'Table not found' });
    return;
  }

  res.json({ success: true, table: updated });
});

// GET table QR code image (PNG or SVG)
tablesRouter.get('/:id/qr', async (req, res) => {
  const table = store.getTableById(req.params.id);
  if (!table) {
    res.status(404).json({ error: 'Table not found' });
    return;
  }

  const format = req.query.format === 'svg' ? 'svg' : 'png';
  const baseUrl = (req.query.baseUrl as string) || `${req.protocol}://${req.get('host')}`;
  const destinationUrl = `${baseUrl}/table/${table.id}`;

  try {
    if (format === 'svg') {
      const svg = await QRCode.toString(destinationUrl, {
        type: 'svg',
        color: {
          dark: '#2A201C',
          light: '#FFFCF7',
        },
        margin: 2,
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `inline; filename="table-${table.id}-qr.svg"`);
      res.send(svg);
    } else {
      const buffer = await QRCode.toBuffer(destinationUrl, {
        color: {
          dark: '#2A201C',
          light: '#FFFCF7',
        },
        width: 380,
        margin: 2,
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="table-${table.id}-qr.png"`);
      res.send(buffer);
    }
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});
