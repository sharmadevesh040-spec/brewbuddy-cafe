import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Coffee,
  Sparkles,
  Share,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed during this session
    const dismissedSession = sessionStorage.getItem('bb_pwa_dismissed');
    if (dismissedSession === 'true') {
      setIsDismissed(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Browser fallback (e.g. desktop Chrome already promptable or dev mode)
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('bb_pwa_dismissed', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* FLOATING PWA DOWNLOAD SIGN / POPUP BANNER */}
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 1 }}
            className="fixed bottom-6 left-4 sm:left-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-full bg-[var(--bg-primary)] border-2 border-[#B77B4B] rounded-3xl shadow-2xl p-5 text-[var(--text-primary)] backdrop-blur-md"
            role="dialog"
            aria-labelledby="pwa-install-title"
          >
            {/* Top Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5">
              {/* App Icon Preview */}
              <div className="w-12 h-12 rounded-2xl bg-[#2A201C] dark:bg-[#B77B4B] text-white flex items-center justify-center shrink-0 shadow-md">
                <Coffee className="w-6 h-6 text-[#FFFCF7]" />
              </div>

              <div className="flex-1 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#B77B4B]/10 text-[#B77B4B]">
                    Smart Café App
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> PWA Ready
                  </span>
                </div>
                <h3 id="pwa-install-title" className="text-base font-serif font-bold text-[var(--text-primary)] mt-0.5">
                  Install BrewBuddy Café
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Add to home screen for instant table ordering, offline catalog browsing, and real-time kitchen tracking.
                </p>
              </div>
            </div>

            {/* Quick Benefits Pills */}
            <div className="grid grid-cols-2 gap-2 my-3.5 text-[11px] text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant 1-Tap Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Zero Storage Overhead</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Offline Menu Cache</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Live Table Dispatch</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B77B4B] to-[#9E6436] hover:opacity-95 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download / Install App</span>
              </button>

              <button
                onClick={handleDismiss}
                className="py-2.5 px-3 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--text-secondary)] transition-colors"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMIZED FLOATING PILL (When dismissed but installable) */}
      {isDismissed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsDismissed(false)}
          className="fixed bottom-6 left-4 z-40 px-3.5 py-2 rounded-full bg-[#2A201C] dark:bg-[#B77B4B] text-[#FFFCF7] text-xs font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
          title="Download BrewBuddy PWA App"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>Install App</span>
        </motion.button>
      )}

      {/* IOS / DESKTOP INSTALL GUIDE MODAL */}
      <AnimatePresence>
        {showIosGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl shadow-2xl p-6 text-[var(--text-primary)] text-center">
              <button
                onClick={() => setShowIosGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#B77B4B]/10 text-[#B77B4B] mx-auto flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-serif font-bold">Add to Home Screen</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                Follow these simple steps in your mobile browser to install BrewBuddy Café:
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#B77B4B] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-[#B77B4B]" /> at the bottom or top of your browser.</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#B77B4B] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#B77B4B] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <span>Tap <strong>Add</strong> in the top-right corner to launch directly from your home screen.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIosGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold shadow hover:opacity-90"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
