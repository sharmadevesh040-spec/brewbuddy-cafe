import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  MenuItem,
  Table,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistoryItem,
  StaffRequest,
  BillRequest,
  TableStatus,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate project root data directory
const projectRoot = path.resolve(__dirname, '../../../');
const menuPath = path.join(projectRoot, 'data', 'menu.json');
const tablesPath = path.join(projectRoot, 'data', 'tables.json');
const persistencePath = path.join(__dirname, 'db-state.json');

function formatDisplayTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

class CafeStore {
  private menuItems: MenuItem[] = [];
  private tables: Map<string, Table> = new Map();
  private orders: Map<string, Order> = new Map();
  private staffRequests: Map<string, StaffRequest> = new Map();
  private billRequests: Map<string, BillRequest> = new Map();
  private orderCounter: number = 1024;
  private listeners: Set<(event: { type: string; payload: unknown }) => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    // 1. Load Menu
    try {
      if (fs.existsSync(menuPath)) {
        const raw = fs.readFileSync(menuPath, 'utf-8');
        this.menuItems = JSON.parse(raw);
      } else {
        console.warn(`[CafeStore] menu.json not found at ${menuPath}, using empty array`);
        this.menuItems = [];
      }
    } catch (err) {
      console.error('[CafeStore] Error loading menu.json:', err);
      this.menuItems = [];
    }

    // 2. Load Tables
    try {
      if (fs.existsSync(tablesPath)) {
        const raw = fs.readFileSync(tablesPath, 'utf-8');
        const parsed: Table[] = JSON.parse(raw);
        for (const t of parsed) {
          this.tables.set(t.id, t);
        }
      } else {
        // Fallback default 20 tables
        for (let i = 1; i <= 20; i++) {
          const id = i.toString().padStart(2, '0');
          this.tables.set(id, {
            id,
            number: i,
            name: `Table ${id}`,
            section: i <= 5 ? 'Window View' : i <= 10 ? 'Indoor Lounge' : i <= 16 ? 'Patio Garden' : 'Mezzanine Loft',
            capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
            status: 'AVAILABLE',
          });
        }
      }
    } catch (err) {
      console.error('[CafeStore] Error loading tables.json:', err);
    }

    // 3. Load optional persisted state or seed realistic initial demo state
    this.loadPersistedStateOrSeed();
  }

  private loadPersistedStateOrSeed() {
    if (fs.existsSync(persistencePath)) {
      try {
        const raw = fs.readFileSync(persistencePath, 'utf-8');
        const state = JSON.parse(raw);
        if (state.orderCounter) this.orderCounter = state.orderCounter;
        if (Array.isArray(state.orders)) {
          for (const o of state.orders) this.orders.set(o.id, o);
        }
        if (Array.isArray(state.tables)) {
          for (const t of state.tables) this.tables.set(t.id, t);
        }
        if (Array.isArray(state.staffRequests)) {
          for (const r of state.staffRequests) this.staffRequests.set(r.id, r);
        }
        if (Array.isArray(state.billRequests)) {
          for (const b of state.billRequests) this.billRequests.set(b.id, b);
        }
        return;
      } catch (e) {
        console.warn('[CafeStore] Could not load db-state.json, re-seeding demo baseline:', e);
      }
    }

    // Seed realistic demo baseline so dashboard and KDS have rich viva-ready data right out of the box
    this.seedDemoBaseline();
  }

  private persist() {
    try {
      const state = {
        orderCounter: this.orderCounter,
        orders: Array.from(this.orders.values()),
        tables: Array.from(this.tables.values()),
        staffRequests: Array.from(this.staffRequests.values()),
        billRequests: Array.from(this.billRequests.values()),
      };
      fs.writeFileSync(persistencePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      // Non-fatal if filesystem write fails
      console.error('[CafeStore] Persist error:', err);
    }
  }

  private seedDemoBaseline() {
    const now = new Date();
    const subMinutes = (m: number) => new Date(now.getTime() - m * 60000);

    // Seed previous served order for Table 08
    const t08Order: Order = {
      id: 'BB1021',
      tableId: '08',
      items: [
        {
          id: 'item-1021-1',
          menuItemId: 'classic-cappuccino',
          name: 'Velvet Cappuccino',
          quantity: 1,
          unitPrice: 190,
          totalPrice: 190,
          preparationTime: 5,
        },
        {
          id: 'item-1021-2',
          menuItemId: 'lotus-biscoff-cheesecake',
          name: 'Baked Biscoff Cheesecake Slice',
          quantity: 1,
          unitPrice: 260,
          totalPrice: 260,
          preparationTime: 4,
        },
      ],
      subtotal: 450,
      tax: 22.5,
      total: 472.5,
      status: 'SERVED',
      createdAt: subMinutes(45).toISOString(),
      createdAtDisplay: formatDisplayTime(subMinutes(45)),
      acceptedAt: subMinutes(43).toISOString(),
      preparingAt: subMinutes(41).toISOString(),
      readyAt: subMinutes(32).toISOString(),
      servedAt: subMinutes(30).toISOString(),
      estimatedPreparationMinutes: 8,
      estimatedReadyTime: subMinutes(33).toISOString(),
      preparationDurationSeconds: 540,
      statusHistory: [
        {
          id: 'h-1',
          orderId: 'BB1021',
          status: 'NEW',
          timestamp: subMinutes(45).toISOString(),
          displayTime: formatDisplayTime(subMinutes(45)),
        },
        {
          id: 'h-2',
          orderId: 'BB1021',
          status: 'ACCEPTED',
          timestamp: subMinutes(43).toISOString(),
          displayTime: formatDisplayTime(subMinutes(43)),
        },
        {
          id: 'h-3',
          orderId: 'BB1021',
          status: 'PREPARING',
          timestamp: subMinutes(41).toISOString(),
          displayTime: formatDisplayTime(subMinutes(41)),
        },
        {
          id: 'h-4',
          orderId: 'BB1021',
          status: 'READY',
          timestamp: subMinutes(32).toISOString(),
          displayTime: formatDisplayTime(subMinutes(32)),
        },
        {
          id: 'h-5',
          orderId: 'BB1021',
          status: 'SERVED',
          timestamp: subMinutes(30).toISOString(),
          displayTime: formatDisplayTime(subMinutes(30)),
        },
      ],
    };

    // Seed active Preparing order for Table 04
    const t04Order: Order = {
      id: 'BB1022',
      tableId: '04',
      items: [
        {
          id: 'item-1022-1',
          menuItemId: 'oat-milk-vanilla-latte',
          name: 'Oat Milk Madagascar Latte',
          quantity: 2,
          unitPrice: 230,
          totalPrice: 460,
          preparationTime: 5,
        },
        {
          id: 'item-1022-2',
          menuItemId: 'avocado-sourdough-toast',
          name: 'Artisan Avocado Sourdough Tartine',
          quantity: 1,
          unitPrice: 260,
          totalPrice: 260,
          preparationTime: 8,
        },
      ],
      subtotal: 720,
      tax: 36,
      total: 756,
      status: 'PREPARING',
      createdAt: subMinutes(12).toISOString(),
      createdAtDisplay: formatDisplayTime(subMinutes(12)),
      acceptedAt: subMinutes(10).toISOString(),
      preparingAt: subMinutes(8).toISOString(),
      estimatedPreparationMinutes: 10,
      estimatedReadyTime: new Date(now.getTime() + 2 * 60000).toISOString(),
      statusHistory: [
        {
          id: 'h-6',
          orderId: 'BB1022',
          status: 'NEW',
          timestamp: subMinutes(12).toISOString(),
          displayTime: formatDisplayTime(subMinutes(12)),
        },
        {
          id: 'h-7',
          orderId: 'BB1022',
          status: 'ACCEPTED',
          timestamp: subMinutes(10).toISOString(),
          displayTime: formatDisplayTime(subMinutes(10)),
        },
        {
          id: 'h-8',
          orderId: 'BB1022',
          status: 'PREPARING',
          timestamp: subMinutes(8).toISOString(),
          displayTime: formatDisplayTime(subMinutes(8)),
        },
      ],
    };

    // Seed active Ready order for Table 02
    const t02Order: Order = {
      id: 'BB1023',
      tableId: '02',
      items: [
        {
          id: 'item-1023-1',
          menuItemId: 'japanese-matcha-cloud-latte',
          name: 'Kyoto Ceremonial Matcha Cloud',
          quantity: 1,
          unitPrice: 240,
          totalPrice: 240,
          preparationTime: 5,
        },
        {
          id: 'item-1023-2',
          menuItemId: 'lemon-iced-tea',
          name: 'Lemon Citrus Blossom Iced Tea',
          quantity: 1,
          unitPrice: 130,
          totalPrice: 130,
          preparationTime: 3,
        },
      ],
      subtotal: 370,
      tax: 18.5,
      total: 388.5,
      status: 'READY',
      createdAt: subMinutes(18).toISOString(),
      createdAtDisplay: formatDisplayTime(subMinutes(18)),
      acceptedAt: subMinutes(16).toISOString(),
      preparingAt: subMinutes(14).toISOString(),
      readyAt: subMinutes(2).toISOString(),
      estimatedPreparationMinutes: 6,
      estimatedReadyTime: subMinutes(8).toISOString(),
      preparationDurationSeconds: 720,
      statusHistory: [
        {
          id: 'h-9',
          orderId: 'BB1023',
          status: 'NEW',
          timestamp: subMinutes(18).toISOString(),
          displayTime: formatDisplayTime(subMinutes(18)),
        },
        {
          id: 'h-10',
          orderId: 'BB1023',
          status: 'ACCEPTED',
          timestamp: subMinutes(16).toISOString(),
          displayTime: formatDisplayTime(subMinutes(16)),
        },
        {
          id: 'h-11',
          orderId: 'BB1023',
          status: 'PREPARING',
          timestamp: subMinutes(14).toISOString(),
          displayTime: formatDisplayTime(subMinutes(14)),
        },
        {
          id: 'h-12',
          orderId: 'BB1023',
          status: 'READY',
          timestamp: subMinutes(2).toISOString(),
          displayTime: formatDisplayTime(subMinutes(2)),
        },
      ],
    };

    this.orders.set(t08Order.id, t08Order);
    this.orders.set(t04Order.id, t04Order);
    this.orders.set(t02Order.id, t02Order);

    // Update corresponding table statuses
    this.setTableStatus('04', 'PREPARING');
    this.setTableStatus('02', 'READY');

    // Seed 1 sample staff request
    this.staffRequests.set('req-1', {
      id: 'req-1',
      tableId: '04',
      reason: 'water',
      details: 'Two extra glasses of cold water requested',
      status: 'PENDING',
      createdAt: subMinutes(6).toISOString(),
      createdAtDisplay: formatDisplayTime(subMinutes(6)),
    });

    this.orderCounter = 1024;
    this.persist();
  }

  // --- Real-time listener registration ---
  public subscribe(listener: (event: { type: string; payload: unknown }) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private broadcast(type: string, payload: unknown) {
    for (const listener of this.listeners) {
      try {
        listener({ type, payload });
      } catch (err) {
        console.error('[CafeStore] Broadcast error to listener:', err);
      }
    }
  }

  // --- Menu Queries ---
  public getMenuItems(): MenuItem[] {
    return [...this.menuItems];
  }

  public getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems.find((item) => item.id === id);
  }

  // --- Table Queries & Mutations ---
  public getTables(): Table[] {
    return Array.from(this.tables.values()).sort((a, b) => a.number - b.number);
  }

  public getTableById(id: string): Table | undefined {
    const formattedId = id.padStart(2, '0');
    return this.tables.get(formattedId) || this.tables.get(id);
  }

  public setTableStatus(tableId: string, status: TableStatus): Table | undefined {
    const table = this.getTableById(tableId);
    if (!table) return undefined;
    table.status = status;
    this.tables.set(table.id, table);
    this.persist();
    this.broadcast('TABLE_UPDATED', table);
    return table;
  }

  // --- Orders ---
  public getAllOrders(): Order[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  public getOrdersByTableId(tableId: string): Order[] {
    const formattedId = tableId.padStart(2, '0');
    return Array.from(this.orders.values())
      .filter((o) => o.tableId === tableId || o.tableId === formattedId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(input: {
    tableId: string;
    items: Array<{
      menuItemId: string;
      name: string;
      category?: string;
      quantity: number;
      unitPrice: number;
      customization?: any;
      specialInstructions?: string;
    }>;
    specialNotes?: string;
  }): Order {
    const now = new Date();
    const formattedTableId = input.tableId.padStart(2, '0');

    this.orderCounter += 1;
    const orderId = `BB${this.orderCounter}`;

    // Map items and compute total prep time
    let maxPrepTime = 4;
    const items: OrderItem[] = input.items.map((item, idx) => {
      const catalogItem = this.getMenuItemById(item.menuItemId);
      const itemPrep = catalogItem?.preparationTime || 5;
      if (itemPrep > maxPrepTime) maxPrepTime = itemPrep;

      const extraPrice = item.customization?.extraPrice || 0;
      const effectiveUnitPrice = item.unitPrice + extraPrice;
      const totalPrice = effectiveUnitPrice * item.quantity;

      return {
        id: `item-${orderId}-${idx + 1}`,
        menuItemId: item.menuItemId,
        name: catalogItem?.name || item.name,
        category: (catalogItem?.category || item.category || 'Coffee') as any,
        quantity: item.quantity,
        unitPrice: effectiveUnitPrice,
        totalPrice,
        customization: item.customization,
        specialInstructions: item.specialInstructions,
        preparationTime: itemPrep,
      };
    });

    const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const total = subtotal + tax;

    // Prep time formula: max prep time of drinks + scale factor for batch
    const estimatedMinutes = Math.min(30, Math.round(maxPrepTime + Math.min(items.length * 1.5, 8)));
    const estimatedReadyTime = new Date(now.getTime() + estimatedMinutes * 60000).toISOString();

    const timestamp = now.toISOString();
    const displayTime = formatDisplayTime(now);

    const initialHistory: OrderStatusHistoryItem = {
      id: `hist-${orderId}-1`,
      orderId,
      status: 'NEW',
      timestamp,
      displayTime,
      note: 'Order placed by customer at table',
    };

    const newOrder: Order = {
      id: orderId,
      tableId: formattedTableId,
      items,
      subtotal,
      tax,
      total,
      status: 'NEW',
      createdAt: timestamp,
      createdAtDisplay: displayTime,
      estimatedPreparationMinutes: estimatedMinutes,
      estimatedReadyTime,
      specialNotes: input.specialNotes,
      statusHistory: [initialHistory],
    };

    this.orders.set(orderId, newOrder);

    // Update table status to OCCUPIED if available
    const table = this.getTableById(formattedTableId);
    if (table && table.status === 'AVAILABLE') {
      this.setTableStatus(formattedTableId, 'OCCUPIED');
    }

    this.persist();
    this.broadcast('ORDER_CREATED', newOrder);
    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order | undefined {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const now = new Date();
    const timestamp = now.toISOString();
    const displayTime = formatDisplayTime(now);

    order.status = newStatus;

    if (newStatus === 'ACCEPTED') {
      order.acceptedAt = timestamp;
    } else if (newStatus === 'PREPARING') {
      order.preparingAt = timestamp;
      this.setTableStatus(order.tableId, 'PREPARING');
    } else if (newStatus === 'READY') {
      order.readyAt = timestamp;
      // Calculate preparation duration if preparingAt exists
      if (order.preparingAt) {
        const start = new Date(order.preparingAt).getTime();
        order.preparationDurationSeconds = Math.max(1, Math.round((now.getTime() - start) / 1000));
      } else {
        // Fallback estimated duration
        order.preparationDurationSeconds = order.estimatedPreparationMinutes * 60;
      }
      this.setTableStatus(order.tableId, 'READY');
    } else if (newStatus === 'SERVED') {
      order.servedAt = timestamp;
      // Check if table has other active orders; if not, return table to AVAILABLE or keep OCCUPIED until closed
      const otherActiveOrders = this.getOrdersByTableId(order.tableId).filter(
        (o) => o.id !== orderId && ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
      );
      if (otherActiveOrders.length === 0) {
        this.setTableStatus(order.tableId, 'AVAILABLE');
      }
    } else if (newStatus === 'CANCELLED') {
      order.cancelledAt = timestamp;
      const otherActiveOrders = this.getOrdersByTableId(order.tableId).filter(
        (o) => o.id !== orderId && ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
      );
      if (otherActiveOrders.length === 0) {
        this.setTableStatus(order.tableId, 'AVAILABLE');
      }
    }

    const historyItem: OrderStatusHistoryItem = {
      id: `hist-${orderId}-${order.statusHistory.length + 1}`,
      orderId,
      status: newStatus,
      timestamp,
      displayTime,
      note: note || `Status updated to ${newStatus}`,
    };

    order.statusHistory.push(historyItem);
    this.orders.set(orderId, order);

    this.persist();
    this.broadcast('ORDER_UPDATED', order);
    return order;
  }

  // --- Staff Requests ---
  public createStaffRequest(input: {
    tableId: string;
    reason: 'assistance' | 'water' | 'bill' | 'other';
    details?: string;
  }): StaffRequest {
    const now = new Date();
    const formattedTableId = input.tableId.padStart(2, '0');
    const id = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const req: StaffRequest = {
      id,
      tableId: formattedTableId,
      reason: input.reason,
      details: input.details,
      status: 'PENDING',
      createdAt: now.toISOString(),
      createdAtDisplay: formatDisplayTime(now),
    };

    this.staffRequests.set(id, req);
    this.persist();
    this.broadcast('STAFF_REQUEST_CREATED', req);
    return req;
  }

  public getStaffRequests(): StaffRequest[] {
    return Array.from(this.staffRequests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public handleStaffRequest(id: string): StaffRequest | undefined {
    const req = this.staffRequests.get(id);
    if (!req) return undefined;
    req.status = 'HANDLED';
    req.handledAt = new Date().toISOString();
    this.staffRequests.set(id, req);
    this.persist();
    this.broadcast('STAFF_REQUEST_UPDATED', req);
    return req;
  }

  // --- Bill Requests ---
  public createBillRequest(input: { tableId: string; orderId?: string }): BillRequest {
    const now = new Date();
    const formattedTableId = input.tableId.padStart(2, '0');
    const id = `bill-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Sum active/unsettled orders for this table
    const tableOrders = this.getOrdersByTableId(formattedTableId).filter((o) => o.status !== 'CANCELLED');
    let subtotal = 0;
    let tax = 0;
    let total = 0;

    if (input.orderId && this.orders.has(input.orderId)) {
      const order = this.orders.get(input.orderId)!;
      subtotal = order.subtotal;
      tax = order.tax;
      total = order.total;
    } else if (tableOrders.length > 0) {
      subtotal = tableOrders.reduce((sum, o) => sum + o.subtotal, 0);
      tax = tableOrders.reduce((sum, o) => sum + o.tax, 0);
      total = tableOrders.reduce((sum, o) => sum + o.total, 0);
    } else {
      subtotal = 350;
      tax = 17.5;
      total = 367.5;
    }

    const billReq: BillRequest = {
      id,
      tableId: formattedTableId,
      orderId: input.orderId || (tableOrders[0]?.id ?? null),
      subtotal,
      tax,
      total,
      status: 'PENDING',
      createdAt: now.toISOString(),
      createdAtDisplay: formatDisplayTime(now),
    };

    this.billRequests.set(id, billReq);
    this.setTableStatus(formattedTableId, 'BILL_REQUESTED');
    this.persist();
    this.broadcast('BILL_REQUEST_CREATED', billReq);
    return billReq;
  }

  public getBillRequests(): BillRequest[] {
    return Array.from(this.billRequests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public handleBillRequest(id: string, status: 'PREPARED' | 'SETTLED'): BillRequest | undefined {
    const bill = this.billRequests.get(id);
    if (!bill) return undefined;
    bill.status = status;
    bill.handledAt = new Date().toISOString();
    this.billRequests.set(id, bill);

    if (status === 'SETTLED') {
      this.setTableStatus(bill.tableId, 'AVAILABLE');
    }

    this.persist();
    this.broadcast('BILL_REQUEST_UPDATED', bill);
    return bill;
  }

  // --- Analytics ---
  public getAnalytics() {
    const orders = Array.from(this.orders.values());
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');

    const totalOrders = orders.length;
    const demoRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

    // Average prep duration (in minutes) for orders with measured prep duration
    const ordersWithPrepDuration = validOrders.filter(
      (o) => typeof o.preparationDurationSeconds === 'number' && o.preparationDurationSeconds > 0
    );

    const avgPrepMinutes =
      ordersWithPrepDuration.length > 0
        ? Math.round(
            (ordersWithPrepDuration.reduce((sum, o) => sum + (o.preparationDurationSeconds || 0), 0) /
              ordersWithPrepDuration.length /
              60) *
              10
          ) / 10
        : 6.5;

    // Popular items calculation
    const itemCounts: Record<string, { name: string; count: number; category: string }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            name: item.name,
            count: 0,
            category: item.category || 'Coffee',
          };
        }
        itemCounts[item.menuItemId].count += item.quantity;
      }
    }

    const popularList = Object.entries(itemCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);

    const mostPopularItem = popularList[0]?.name || 'Velvet Cappuccino';

    const tables = Array.from(this.tables.values());
    const occupiedTables = tables.filter((t) => t.status !== 'AVAILABLE').length;

    // Status breakdown
    const statusCounts: Record<OrderStatus, number> = {
      NEW: 0,
      ACCEPTED: 0,
      PREPARING: 0,
      READY: 0,
      SERVED: 0,
      CANCELLED: 0,
    };
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        const cat = item.category || 'Coffee';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + item.quantity;
      }
    }

    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      totalOrders,
      demoRevenue: Math.round(demoRevenue),
      averagePreparationMinutes: avgPrepMinutes,
      popularItem: mostPopularItem,
      popularList: popularList.slice(0, 5),
      activeTables: occupiedTables,
      totalTables: tables.length,
      statusCounts,
      categoryDistribution,
      pendingStaffRequests: Array.from(this.staffRequests.values()).filter((r) => r.status === 'PENDING').length,
      pendingBillRequests: Array.from(this.billRequests.values()).filter((b) => b.status === 'PENDING').length,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const store = new CafeStore();
