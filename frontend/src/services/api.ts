import type {
  MenuItem,
  Table,
  Order,
  OrderStatus,
  TableStatus,
  StaffRequest,
  BillRequest,
  RecommendationRequest,
  RecommendationResponse,
  AnalyticsData,
} from '../types/index.js';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      // fallback
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

// Menu APIs
export async function getMenu(params?: {
  category?: string;
  search?: string;
  dietary?: string;
  caffeine?: string;
  temperature?: string;
  maxPrice?: number;
}): Promise<{ count: number; items: MenuItem[] }> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.dietary) query.append('dietary', params.dietary);
  if (params?.caffeine) query.append('caffeine', params.caffeine);
  if (params?.temperature) query.append('temperature', params.temperature);
  if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString());

  const url = `${API_BASE}/menu${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function getMenuItem(id: string): Promise<MenuItem> {
  const res = await fetch(`${API_BASE}/menu/${id}`);
  return handleResponse(res);
}

// Table APIs
export async function getTables(): Promise<{ count: number; tables: Table[] }> {
  const res = await fetch(`${API_BASE}/tables`);
  return handleResponse(res);
}

export async function getTableDetails(
  id: string
): Promise<{ table: Table; activeOrders: Order[]; sessionOrders: Order[] }> {
  const res = await fetch(`${API_BASE}/tables/${id}`);
  return handleResponse(res);
}

export async function updateTableStatus(id: string, status: TableStatus): Promise<{ success: boolean; table: Table }> {
  const res = await fetch(`${API_BASE}/tables/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

// Order APIs
export async function createOrder(data: {
  tableId: string;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    customization?: any;
    specialInstructions?: string;
  }>;
  specialNotes?: string;
}): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getOrders(params?: { status?: string; tableId?: string }): Promise<{ count: number; orders: Order[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.tableId) query.append('tableId', params.tableId);

  const url = `${API_BASE}/orders${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  return handleResponse(res);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string
): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  return handleResponse(res);
}

// AI Barista API
export async function recommendItems(criteria: RecommendationRequest): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria),
  });
  return handleResponse(res);
}

// Staff & Bill APIs
export async function callStaff(data: {
  tableId: string;
  reason: 'assistance' | 'water' | 'bill' | 'other';
  details?: string;
}): Promise<{ success: boolean; request: StaffRequest }> {
  const res = await fetch(`${API_BASE}/staff-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getStaffRequests(): Promise<{ count: number; requests: StaffRequest[] }> {
  const res = await fetch(`${API_BASE}/staff-requests`);
  return handleResponse(res);
}

export async function handleStaffRequest(id: string): Promise<{ success: boolean; request: StaffRequest }> {
  const res = await fetch(`${API_BASE}/staff-requests/${id}/handled`, {
    method: 'PATCH',
  });
  return handleResponse(res);
}

export async function requestBill(data: {
  tableId: string;
  orderId?: string;
}): Promise<{ success: boolean; bill: BillRequest }> {
  const res = await fetch(`${API_BASE}/bill-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getBillRequests(): Promise<{ count: number; bills: BillRequest[] }> {
  const res = await fetch(`${API_BASE}/bill-requests`);
  return handleResponse(res);
}

export async function updateBillStatus(
  id: string,
  status: 'PREPARED' | 'SETTLED'
): Promise<{ success: boolean; bill: BillRequest }> {
  const res = await fetch(`${API_BASE}/bill-requests/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

// Analytics API
export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  return handleResponse(res);
}
