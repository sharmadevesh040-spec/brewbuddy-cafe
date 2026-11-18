import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Coffee,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getTables, getTableDetails, updateTableStatus, updateOrderStatus } from '../services/api.js';
import type { Table, TableStatus, Order } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { useEvents } from '../context/EventsContext.js';

export const AdminTablesPage: React.FC = () => {
  const { showToast } = useToast();
  const { subscribe } = useEvents();

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Table Details Modal
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // QR Modal
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);

  const loadTables = async () => {
    try {
      const data = await getTables();
      setTables(data.tables);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    const unsub = subscribe(() => {
      loadTables();
    });
    return unsub;
  }, []);

  const openTableDetails = async (table: Table) => {
    setSelectedTable(table);
    setDetailsLoading(true);
    try {
      const data = await getTableDetails(table.id);
      setActiveOrders(data.activeOrders);
      setSessionOrders(data.sessionOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (tableId: string, newStatus: TableStatus) => {
    try {
      await updateTableStatus(tableId, newStatus);
      showToast(`Table ${tableId} status updated to ${newStatus}`, 'success');
      loadTables();
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable({ ...selectedTable, status: newStatus });
      }
    } catch (e: any) {
      showToast(e.message || 'Error updating table', 'error');
    }
  };

  const handleOrderAction = async (orderId: string, nextStatus: any) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      showToast(`Order #${orderId} marked as ${nextStatus}`, 'success');
      if (selectedTable) {
        openTableDetails(selectedTable);
      }
      loadTables();
    } catch (e: any) {
      showToast(e.message || 'Error updating order', 'error');
    }
  };

  const downloadSvg = (tableId: string) => {
    const svgElem = document.getElementById(`qr-svg-${tableId}`);
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `table-${tableId}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast(`Downloaded Table ${tableId} SVG QR`, 'success');
  };

  const downloadPng = (tableId: string) => {
    const svgElem = document.getElementById(`qr-svg-${tableId}`);
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = '#FFFCF7';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngFile;
        downloadLink.download = `table-${tableId}-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showToast(`Downloaded Table ${tableId} PNG QR`, 'success');
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const printTableQR = (table: Table) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const destinationUrl = `${window.location.origin}/table/${table.id}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>BrewBuddy Café — Table ${table.id} QR</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: #FFFCF7; color: #2A201C; }
            .card { border: 2px solid #B77B4B; border-radius: 20px; padding: 40px; max-width: 400px; margin: 0 auto; }
            h1 { font-family: serif; margin-bottom: 5px; color: #2A201C; }
            p { font-size: 14px; color: #666; margin-bottom: 25px; }
            .url { font-family: monospace; font-size: 11px; margin-top: 20px; color: #B77B4B; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>BrewBuddy Café</h1>
            <p>Scan to view menu & order directly from Table ${table.id}</p>
            <img src="${window.location.origin}/api/tables/${table.id}/qr?format=png" width="280" height="280" />
            <div class="url">${destinationUrl}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B77B4B]/10 text-[#B77B4B] text-xs font-semibold mb-2">
              <QrCode className="w-3.5 h-3.5" />
              <span>Unique QR Table Infrastructure</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)]">
              Table & QR Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Tables 01 to 20 with genuine route QR codes pointing to <code className="text-[#B77B4B]">/table/:tableId</code>.
            </p>
          </div>

          <button
            onClick={loadTables}
            className="px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#B77B4B]" />
            <span>Refresh Tables</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Table Grid (01 to 20) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => {
            const isAvail = table.status === 'AVAILABLE';
            const isPrep = table.status === 'PREPARING';
            const isReady = table.status === 'READY';
            const isBillReq = table.status === 'BILL_REQUESTED';
            const isOccupied = table.status === 'OCCUPIED';

            return (
              <div
                key={table.id}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                      #{table.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isAvail
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : isPrep
                          ? 'bg-amber-500/10 text-amber-600'
                          : isReady
                          ? 'bg-purple-500/10 text-purple-600'
                          : isBillReq
                          ? 'bg-indigo-500/10 text-indigo-600'
                          : 'bg-neutral-500/10 text-neutral-600'
                      }`}
                    >
                      {table.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] mt-1.5">
                    {table.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">{table.section}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Seats: {table.capacity}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => openTableDetails(table)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-[11px] font-semibold text-[var(--text-primary)]"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => setQrModalTable(table)}
                    className="p-1.5 rounded-lg bg-[#B77B4B]/10 hover:bg-[#B77B4B] text-[#B77B4B] hover:text-white transition-colors"
                    title="View & Download Table QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLE DETAILS MODAL (Section 27) */}
      {selectedTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B77B4B]">
                  Table Inspection
                </span>
                <h2 className="text-xl font-serif font-bold">TABLE {selectedTable.id}</h2>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[var(--bg-secondary)]">
                <div>
                  <span className="font-semibold block">{selectedTable.section}</span>
                  <span className="text-[var(--text-secondary)]">Capacity: {selectedTable.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)]">Status:</span>
                  <select
                    value={selectedTable.status}
                    onChange={(e) => handleUpdateStatus(selectedTable.id, e.target.value as any)}
                    className="p-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-semibold text-xs"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="READY">READY</option>
                    <option value="BILL_REQUESTED">BILL_REQUESTED</option>
                  </select>
                </div>
              </div>

              {/* Active Orders at this table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Active Table Orders ({activeOrders.length})
                </h4>

                {activeOrders.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] py-4 text-center border border-dashed rounded-xl">
                    No active orders at this table.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-serif font-bold text-sm text-[#B77B4B]">
                            Current Order: #{o.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600">
                            {o.status}
                          </span>
                        </div>

                        <div className="divide-y divide-[var(--border-color)]/50 pt-1">
                          {o.items.map((it) => (
                            <div key={it.id} className="py-1 flex justify-between">
                              <span>
                                {it.name} ×{it.quantity}
                              </span>
                              <span className="font-bold">₹{it.totalPrice}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-[var(--border-color)] flex justify-between text-xs">
                          <span>Total: <strong className="font-serif text-[#B77B4B]">₹{o.total}</strong></span>
                          <span>Order placed: {o.createdAtDisplay}</span>
                        </div>

                        {/* Order Actions */}
                        <div className="pt-2 flex gap-2">
                          {o.status !== 'READY' && o.status !== 'SERVED' && (
                            <button
                              onClick={() => handleOrderAction(o.id, 'READY')}
                              className="flex-1 py-1.5 rounded-lg bg-purple-600 text-white font-semibold text-[11px]"
                            >
                              Mark Ready
                            </button>
                          )}
                          {o.status !== 'SERVED' && (
                            <button
                              onClick={() => handleOrderAction(o.id, 'SERVED')}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-[11px]"
                            >
                              Mark Served
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Table Button */}
              <div className="pt-3 border-t border-[var(--border-color)] flex justify-between gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedTable.id, 'AVAILABLE')}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Close / Free Table
                </button>
                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setQrModalTable(selectedTable);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL (Section 9: View, Download PNG, Download SVG, Print) */}
      {qrModalTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)] text-center">
            <button
              onClick={() => setQrModalTable(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B77B4B]">
              BrewBuddy Table QR
            </span>
            <h3 className="text-xl font-serif font-bold mt-0.5">Table {qrModalTable.id}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
              Destination URL: <code className="text-[#B77B4B]">/table/{qrModalTable.id}</code>
            </p>

            {/* Render genuine SVG QR */}
            <div className="p-4 bg-[#FFFCF7] rounded-2xl border border-[var(--border-color)] inline-block shadow-inner">
              <QRCodeSVG
                id={`qr-svg-${qrModalTable.id}`}
                value={`${window.location.origin}/table/${qrModalTable.id}`}
                size={200}
                bgColor="#FFFCF7"
                fgColor="#2A201C"
                level="H"
                includeMargin
              />
            </div>

            {/* Download and Print Actions */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => downloadPng(qrModalTable.id)}
                className="py-2.5 px-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] font-semibold flex flex-col items-center gap-1"
              >
                <Download className="w-4 h-4 text-[#B77B4B]" />
                <span>PNG (600px)</span>
              </button>

              <button
                onClick={() => downloadSvg(qrModalTable.id)}
                className="py-2.5 px-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] font-semibold flex flex-col items-center gap-1"
              >
                <Download className="w-4 h-4 text-[#284C42]" />
                <span>SVG Vector</span>
              </button>

              <button
                onClick={() => printTableQR(qrModalTable)}
                className="py-2.5 px-2 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white font-semibold flex flex-col items-center gap-1 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Stand</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
