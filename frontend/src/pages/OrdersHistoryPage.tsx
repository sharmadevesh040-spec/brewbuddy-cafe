import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, Coffee, QrCode } from 'lucide-react';
import { getOrders } from '../services/api.js';
import type { Order } from '../types/index.js';
import { useTable } from '../context/TableContext.js';

export const OrdersHistoryPage: React.FC = () => {
  const { tableId } = useTable();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessionOrders() {
      try {
        const data = await getOrders({ tableId: tableId || undefined });
        setOrders(data.orders);
      } catch (e) {
        console.error('Error fetching session orders:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSessionOrders();
  }, [tableId]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B77B4B]/10 text-[#B77B4B] text-xs font-semibold mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Current Session Orders</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)]">
              Your Table Orders
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              {tableId
                ? `Orders dispatched from Table ${tableId} during this café session.`
                : 'Showing recent orders across this demo session.'}
            </p>
          </div>

          <Link
            to="/menu"
            className="px-5 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold hover:opacity-90 shadow"
          >
            Browse Menu
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-[var(--bg-secondary)] animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-secondary)]/50 p-8 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-[#B77B4B] mx-auto opacity-50 mb-3" />
            <h2 className="text-lg font-serif font-bold">No orders placed yet</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Select items from the menu or build a customized drink to place your first table order.
            </p>
            <Link
              to="/menu"
              className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-[#B77B4B] text-white text-xs font-semibold"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-serif font-bold text-[#B77B4B]">
                      #{order.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                      Table {order.tableId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'SERVED'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : order.status === 'READY'
                          ? 'bg-purple-500/10 text-purple-600'
                          : order.status === 'PREPARING'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-neutral-500/10 text-neutral-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </p>

                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 flex items-center gap-1.5 opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>Ordered at {order.createdAtDisplay}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[var(--border-color)]">
                  <span className="text-lg font-serif font-bold text-[var(--text-primary)]">
                    ₹{order.total}
                  </span>

                  <Link
                    to={`/order/${order.id}`}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-xs font-semibold flex items-center gap-1 text-[#B77B4B] transition-colors"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
