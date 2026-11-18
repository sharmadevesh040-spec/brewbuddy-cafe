import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Coffee,
  Sparkles,
  ShoppingBag,
  Bell,
  Receipt,
  UtensilsCrossed,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Droplets,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTableDetails, callStaff, requestBill } from '../services/api.js';
import type { Table, Order } from '../types/index.js';
import { useTable } from '../context/TableContext.js';
import { useToast } from '../context/ToastContext.js';
import { useEvents } from '../context/EventsContext.js';

export const TablePage: React.FC = () => {
  const { tableId: paramTableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { setTableId } = useTable();
  const { showToast } = useToast();
  const { subscribe } = useEvents();

  const formattedTableId = (paramTableId || '').padStart(2, '0');

  const [table, setTable] = useState<Table | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffReason, setStaffReason] = useState<'assistance' | 'water' | 'bill' | 'other'>('assistance');
  const [staffDetails, setStaffDetails] = useState('');
  const [submittingStaff, setSubmittingStaff] = useState(false);

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [submittingBill, setSubmittingBill] = useState(false);

  // Sync table ID with session storage and TableContext
  useEffect(() => {
    if (paramTableId) {
      setTableId(formattedTableId);
    }
  }, [paramTableId, formattedTableId, setTableId]);

  const loadData = async () => {
    try {
      const data = await getTableDetails(formattedTableId);
      setTable(data.table);
      setActiveOrders(data.activeOrders);
      setSessionOrders(data.sessionOrders);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Table not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [formattedTableId]);

  // Subscribe to real-time events for this table
  useEffect(() => {
    const unsub = subscribe((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'TABLE_UPDATED' ||
        event.type === 'BILL_REQUEST_CREATED'
      ) {
        loadData();
      }
    });
    return unsub;
  }, [formattedTableId]);

  const handleCallStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStaff(true);
    try {
      await callStaff({
        tableId: formattedTableId,
        reason: staffReason,
        details: staffDetails || undefined,
      });
      showToast('Staff called! A barista is heading to your table.', 'success');
      setStaffModalOpen(false);
      setStaffDetails('');
    } catch (err: any) {
      showToast(err.message || 'Could not notify staff', 'error');
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleRequestBillSubmit = async () => {
    setSubmittingBill(true);
    try {
      await requestBill({
        tableId: formattedTableId,
        orderId: activeOrders[0]?.id,
      });
      showToast('Bill requested. Staff has been notified.', 'success');
      setBillModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Could not request bill', 'error');
    } finally {
      setSubmittingBill(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B77B4B]/10 text-[#B77B4B] mx-auto flex items-center justify-center animate-pulse">
            <Coffee className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[var(--text-secondary)]">Connecting to Table {formattedTableId}...</p>
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)]">Table Not Found</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            The table ID "{paramTableId}" is invalid or could not be recognized.
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#B77B4B] text-white text-xs font-semibold shadow hover:opacity-90"
          >
            Scan Another Table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Table Hero Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#284C42]/10 text-[#284C42] dark:bg-[#284C42]/30 dark:text-[#86EFAC] text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#284C42] dark:bg-[#86EFAC] animate-pulse" />
              <span>BREWBUDDY CAFÉ</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
              Table {table.id}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              You are ordering from <span className="font-semibold text-[var(--text-primary)]">Table {table.id}</span> ({table.section} • Capacity {table.capacity})
            </p>
          </div>

          {/* Table Status Badge */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                table.status === 'AVAILABLE'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : table.status === 'PREPARING'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                  : table.status === 'READY'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  : table.status === 'BILL_REQUESTED'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20'
              }`}
            >
              Status: {table.status.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">Session ID: #{formattedTableId}-live</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Core Ordering Hub Quick Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Link
            to="/menu"
            className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#B77B4B]/10 text-[#B77B4B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Coffee className="w-6 h-6" />
            </div>
            <span className="text-sm font-serif font-bold text-[var(--text-primary)]">Menu</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Explore catalog</span>
          </Link>

          <Link
            to="/ai-barista"
            className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B77B4B] to-[#9E6436] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-sm font-serif font-bold text-[var(--text-primary)]">AI Barista</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Smart suggestions</span>
          </Link>

          <Link
            to="/build"
            className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#284C42]/10 text-[#284C42] dark:text-[#86EFAC] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-sm font-serif font-bold text-[var(--text-primary)]">Build Drink</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Custom roasts</span>
          </Link>

          <Link
            to="/orders"
            className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-sm font-serif font-bold text-[var(--text-primary)]">My Order</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Live status</span>
          </Link>

          <button
            onClick={() => setStaffModalOpen(true)}
            className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-sm font-serif font-bold text-[var(--text-primary)]">Call Staff</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Need assistance</span>
          </button>

          <button
            onClick={() => setBillModalOpen(true)}
            className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-sm font-serif font-bold text-[var(--text-primary)]">Request Bill</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">Check total</span>
          </button>
        </div>

        {/* ACTIVE LIVE ORDERS FOR THIS TABLE */}
        {activeOrders.length > 0 && (
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B77B4B]" />
                <h2 className="text-lg font-serif font-bold">Active Orders at Table {table.id}</h2>
              </div>
              <span className="text-xs text-[var(--text-secondary)]">Real-time sync</span>
            </div>

            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#B77B4B] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-serif font-bold text-[#B77B4B]">#{order.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 uppercase">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Placed at {order.createdAtDisplay} • Est. Ready ~{order.estimatedPreparationMinutes}m
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-base font-serif font-bold text-[var(--text-primary)]">
                      ₹{order.total}
                    </span>
                    <span className="text-xs font-semibold text-[#B77B4B] flex items-center gap-1">
                      Track Live <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENT PAST ORDERS AT THIS TABLE */}
        {sessionOrders.length > 0 && activeOrders.length === 0 && (
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold">Session Order History</h2>
            <div className="space-y-2">
              {sessionOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#B77B4B]">#{order.id}</span> — {order.items.length} item(s)
                    <span className="text-[var(--text-secondary)] ml-2">({order.createdAtDisplay})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">₹{order.total}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold uppercase text-[10px]">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CALL STAFF MODAL */}
      <AnimatePresence>
        {staffModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-serif font-bold">Call Staff to Table {table.id}</h3>
                </div>
                <button
                  onClick={() => setStaffModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCallStaffSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2">
                    How can we assist you?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'assistance', label: 'Need Assistance', icon: HelpCircle },
                      { id: 'water', label: 'Need Water', icon: Droplets },
                      { id: 'bill', label: 'Request Bill', icon: Receipt },
                      { id: 'other', label: 'Other Inquiries', icon: Coffee },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setStaffReason(opt.id as any)}
                        className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                          staffReason === opt.id
                            ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]'
                        }`}
                      >
                        <opt.icon className="w-4 h-4 shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Special notes or instructions (optional):
                  </label>
                  <textarea
                    rows={2}
                    value={staffDetails}
                    onChange={(e) => setStaffDetails(e.target.value)}
                    placeholder="e.g. Warm water with lemon slices, extra napkins..."
                    className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[#B77B4B]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStaffModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStaff}
                    className="flex-1 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {submittingStaff ? 'Sending Alert...' : 'Call Barista'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* REQUEST BILL MODAL */}
      <AnimatePresence>
        {billModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)] text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold">Request Bill for Table {table.id}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Staff will prepare your summary and bring the bill to Table {table.id}. No real payment is processed in this demo.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setBillModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestBillSubmit}
                  disabled={submittingBill}
                  className="flex-1 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {submittingBill ? 'Requesting...' : 'Request Bill'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
