import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  Play,
  CheckCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/api.js';
import type { Order, OrderStatus } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { useEvents } from '../context/EventsContext.js';

export const KitchenKDSPage: React.FC = () => {
  const { showToast } = useToast();
  const { subscribe } = useEvents();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Web Audio Chime synthesizer for new tickets
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext blocked until interaction
    }
  };

  useEffect(() => {
    const unsub = subscribe((event) => {
      if (event.type === 'ORDER_CREATED') {
        playChime();
        showToast(`🔔 New kitchen ticket from Table ${(event.payload as any)?.tableId}!`, 'info');
      }
      loadOrders();
    });
    return unsub;
  }, [soundEnabled]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus, note?: string) => {
    try {
      await updateOrderStatus(orderId, nextStatus, note);
      showToast(`Order #${orderId} -> ${nextStatus}`, 'success');
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  const newOrders = orders.filter((o) => o.status === 'NEW' || o.status === 'ACCEPTED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const computeElapsedSeconds = (order: Order) => {
    if (order.preparingAt) {
      const start = new Date(order.preparingAt).getTime();
      return Math.max(0, Math.floor((currentTime.getTime() - start) / 1000));
    }
    return 0;
  };

  const formatStopwatch = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#14100E] text-[#F7F3ED] p-4 sm:p-6 lg:p-8 flex flex-col">
      {/* KDS Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#382D27] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B77B4B] flex items-center justify-center text-white shadow-lg">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                Kitchen Display System (KDS)
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-[#86EFAC] animate-ping" />
            </div>
            <p className="text-xs text-[#C8BCB1]">
              Live Station Dispatch • High Contrast Kitchen Scanning • Elapsed Timers
            </p>
          </div>
        </div>

        {/* Right Station Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-[#284C42] border-[#386457] text-[#86EFAC]'
                : 'bg-[#221B18] border-[#382D27] text-neutral-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-[#221B18] border border-[#382D27] text-neutral-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="font-mono text-xl font-bold text-[#B77B4B] bg-[#221B18] px-3.5 py-1.5 rounded-xl border border-[#382D27]">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* 3 KITCHEN COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 mt-6">
        {/* COLUMN 1: NEW / QUEUED */}
        <div className="bg-[#1C1613] rounded-3xl border border-[#382D27] p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#382D27] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-base font-serif font-bold tracking-wide">1. NEW TICKETS</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {newOrders.length === 0 ? (
              <p className="text-xs text-[#8A7C73] py-12 text-center">No new tickets in queue.</p>
            ) : (
              newOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-[#251D19] border-2 border-blue-500/40 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#382D27]">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-bold text-[#B77B4B]">#{order.id}</span>
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#284C42] text-white">
                        TABLE {order.tableId}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#C8BCB1]">{order.createdAtDisplay}</span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 py-1 text-sm">
                    {order.items.map((it) => (
                      <div key={it.id} className="bg-[#1C1613] p-2.5 rounded-xl border border-[#382D27]">
                        <div className="flex justify-between font-bold text-white text-base">
                          <span>{it.quantity} × {it.name}</span>
                          <span className="text-xs text-[#B77B4B] font-mono">~{it.preparationTime}m</span>
                        </div>
                        {it.customization && (
                          <p className="text-xs text-amber-300 font-medium mt-1">
                            {it.customization.size && `${it.customization.size} • `}
                            {it.customization.milk && `${it.customization.milk} • `}
                            {it.customization.extras?.join(', ')}
                          </p>
                        )}
                        {it.specialInstructions && (
                          <p className="text-xs text-rose-300 italic mt-0.5">"{it.specialInstructions}"</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.specialNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                      ⚠️ Note: {order.specialNotes}
                    </div>
                  )}

                  {/* Button: Start */}
                  <button
                    onClick={() => handleStatusChange(order.id, 'PREPARING', 'Started in KDS')}
                    className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>START PREPARATION</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING (ACTIVE TIMERS) */}
        <div className="bg-[#1C1613] rounded-3xl border border-[#382D27] p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#382D27] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-serif font-bold tracking-wide">2. PREPARING</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {preparingOrders.length === 0 ? (
              <p className="text-xs text-[#8A7C73] py-12 text-center">No active drinks being prepared.</p>
            ) : (
              preparingOrders.map((order) => {
                const elapsed = computeElapsedSeconds(order);
                const isOverdue = elapsed > order.estimatedPreparationMinutes * 60;

                return (
                  <div
                    key={order.id}
                    className={`p-5 rounded-2xl bg-[#251D19] border-2 shadow-lg space-y-3 ${
                      isOverdue
                        ? 'border-rose-500 ring-2 ring-rose-500/30'
                        : elapsed > 300
                        ? 'border-amber-500'
                        : 'border-[#382D27]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#382D27]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-mono font-bold text-[#B77B4B]">#{order.id}</span>
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#284C42] text-white">
                          TABLE {order.tableId}
                        </span>
                      </div>

                      {/* STOPWATCH BADGE */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-sm font-bold ${
                          isOverdue
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>{formatStopwatch(elapsed)}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 py-1 text-sm">
                      {order.items.map((it) => (
                        <div key={it.id} className="bg-[#1C1613] p-2.5 rounded-xl border border-[#382D27]">
                          <div className="font-bold text-white text-base">
                            {it.quantity} × {it.name}
                          </div>
                          {it.customization && (
                            <p className="text-xs text-amber-300 font-medium mt-1">
                              {it.customization.size && `${it.customization.size} • `}
                              {it.customization.milk && `${it.customization.milk} • `}
                              {it.customization.extras?.join(', ')}
                            </p>
                          )}
                          {it.specialInstructions && (
                            <p className="text-xs text-rose-300 italic mt-0.5">"{it.specialInstructions}"</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Button: Mark Ready */}
                    <button
                      onClick={() => handleStatusChange(order.id, 'READY', 'Finished brewing')}
                      className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <CheckCheck className="w-5 h-5" />
                      <span>MARK READY FOR SERVE</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR SERVING */}
        <div className="bg-[#1C1613] rounded-3xl border border-[#382D27] p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#382D27] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
              <h2 className="text-base font-serif font-bold tracking-wide">3. READY FOR PICKUP</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-[#8A7C73] py-12 text-center">No orders awaiting pickup.</p>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-[#251D19] border-2 border-purple-500/50 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#382D27]">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-bold text-purple-400">#{order.id}</span>
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-600 text-white animate-pulse">
                        DELIVER TO TABLE {order.tableId}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#C8BCB1] space-y-1">
                    {order.items.map((it) => (
                      <div key={it.id} className="flex justify-between">
                        <span>{it.quantity} × {it.name}</span>
                      </div>
                    ))}
                    {order.preparationDurationSeconds && (
                      <p className="text-[11px] text-emerald-400 pt-1 font-mono">
                        Prep Time: {formatStopwatch(order.preparationDurationSeconds)}
                      </p>
                    )}
                  </div>

                  {/* Button: Mark Served */}
                  <button
                    onClick={() => handleStatusChange(order.id, 'SERVED', 'Delivered to table')}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>MARK SERVED / DELIVERED</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
