import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Coffee,
  AlertCircle,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.js';
import { useTable } from '../context/TableContext.js';
import { useToast } from '../context/ToastContext.js';
import { createOrder } from '../services/api.js';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal, tax, total } = useCart();
  const { tableId } = useTable();
  const { showToast } = useToast();

  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    if (!tableId) {
      showToast('Please scan or select your table number first!', 'warning');
      navigate('/scan');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        tableId,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          category: i.category,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          customization: i.customization,
          specialInstructions: i.specialInstructions,
        })),
        specialNotes: specialNotes || undefined,
      };

      const res = await createOrder(orderPayload);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B77B4B', '#284C42', '#F6F1E8'],
      });

      // Save order to customer session history in localStorage
      try {
        const existingHistory = JSON.parse(localStorage.getItem('bb_session_orders') || '[]');
        existingHistory.unshift({
          orderId: res.order.id,
          total: res.order.total,
          status: res.order.status,
          createdAtDisplay: res.order.createdAtDisplay,
          itemCount: items.length,
        });
        localStorage.setItem('bb_session_orders', JSON.stringify(existingHistory));
      } catch {
        // ignore
      }

      showToast(`Order #${res.order.id} placed for Table ${tableId}!`, 'success');
      clearCart();
      navigate(`/order/${res.order.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B77B4B]/10 text-[#B77B4B] text-xs font-semibold mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Current Session Cart</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
              Your Café Order
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="text-xs font-semibold text-[#B77B4B] hover:underline"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-secondary)]/50 p-8 max-w-lg mx-auto">
            <ShoppingBag className="w-14 h-14 text-[#B77B4B] mx-auto opacity-50 mb-3" />
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)]">Your cart is empty</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
              Explore our single-origin coffees, whole-leaf teas, and artisan pastries to begin your order.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/menu"
                className="px-6 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold hover:opacity-90 shadow"
              >
                Browse Menu
              </Link>
              <Link
                to="/ai-barista"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B77B4B] to-[#9E6436] text-white text-xs font-semibold shadow"
              >
                Ask AI Barista
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ITEMS LIST */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Items in Cart ({items.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#B77B4B]/10 text-[#B77B4B] flex items-center justify-center shrink-0">
                        <Coffee className="w-8 h-8" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-serif font-bold text-[var(--text-primary)]">
                        {item.name}
                      </h3>
                      {item.customization && (
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {item.customization.size && `${item.customization.size} • `}
                          {item.customization.milk && `${item.customization.milk} • `}
                          {item.customization.sweetness && `${item.customization.sweetness}`}
                        </p>
                      )}
                      <span className="text-xs font-bold text-[#B77B4B] mt-1 block">
                        ₹{item.unitPrice} each
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-serif font-bold text-[var(--text-primary)] min-w-[50px] text-right">
                      ₹{item.totalPrice}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Special Instructions Note */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Kitchen notes or dietary alerts:
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Extra hot, separate drink carriers, no ice in cooler..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs focus:outline-none focus:border-[#B77B4B]"
                />
              </div>
            </div>

            {/* ORDER SUMMARY & CHECKOUT */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl space-y-6">
                <h3 className="text-lg font-serif font-bold pb-3 border-b border-[var(--border-color)]">
                  Order Summary
                </h3>

                {/* Table assignment check */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-5 h-5 text-[#B77B4B]" />
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Table Assignment</span>
                      <p className="text-xs font-serif font-bold text-[var(--text-primary)]">
                        {tableId ? `Table ${tableId}` : 'Not Scanned Yet'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/scan')}
                    className="text-xs font-semibold text-[#B77B4B] hover:underline"
                  >
                    {tableId ? 'Change' : 'Scan'}
                  </button>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Taxes & GST (5%)</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                  <div className="pt-3 border-t border-[var(--border-color)] flex justify-between text-base font-serif font-bold text-[var(--text-primary)]">
                    <span>Total Demo Amount</span>
                    <span className="text-[#B77B4B]">₹{total}</span>
                  </div>
                </div>

                {/* Demo Ordering Disclaimer */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Demo ordering system</strong> — no real payment is processed. An actual order ID will be generated for kitchen dispatch.
                  </p>
                </div>

                {/* Place Order CTA */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting || items.length === 0}
                  className="w-full py-4 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {submitting ? (
                    <span>Dispatching Order...</span>
                  ) : (
                    <>
                      <span>Place Demo Order (₹{total})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
