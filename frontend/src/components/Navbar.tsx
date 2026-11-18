import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Coffee,
  Sparkles,
  ShoppingBag,
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  Sun,
  Moon,
  Eye,
  QrCode,
  FlaskConical,
  ChefHat,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext.js';
import { useTable } from '../context/TableContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { AccessibilityModal } from './AccessibilityModal.js';
import { TableSelectorModal } from './TableSelectorModal.js';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { tableId } = useTable();
  const { isDark, toggleDark } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);

  // Track scroll and compute progress
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((offset / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setStaffDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'AI Barista', path: '/ai-barista' },
    { name: 'Build Drink', path: '/build' },
    { name: 'Order', path: '/order' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Scroll Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-50">
        <div
          className="h-full bg-gradient-to-r from-[#B77B4B] to-[#284C42] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Demo Mode Notice Banner */}
      <div className="bg-[#2A201C] text-[#F6F1E8] text-xs py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-[#3D2F29]">
        <span className="w-2 h-2 rounded-full bg-[#86EFAC] animate-pulse" />
        <span>DEMO MODE — QR Table Ordering & AI Barista System • Real AI Model Grounding</span>
        {tableId && (
          <span className="bg-[#B77B4B] text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Active: Table {tableId}
          </span>
        )}
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--bg-primary)]/90 backdrop-blur-md shadow-sm border-b border-[var(--border-color)] py-2.5'
            : 'bg-[var(--bg-primary)] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#B77B4B] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2A201C] to-[#453630] dark:from-[#B77B4B] dark:to-[#9E6436] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 text-[#F6F1E8]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[var(--text-primary)]">
                BrewBuddy
              </span>
              <span className="text-xs uppercase tracking-widest text-[#B77B4B] font-semibold block -mt-1">
                Café
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isActive
                      ? 'text-[#B77B4B] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#B77B4B] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Table Badge / Button */}
            <button
              onClick={() => setTableModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                tableId
                  ? 'bg-[#284C42]/10 border-[#284C42] text-[#284C42] dark:bg-[#284C42]/30 dark:text-[#86EFAC]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[#B77B4B]'
              }`}
              title="Click to view or switch your table"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{tableId ? `Table ${tableId}` : 'Scan Table'}</span>
            </button>

            {/* AI Barista CTA (Compact on desktop) */}
            <Link
              to="/ai-barista"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#B77B4B] to-[#9E6436] text-white text-xs font-semibold shadow hover:opacity-95 transition-opacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/order"
              className="relative p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B77B4B]"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#B77B4B] text-white text-[11px] font-bold flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Staff Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setStaffDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Staff and Admin Menu"
                aria-expanded={staffDropdownOpen}
              >
                <LayoutDashboard className="w-5 h-5" />
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {staffDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    className="absolute right-0 mt-2 w-52 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-xl py-2 z-50 text-[var(--text-primary)]"
                  >
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Staff & Operations
                    </div>
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#B77B4B]" />
                      <span>Staff Dashboard</span>
                    </Link>
                    <Link
                      to="/kitchen"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <ChefHat className="w-4 h-4 text-[#284C42]" />
                      <span>Kitchen Display (KDS)</span>
                    </Link>
                    <Link
                      to="/admin/tables"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-[#B77B4B]" />
                      <span>Table QR Management</span>
                    </Link>
                    <div className="border-t border-[var(--border-color)] my-1" />
                    <Link
                      to="/ai-lab"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>AI Transparency Lab</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accessibility Modal Toggle */}
            <button
              onClick={() => setA11yOpen(true)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              title="Accessibility & Display settings"
              aria-label="Accessibility settings"
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 pt-3 pb-6 space-y-2"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <span className="text-xs text-[var(--text-secondary)]">
                  {tableId ? `Ordering from Table ${tableId}` : 'No table assigned'}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTableModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#B77B4B] hover:underline"
                >
                  Change Table
                </button>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 rounded-xl text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-[#B77B4B]/10 text-[#B77B4B] font-semibold'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3">
                  Staff & Operations
                </p>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#B77B4B]" />
                  <span>Staff Dashboard</span>
                </Link>
                <Link
                  to="/kitchen"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <ChefHat className="w-4 h-4 text-[#284C42]" />
                  <span>Kitchen Display (KDS)</span>
                </Link>
                <Link
                  to="/admin/tables"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <QrCode className="w-4 h-4 text-[#B77B4B]" />
                  <span>Table Management & QR</span>
                </Link>
                <Link
                  to="/ai-lab"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  <span>AI Transparency Lab</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Accessibility Modal */}
      <AccessibilityModal isOpen={a11yOpen} onClose={() => setA11yOpen(false)} />

      {/* Table Selector Modal */}
      <TableSelectorModal isOpen={tableModalOpen} onClose={() => setTableModalOpen(false)} />
    </>
  );
};
