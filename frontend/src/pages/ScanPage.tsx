import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Camera,
  Upload,
  Keyboard,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTable } from '../context/TableContext.js';
import { useToast } from '../context/ToastContext.js';

export const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTableId } = useTable();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual' | 'demo'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse QR content and navigate
  const handleScannedResult = (decodedText: string) => {
    setIsProcessing(true);
    let tableIdFound: string | null = null;

    // Check if it's a URL like http://localhost:5173/table/12 or /table/12
    const match = decodedText.match(/\/table\/(\d+)/i);
    if (match && match[1]) {
      tableIdFound = match[1].padStart(2, '0');
    } else if (/^\d{1,2}$/.test(decodedText.trim())) {
      tableIdFound = decodedText.trim().padStart(2, '0');
    }

    if (tableIdFound) {
      const num = parseInt(tableIdFound, 10);
      if (num >= 1 && num <= 20) {
        setTableId(tableIdFound);
        showToast(`Connected to Table ${tableIdFound}!`, 'success');
        stopCamera();
        navigate(`/table/${tableIdFound}`);
        return;
      }
    }

    setIsProcessing(false);
    showToast('Invalid QR: Table not found in BrewBuddy Café.', 'error');
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode('qr-reader-region');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScannedResult(decodedText);
        },
        () => {
          // Frame error (no QR detected in frame) — normal
        }
      );

      setCameraActive(true);
    } catch (err: any) {
      console.warn('[QR Camera Error]:', err);
      setCameraActive(false);
      setCameraError(
        'Camera access was denied or is unavailable on this device. You can upload a QR image or select a demo table below.'
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && cameraActive) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Handle File Upload QR Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-file-region');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScannedResult(decodedText);
    } catch (err) {
      showToast('Could not read a valid table QR code from that image.', 'error');
      setIsProcessing(false);
    }
  };

  // Handle Manual Code Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim();
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num >= 1 && num <= 20) {
      const formatted = num.toString().padStart(2, '0');
      setTableId(formatted);
      showToast(`Welcome to Table ${formatted}!`, 'success');
      navigate(`/table/${formatted}`);
    } else {
      showToast('Please enter a valid table number between 1 and 20.', 'error');
    }
  };

  // Quick Demo Table Click
  const handleSelectDemoTable = (num: number) => {
    const formatted = num.toString().padStart(2, '0');
    setTableId(formatted);
    showToast(`Connected to Table ${formatted}!`, 'success');
    navigate(`/table/${formatted}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-[#B77B4B]/10 text-[#B77B4B] mb-3">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
            SCAN YOUR TABLE
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Scan the QR code on your table to start ordering.
          </p>
          <p className="text-xs text-[#284C42] dark:text-[#86EFAC] mt-1 font-medium">
            No registration or personal data required.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1 mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white shadow'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white shadow'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white shadow'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Code</span>
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'demo'
                ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white shadow'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Demo Grid</span>
          </button>
        </div>

        {/* TAB 1: CAMERA SCANNER */}
        {activeTab === 'camera' && (
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center shadow-lg">
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-square max-w-sm mx-auto flex items-center justify-center border border-[var(--border-color)]">
              <div id="qr-reader-region" className="w-full h-full" />

              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-black/80">
                  <RefreshCw className="w-8 h-8 text-[#B77B4B] animate-spin mb-3" />
                  <p className="text-sm font-semibold">Requesting camera permissions...</p>
                  <p className="text-xs text-neutral-400 mt-1">Please allow camera access when prompted.</p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/90 text-white">
                  <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-xs text-neutral-300 leading-relaxed max-w-xs">{cameraError}</p>
                  <button
                    onClick={() => setActiveTab('demo')}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#B77B4B] text-white text-xs font-semibold shadow hover:opacity-90"
                  >
                    Use Presentation Mode
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-4">
              Point your smartphone or webcam at the Table QR stand.
            </p>
          </div>
        )}

        {/* TAB 2: UPLOAD IMAGE */}
        {activeTab === 'upload' && (
          <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center shadow-lg">
            <div id="qr-file-region" className="hidden" />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border-color)] hover:border-[#B77B4B] rounded-2xl p-8 cursor-pointer transition-colors max-w-sm mx-auto flex flex-col items-center justify-center"
            >
              <Upload className="w-10 h-10 text-[#B77B4B] mb-3" />
              <p className="text-sm font-serif font-bold text-[var(--text-primary)]">
                Choose Table QR Image
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Upload a screenshot or photo of Table 01–20 QR code.
              </p>
              <span className="mt-4 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]">
                Browse Files
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL TABLE NUMBER */}
        {activeTab === 'manual' && (
          <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg max-w-md mx-auto">
            <h2 className="text-lg font-serif font-bold text-center mb-1">Enter Table Number</h2>
            <p className="text-xs text-center text-[var(--text-secondary)] mb-6">
              Look at the small metallic plate on your table (e.g. 04, 12, 18).
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  placeholder="e.g. 12"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full text-center text-3xl font-serif font-bold tracking-widest py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[#B77B4B] focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white font-semibold text-sm shadow hover:opacity-90 transition-opacity"
              >
                Go to Table
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: DEMO PRESENTATION SELECTOR */}
        {activeTab === 'demo' && (
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-serif font-bold">Presentation Mode</h2>
                <p className="text-xs text-[var(--text-secondary)]">Click any table below for immediate assessment demo.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#B77B4B]/20 text-[#B77B4B]">
                20 Tables Active
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                const formatted = num.toString().padStart(2, '0');
                const isTable12 = formatted === '12';

                return (
                  <button
                    key={num}
                    onClick={() => handleSelectDemoTable(num)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isTable12
                        ? 'bg-[#B77B4B] text-white border-[#B77B4B] shadow-md ring-2 ring-[#B77B4B]/50'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[#B77B4B] text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-[10px] opacity-75 font-mono">Table</span>
                    <span className="text-base font-serif font-bold">{formatted}</span>
                    {isTable12 && (
                      <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 bg-black/30 px-1.5 py-0.2 rounded-full">
                        Assessed
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
