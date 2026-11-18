export type Category = 'Coffee' | 'Tea' | 'Coolers' | 'Snacks' | 'Desserts' | 'Specials';

export type CaffeineLevel = 'high' | 'medium' | 'low' | 'none';

export type Temperature = 'hot' | 'cold' | 'room';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  image: string;
  dietaryTags: string[];
  allergens: string[];
  caffeine: CaffeineLevel;
  temperature: Temperature;
  ingredients: string[];
  preparationTime: number;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'PREPARING' | 'READY' | 'BILL_REQUESTED';

export interface Table {
  id: string;
  number: number;
  name: string;
  section: string;
  capacity: number;
  status: TableStatus;
}

export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderCustomization {
  base?: string;
  milk?: string;
  temperature?: string;
  sweetness?: string;
  size?: string;
  extras?: string[];
  extraPrice?: number;
}

export interface OrderItem {
  id?: string;
  menuItemId: string;
  name: string;
  category?: Category;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: OrderCustomization;
  specialInstructions?: string;
  preparationTime: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  displayTime: string;
  note?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  createdAtDisplay: string;
  acceptedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  servedAt?: string | null;
  cancelledAt?: string | null;
  estimatedPreparationMinutes: number;
  estimatedReadyTime: string;
  preparationDurationSeconds?: number | null;
  specialNotes?: string;
  statusHistory: OrderStatusHistoryItem[];
}

export interface StaffRequest {
  id: string;
  tableId: string;
  reason: 'assistance' | 'water' | 'bill' | 'other';
  details?: string;
  status: 'PENDING' | 'HANDLED';
  createdAt: string;
  createdAtDisplay: string;
  handledAt?: string | null;
}

export interface BillRequest {
  id: string;
  tableId: string;
  orderId?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'PREPARED' | 'SETTLED';
  createdAt: string;
  createdAtDisplay: string;
  handledAt?: string | null;
}

export interface RecommendationRequest {
  message?: string;
  maxBudget?: number;
  temperature?: 'hot' | 'cold' | 'all';
  coffeePreference?: 'coffee' | 'non-coffee' | 'any';
  vegan?: boolean;
  dairyFree?: boolean;
  glutenFree?: boolean;
  allergenExclusions?: string[];
  caffeinePreference?: 'high' | 'medium' | 'low' | 'none' | 'any';
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface ValidatedRecommendation {
  id: string;
  item: MenuItem;
  reason: string;
}

export interface RecommendationResponse {
  recommendations: ValidatedRecommendation[];
  greeting: string;
  disclaimer: string;
  modelUsed: string;
  provider: 'gemini-api' | 'grounded-engine';
  rejectedHallucinations?: string[];
  filterStats: {
    totalCatalogItems: number;
    eligibleItemsCount: number;
  };
}

export interface AnalyticsData {
  totalOrders: number;
  demoRevenue: number;
  averagePreparationMinutes: number;
  popularItem: string;
  popularList: Array<{ id: string; name: string; count: number; category: string }>;
  activeTables: number;
  totalTables: number;
  statusCounts: Record<OrderStatus, number>;
  categoryDistribution: Array<{ name: string; value: number }>;
  pendingStaffRequests: number;
  pendingBillRequests: number;
  generatedAt: string;
}
