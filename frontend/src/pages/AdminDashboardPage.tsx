import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Clock,
  TrendingUp,
  DollarSign,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Bell,
  Receipt,
  Users,
  Play,
  Check,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getOrders,
  updateOrderStatus,
  getAnalytics,
  getStaffRequests,
  handleStaffRequest,
  getBillRequests,
  updateBillStatus,
} from '../services/api.js';
import type { Order, AnalyticsData, StaffRequest, BillRequest, OrderStatus } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { useEvents } from '../context/EventsContext.js';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const { subscribe } = useEvents();

  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);
  const [billRequests, setBillRequests] = useState<BillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadAll = async () => {
    try {
      const [ordersRes, analyticsRes, staffRes, billsRes] = await Promise.all([
        getOrders(),
        getAnalytics(),
        getStaffRequests(),
        getBillRequests(),
      ]);
      setOrders(ordersRes.orders);
      setAnalytics(analyticsRes);
      setStaffRequests(staffRes.requests);
      setBillRequests(billsRes.bills);
    } catch (e) {
      console.error('[Dashboard Error]:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    const unsub = subscribe(() => {
      loadAll();
    });
    const interval = setInterval(loadAll, 8000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus, note?: string) => {
    try {
      await updateOrderStatus(orderId, nextStatus, note);
      showToast(`Order #${orderId} marked as ${nextStatus}`, 'success');
      loadAll();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleHandleStaff = async (id: string) => {
    try {
      await handleStaffRequest(id);
      showToast('Staff request marked as handled', 'success');
      loadAll();
    } catch (e: any) {
      showToast(e.message || 'Error', 'error');
    }
  };

  const handleHandleBill = async (id: string, status: 'PREPARED' | 'SETTLED') => {
    try {
      await updateBillStatus(id, status);
      showToast(`Bill marked as ${status}`, 'success');
      loadAll();
    } catch (e: any) {
      showToast(e.message || 'Error', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const pieColors = ['#B77B4B', '#284C42', '#D97706', '#059669', '#7C3AED', '#DC2626'];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Top Banner */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B77B4B]/10 text-[#B77B4B] text-xs font-semibold mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Staff & Management Operations</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)]">
              Café Operations Dashboard
            </h1>
          </div>

          <button
            onClick={loadAll}
            className="px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#B77B4B]" />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* TOP STATS CARDS */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Orders</span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] mt-1">
                {analytics.totalOrders}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Live demo count</span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Demo Revenue</span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#B77B4B] mt-1">
                ₹{analytics.demoRevenue}
              </p>
              <span className="text-[11px] text-[var(--text-secondary)] block mt-1">Non-cancelled orders</span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Avg. Prep Time</span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] mt-1">
                {analytics.averagePreparationMinutes}m
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Stopwatch measured</span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Active Tables</span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#284C42] dark:text-[#86EFAC] mt-1">
                {analytics.activeTables}/{analytics.totalTables}
              </p>
              <span className="text-[11px] text-[var(--text-secondary)] block mt-1">Currently occupied</span>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] col-span-2 lg:col-span-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Popular Drink</span>
              <p className="text-lg font-serif font-bold text-[var(--text-primary)] mt-1 truncate">
                {analytics.popularItem}
              </p>
              <span className="text-[11px] text-[#B77B4B] font-semibold block mt-1">Highest frequency</span>
            </div>
          </div>
        )}

        {/* STAFF & BILL REQUESTS ALERTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Staff Calls */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-serif font-bold">Customer Table Calls</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600">
                {staffRequests.filter((r) => r.status === 'PENDING').length} Pending
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {staffRequests.filter((r) => r.status === 'PENDING').length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] py-6 text-center">
                  No active customer assistance requests.
                </p>
              ) : (
                staffRequests
                  .filter((r) => r.status === 'PENDING')
                  .map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600">Table {req.tableId}</span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-[10px] capitalize font-medium">
                            {req.reason}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)]">{req.createdAtDisplay}</span>
                        </div>
                        {req.details && <p className="text-xs text-[var(--text-secondary)] mt-1">{req.details}</p>}
                      </div>

                      <button
                        onClick={() => handleHandleStaff(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shrink-0"
                      >
                        Mark Handled
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Active Bill Requests */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-serif font-bold">Bill & Settlement Requests</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600">
                {billRequests.filter((b) => b.status === 'PENDING').length} Pending
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {billRequests.filter((b) => b.status === 'PENDING').length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] py-6 text-center">
                  No active bill requests.
                </p>
              ) : (
                billRequests
                  .filter((b) => b.status === 'PENDING')
                  .map((bill) => (
                    <div
                      key={bill.id}
                      className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-600">Table {bill.tableId}</span>
                          <span className="font-serif font-bold text-[var(--text-primary)]">₹{bill.total}</span>
                          <span className="text-[10px] text-[var(--text-secondary)]">{bill.createdAtDisplay}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Order #{bill.orderId || 'Active'}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleHandleBill(bill.id, 'PREPARED')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shrink-0"
                        >
                          Bill Prepared
                        </button>
                        <button
                          onClick={() => handleHandleBill(bill.id, 'SETTLED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shrink-0"
                        >
                          Settle Table
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* LIVE ORDER BOARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl font-serif font-bold">Live Order Dispatch Board</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Manage tickets through full preparation lifecycle: Accept → Prepare → Ready → Serve.
              </p>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {['ALL', 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    filterStatus === st
                      ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white border-transparent'
                      : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Order Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const isNew = order.status === 'NEW';
              const isAccepted = order.status === 'ACCEPTED';
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY';
              const isServed = order.status === 'SERVED';

              return (
                <div
                  key={order.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isReady
                      ? 'bg-purple-500/5 border-purple-500/40'
                      : isPreparing
                      ? 'bg-amber-500/5 border-amber-500/40'
                      : isNew
                      ? 'bg-blue-500/5 border-blue-500/40 ring-1 ring-blue-500/20'
                      : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-serif font-bold text-[#B77B4B]">
                          #{order.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#284C42]/10 text-[#284C42] dark:text-[#86EFAC]">
                          Table {order.tableId}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isReady
                            ? 'bg-purple-600 text-white'
                            : isPreparing
                            ? 'bg-amber-600 text-white'
                            : isNew
                            ? 'bg-blue-600 text-white'
                            : isServed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-600 text-white'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="py-3 space-y-1.5 text-xs">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span className="font-semibold">
                            {it.quantity} × {it.name}
                          </span>
                          <span className="text-[var(--text-secondary)]">₹{it.totalPrice}</span>
                        </div>
                      ))}
                      {order.specialNotes && (
                        <p className="text-[11px] text-amber-600 italic pt-1">
                          Note: "{order.specialNotes}"
                        </p>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="pt-2 border-t border-[var(--border-color)] flex justify-between text-[11px] text-[var(--text-secondary)]">
                      <span>Placed: {order.createdAtDisplay}</span>
                      <span className="font-bold text-[var(--text-primary)]">Total: ₹{order.total}</span>
                    </div>
                  </div>

                  {/* Actions according to Section 23 lifecycle */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                    {isNew && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ACCEPTED', 'Accepted by barista')}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING', 'Brewing started')}
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY', 'Drinks placed at pickup counter')}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5 animate-pulse"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED', 'Delivered to table')}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Served</span>
                      </button>
                    )}

                    {isServed && (
                      <span className="block text-center text-xs text-emerald-600 font-semibold py-1">
                        ✓ Completed & Delivered
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ANALYTICS CHARTS SECTION */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <h3 className="text-base font-serif font-bold mb-4">Category Volume Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <h3 className="text-base font-serif font-bold mb-4">Top 5 Popular Menu Items</h3>
              <div className="space-y-3">
                {analytics.popularList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#B77B4B] text-white flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#B77B4B]">{item.count} ordered</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
