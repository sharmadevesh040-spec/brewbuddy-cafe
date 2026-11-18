import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all ${
                  isSuccess
                    ? 'bg-[#284C42]/95 border-[#386457] text-white'
                    : isError
                    ? 'bg-[#8B2626]/95 border-[#B23838] text-white'
                    : isWarning
                    ? 'bg-[#B77B4B]/95 border-[#D2925F] text-white'
                    : 'bg-[#2A201C]/95 border-[#453630] text-[#FFFCF7]'
                }`}
                role="alert"
              >
                <div className="flex items-center gap-3">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#86EFAC] shrink-0" />}
                  {isError && <AlertCircle className="w-5 h-5 text-[#FCA5A5] shrink-0" />}
                  {isWarning && <AlertCircle className="w-5 h-5 text-[#FDE047] shrink-0" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#B77B4B] shrink-0" />}
                  <p className="text-sm font-medium leading-snug">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-3 p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4 opacity-75 hover:opacity-100" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
