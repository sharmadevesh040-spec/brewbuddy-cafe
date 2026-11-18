import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Bell,
  Receipt,
  ArrowLeft,
  Coffee,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  ChefHat,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getOrder, callStaff, requestBill } from '../services/api.js';
import type { Order, OrderStatus } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { useEvents } from '../context/EventsContext.js';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { subscribe } = useEvents();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const loadOrder = async () => {
    if (!orderId) return;
    try {
      const data = await getOrder(orderId);
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // Real-time synchronization via Server-Sent Events
  useEffect(() => {
    const unsub = subscribe((event) => {
      if (event.type === 'ORDER_UPDATED' && (event.payload as Order)?.id === orderId) {
        setOrder(event.payload as Order);
      }
    });

    // Also fallback interval check every 6s
    const interval = setInterval(loadOrder, 6000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [orderId]);

  // Live timer for PREPARING status
  useEffect(() => {
    let timer: any = null;
    if (order && order.status === 'PREPARING' && order.preparingAt) {
      const startTime = new Date(order.preparingAt).getTime();
      const updateElapsed = () => {
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
      };
      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [order?.status, order?.preparingAt]);

  const handleCallStaff = async () => {
    if (!order) return;
    try {
      await callStaff({ tableId: order.tableId, reason: 'assistance' });
      showToast(`Staff notified for Table ${order.tableId}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error calling staff', 'error');
    }
  };

  const handleRequestBill = async () => {
    if (!order) return;
    try {
      await requestBill({ tableId: order.tableId, orderId: order.id });
      showToast(`Bill requested for Order #${order.id}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error requesting bill', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-[#B77B4B] mx-auto animate-spin" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Connecting to live kitchen feed for Order #{orderId}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold">Order Not Found</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5">
            Could not find an order with identifier "#{orderId}".
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#B77B4B] text-white text-xs font-semibold"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Status step progression
  const steps: Array<{ status: OrderStatus; label: string; desc: string }> = [
    { status: 'NEW', label: 'Order Placed', desc: 'Dispatched to kitchen display' },
    { status: 'ACCEPTED', label: 'Order Accepted', desc: 'Barista queued ticket' },
    { status: 'PREPARING', label: 'Preparing', desc: 'Grinding beans & crafting drinks' },
    { status: 'READY', label: 'Order Ready', desc: 'Ready for table delivery' },
    { status: 'SERVED', label: 'Served', desc: 'Delivered to your table' },
  ];

  const statusOrder: Record<OrderStatus, number> = {
    NEW: 0,
    ACCEPTED: 1,
    PREPARING: 2,
    READY: 3,
    SERVED: 4,
    CANCELLED: -1,
  };

  const currentStepIndex = statusOrder[order.status];

  // Helper to find exact recorded timestamp for each status in history
  const getTimestampForStatus = (st: OrderStatus) => {
    const record = order.statusHistory.find((h) => h.status === st);
    return record?.displayTime || null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header Banner */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={`/table/${order.tableId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[#B77B4B] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Table {order.tableId} Hub</span>
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)]">
                  Order #{order.id}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#284C42]/10 text-[#284C42] dark:bg-[#284C42]/30 dark:text-[#86EFAC] border border-[#284C42]/20">
                  Table {order.tableId}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Placed at <span className="font-semibold text-[var(--text-primary)]">{order.createdAtDisplay}</span> • Total Demo: <span className="font-serif font-bold text-[#B77B4B]">₹{order.total}</span>
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm ${
                  order.status === 'READY'
                    ? 'bg-purple-600 text-white animate-bounce'
                    : order.status === 'PREPARING'
                    ? 'bg-amber-600 text-white'
                    : order.status === 'SERVED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2A201C] text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>{order.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* ETA & PREPARATION TIMER CARD */}
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B77B4B] block">
                Preparation Progress
              </span>
              <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mt-0.5">
                {order.status === 'SERVED'
                  ? 'Order Delivered!'
                  : order.status === 'READY'
                  ? 'Your Order is Ready!'
                  : order.status === 'PREPARING'
                  ? 'Barista is actively brewing'
                  : 'Queued in Kitchen'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Estimated preparation: <strong className="text-[var(--text-primary)]">{order.estimatedPreparationMinutes} minutes</strong>. Real-time timestamps are recorded at every stage.
              </p>
            </div>

            {/* Right Timer or Estimated Time */}
            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between sm:justify-end gap-4">
              {order.status === 'PREPARING' ? (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                    Preparation Stopwatch
                  </span>
                  <p className="text-3xl font-mono font-bold text-amber-600 tracking-wider">
                    {formatTimer(elapsedSeconds)}
                  </p>
                </div>
              ) : order.preparationDurationSeconds ? (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                    Total Preparation Time
                  </span>
                  <p className="text-2xl font-mono font-bold text-emerald-600">
                    {formatTimer(order.preparationDurationSeconds)}
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                    Estimated Ready Time
                  </span>
                  <p className="text-xl font-serif font-bold text-[#B77B4B]">
                    {new Intl.DateTimeFormat('en-IN', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    }).format(new Date(order.estimatedReadyTime))}
                  </p>
                </div>
              )}
              <Clock className="w-8 h-8 text-[#B77B4B] shrink-0 opacity-80" />
            </div>
          </div>
        </div>

        {/* TIMELINE WITH EXACT TIMESTAMPS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm">
          <h3 className="text-lg font-serif font-bold mb-6">Order Status Timeline</h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-[var(--border-color)]">
            {steps.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              const timestamp = getTimestampForStatus(step.status);

              return (
                <div key={step.status} className="relative flex items-start justify-between gap-4">
                  {/* Step Dot Icon */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isPast
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#B77B4B] border-[#B77B4B] text-white shadow-md ring-4 ring-[#B77B4B]/20 animate-pulse'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : <span className="text-[11px] font-bold">{idx + 1}</span>}
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-serif font-bold ${
                        isCurrent
                          ? 'text-[#B77B4B]'
                          : isPast
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{step.desc}</p>
                  </div>

                  {/* Exact Timestamp Display */}
                  <div className="text-right shrink-0">
                    {timestamp ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]">
                        {timestamp}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-secondary)] opacity-60">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDER ITEMS SUMMARY */}
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm space-y-4">
          <h3 className="text-base font-serif font-bold pb-2 border-b border-[var(--border-color)]">
            Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </h3>

          <div className="divide-y divide-[var(--border-color)]">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[var(--text-primary)]">
                    {item.quantity} × {item.name}
                  </span>
                  {item.customization && (
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {item.customization.size && `${item.customization.size} • `}
                      {item.customization.milk && `${item.customization.milk} • `}
                      {item.customization.extras?.join(', ')}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-[11px] text-amber-600 mt-0.5 italic">
                      "{item.specialInstructions}"
                    </p>
                  )}
                </div>
                <span className="font-serif font-bold text-[var(--text-primary)]">
                  ₹{item.totalPrice}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex justify-between text-sm font-serif font-bold">
            <span>Total Paid (Demo)</span>
            <span className="text-[#B77B4B]">₹{order.total}</span>
          </div>
        </div>

        {/* ACTIONS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleCallStaff}
            className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Bell className="w-4 h-4 text-rose-500" />
            <span>Call Staff</span>
          </button>

          <button
            onClick={handleRequestBill}
            className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Receipt className="w-4 h-4 text-indigo-500" />
            <span>Request Bill</span>
          </button>

          <Link
            to="/menu"
            className="p-3.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Coffee className="w-4 h-4" />
            <span>Order More</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
