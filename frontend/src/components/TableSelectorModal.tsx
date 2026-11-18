import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, QrCode, MapPin } from 'lucide-react';
import { useTable } from '../context/TableContext.js';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({ isOpen, onClose }) => {
  const { tableId, setTableId } = useTable();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (num: number) => {
    const formatted = num.toString().padStart(2, '0');
    setTableId(formatted);
    onClose();
    navigate(`/table/${formatted}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-selector-title"
    >
      <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 id="table-selector-title" className="text-xl font-serif font-bold">
              Select Your Table
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Choose your table number or scan the QR code placed on the table
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
            aria-label="Close table selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4">
          <button
            onClick={() => {
              onClose();
              navigate('/scan');
            }}
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#B77B4B] to-[#9E6436] text-white font-medium shadow-md hover:opacity-95 transition-all"
          >
            <QrCode className="w-5 h-5" />
            <span>Open Camera QR Scanner</span>
          </button>
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#B77B4B]" />
          <span>Demo Tables (01 to 20)</span>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5 pb-2">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
            const formatted = num.toString().padStart(2, '0');
            const isSelected = tableId === formatted;

            let section = 'Lounge';
            if (num <= 3) section = 'Window';
            else if (num >= 11 && num <= 14) section = 'Patio';
            else if (num >= 17) section = 'Loft';

            return (
              <button
                key={num}
                onClick={() => handleSelect(num)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                  isSelected
                    ? 'bg-[#B77B4B] text-white border-[#B77B4B] shadow-md scale-105'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[#B77B4B] text-[var(--text-primary)]'
                }`}
              >
                <span className="text-xs opacity-75 font-mono">T</span>
                <span className="text-base font-bold font-serif">{formatted}</span>
                <span className="text-[10px] opacity-75 truncate max-w-full">{section}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center text-xs text-[var(--text-secondary)]">
          <span>Current: {tableId ? `Table ${tableId}` : 'None Selected'}</span>
          {tableId && (
            <button
              onClick={() => {
                setTableId(null);
                onClose();
              }}
              className="text-red-500 hover:underline"
            >
              Clear Table
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
