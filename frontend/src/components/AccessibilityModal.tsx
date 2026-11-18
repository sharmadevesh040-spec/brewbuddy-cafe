import React from 'react';
import { X, Eye, Zap, Type, Sparkles, Check, Monitor } from 'lucide-react';
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
    contrastMode,
    setContrastMode,
    isSystemHighContrast,
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

          {/* High Contrast Preference with Automatic Detection */}
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-[#B77B4B]" />
                <div>
                  <p className="text-sm font-semibold">High Contrast</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Maximum legibility and crisp borders
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                highContrast ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
              }`}>
                {highContrast ? 'Active' : 'Standard'}
              </span>
            </div>

            {/* Segmented Controller: Auto / On / Off */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setContrastMode('auto')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all flex flex-col items-center gap-0.5 ${
                  contrastMode === 'auto'
                    ? 'bg-[#B77B4B] text-white border-[#B77B4B] shadow-sm'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  <span>Automatic</span>
                </div>
                <span className="text-[9px] opacity-80">OS Match</span>
              </button>

              <button
                onClick={() => setContrastMode('high')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all flex flex-col items-center gap-0.5 ${
                  contrastMode === 'high'
                    ? 'bg-[#B77B4B] text-white border-[#B77B4B] shadow-sm'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>Always On</span>
                <span className="text-[9px] opacity-80">Enforced</span>
              </button>

              <button
                onClick={() => setContrastMode('normal')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all flex flex-col items-center gap-0.5 ${
                  contrastMode === 'normal'
                    ? 'bg-[#B77B4B] text-white border-[#B77B4B] shadow-sm'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>Standard</span>
                <span className="text-[9px] opacity-80">Default Palette</span>
              </button>
            </div>

            {contrastMode === 'auto' && (
              <p className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-primary)] p-2 rounded-lg border border-[var(--border-color)]">
                ℹ️ <strong>Automatic Mode Active:</strong> System contrast is currently{' '}
                <strong className={isSystemHighContrast ? 'text-emerald-600' : 'text-[#B77B4B]'}>
                  {isSystemHighContrast ? 'High Contrast (Detected)' : 'Standard'}
                </strong>.
              </p>
            )}
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#B77B4B]" />
              <div>
                <p className="text-sm font-semibold">Reduced Motion</p>
                <p className="text-xs text-[var(--text-secondary)]">Disable transitions and animations</p>
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
