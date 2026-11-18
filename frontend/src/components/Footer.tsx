import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, QrCode, Sparkles, Heart, ShieldCheck, ExternalLink, X, Code2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [showGithubQr, setShowGithubQr] = useState(false);
  const githubRepoUrl = 'https://github.com/brewbuddy-cafe/brewbuddy';

  return (
    <footer className="bg-[#2A201C] text-[#F6F1E8] border-t border-[#453630] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#453630]/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#B77B4B] flex items-center justify-center text-white shadow-md">
                <Coffee className="w-5 h-5 text-[#FFFCF7]" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-[#FFFCF7]">
                BrewBuddy <span className="text-[#B77B4B] text-lg font-sans font-semibold">Café</span>
              </span>
            </Link>
            <p className="text-sm text-[#D4C7B8] leading-relaxed max-w-sm">
              An intelligent specialty café and QR table ordering ecosystem. Merging artisanal bean sourcing with real-time AI barista recommendations, table dispatch, and live kitchen management.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#B77B4B] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Grounded AI Architecture • Zero Fabrications • Safe Ordering</span>
            </div>
          </div>

          {/* Quick Order Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#B77B4B]">Experience</p>
            <ul className="space-y-2 text-sm text-[#D4C7B8]">
              <li>
                <Link to="/menu" className="hover:text-white transition-colors">
                  Artisanal Menu
                </Link>
              </li>
              <li>
                <Link to="/scan" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#B77B4B]" />
                  <span>Scan Table QR</span>
                </Link>
              </li>
              <li>
                <Link to="/build" className="hover:text-white transition-colors">
                  Build Your Drink
                </Link>
              </li>
              <li>
                <Link to="/ai-barista" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B77B4B]" />
                  <span>AI Barista</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors">
                  Café Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations & Staff */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#B77B4B]">Operations</p>
            <ul className="space-y-2 text-sm text-[#D4C7B8]">
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                  Staff Dashboard
                </Link>
              </li>
              <li>
                <Link to="/kitchen" className="hover:text-white transition-colors">
                  Kitchen Display System
                </Link>
              </li>
              <li>
                <Link to="/admin/tables" className="hover:text-white transition-colors">
                  Table QR Management
                </Link>
              </li>
              <li>
                <Link to="/ai-lab" className="hover:text-white transition-colors">
                  AI Integrity Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic / GitHub QR Column */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#B77B4B]">Viva & Source</p>
            <p className="text-xs text-[#D4C7B8]">
              Assessed project demonstration. Real API backend with strict catalog grounding.
            </p>
            <button
              onClick={() => setShowGithubQr(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#453630] hover:bg-[#57453D] text-white text-xs font-medium transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View Source on GitHub</span>
              <QrCode className="w-3.5 h-3.5 text-[#B77B4B]" />
            </button>
          </div>
        </div>

        {/* Bottom Bar with Academic Demo Notice */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A8988A] gap-4">
          <p>© {new Date().getFullYear()} BrewBuddy Café. Production-Grade Smart Café Demonstration System.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for viva & portfolio demonstration</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 inline mx-0.5" />
          </div>
        </div>
      </div>

      {/* GitHub QR Modal */}
      {showGithubQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-[#FFFCF7] text-[#2A201C] p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-[#B77B4B]">
            <button
              onClick={() => setShowGithubQr(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-neutral-500 hover:text-neutral-800"
              aria-label="Close QR modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex p-3 rounded-2xl bg-[#F6F1E8] mb-3">
              <GithubIcon className="w-8 h-8 text-[#2A201C]" />
            </div>
            <h3 className="text-lg font-serif font-bold">View Source on GitHub</h3>
            <p className="text-xs text-neutral-600 mt-1 mb-4">
              Scan this genuine QR code with any phone camera to inspect the codebase, architecture, and AI validation suite.
            </p>

            <div className="flex justify-center p-4 bg-white rounded-xl shadow-inner border border-neutral-200">
              <QRCodeSVG
                value={githubRepoUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#2A201C"
                level="H"
                includeMargin
              />
            </div>

            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B77B4B] hover:underline"
            >
              <span>{githubRepoUrl}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </footer>
  );
};
