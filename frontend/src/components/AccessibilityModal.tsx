import React from 'react';
import { X, Eye, Zap, Type, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const {
    isDark,
    toggleDark,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
  } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
    >
      <div className="relative w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-[var(--text-primary)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#B77B4B]" />
            <h2 id="a11y-title" className="text-lg font-serif font-bold">
              Accessibility Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
            aria-label="Close accessibility modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#B77B4B]" />
              <div>
                <p className="text-sm font-semibold">Dark Theme</p>
                <p className="text-xs text-[var(--text-secondary)]">Warm espresso dark palette</p>
              </div>
            </div>
            <button
              onClick={toggleDark}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                isDark ? 'bg-[#B77B4B]' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
              aria-label="Toggle dark mode"
              aria-pressed={isDark}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#B77B4B]" />
              <div>
                <p className="text-sm font-semibold">High Contrast</p>
                <p className="text-xs text-[var(--text-secondary)]">Maximum text legibility & borders</p>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                highContrast ? 'bg-[#B77B4B]' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
              aria-label="Toggle high contrast"
              aria-pressed={highContrast}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#B77B4B]" />
              <div>
                <p className="text-sm font-semibold">Reduced Motion</p>
                <p className="text-xs text-[var(--text-secondary)]">Disable transitions and entrance animations</p>
              </div>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                reducedMotion ? 'bg-[#B77B4B]' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
              aria-label="Toggle reduced motion"
              aria-pressed={reducedMotion}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Text Size Scaling */}
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-[#B77B4B]" />
              <p className="text-sm font-semibold">Text Size</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    textSize === size
                      ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                      : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {size === 'normal' ? 'Default' : size === 'large' ? 'Large (+12%)' : 'X-Large (+25%)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-[#FFFCF7] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
