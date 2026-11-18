import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Coffee,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Clock,
  Flame,
  Award,
  ChevronRight,
  Utensils,
  Layers,
} from 'lucide-react';
import { useTable } from '../context/TableContext.js';

export const HomePage: React.FC = () => {
  const { tableId } = useTable();

  // Entrance animation variants (around 600-900ms)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' as any },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32">
        {/* Subtle decorative warm background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B77B4B]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#284C42]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Table Status Chip */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#284C42]/10 text-[#284C42] dark:bg-[#284C42]/30 dark:text-[#86EFAC] border border-[#284C42]/20">
                  <span className="w-2 h-2 rounded-full bg-[#284C42] dark:bg-[#86EFAC] animate-ping" />
                  {tableId ? `Connected to Table ${tableId}` : 'Instant QR Table Dispatch'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B77B4B]" />
                  <span>Real AI Model Grounding</span>
                </span>
              </motion.div>

              {/* Staggered Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[var(--text-primary)] leading-[1.12]"
              >
                Your Table. <br />
                Your Order. <br />
                <span className="text-[#B77B4B] italic">Your Perfect Brew.</span>
              </motion.h1>

              {/* Supporting Text */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed"
              >
                An AI-powered café experience built around your table. Scan your table QR, consult our grounded AI Barista, customize bespoke drinks, and track live kitchen preparation in real time.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2"
              >
                <Link
                  to="/menu"
                  className="px-7 py-3.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-[#FFFCF7] font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/ai-barista"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#B77B4B] to-[#9E6436] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask AI Barista</span>
                </Link>

                <Link
                  to="/scan"
                  className="px-6 py-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-[var(--text-primary)] font-semibold text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-[#B77B4B]" />
                  <span>Scan a Table</span>
                </Link>
              </motion.div>

              {/* Fast Stats Highlight */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-4 pt-6 max-w-lg mx-auto lg:mx-0 border-t border-[var(--border-color)] text-left"
              >
                <div>
                  <p className="text-2xl font-serif font-bold text-[#B77B4B]">100%</p>
                  <p className="text-xs text-[var(--text-secondary)]">Single-Origin Arabica</p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-[var(--text-primary)]">&lt; 6 min</p>
                  <p className="text-xs text-[var(--text-secondary)]">Avg. Kitchen Prep</p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-[#284C42] dark:text-[#86EFAC]">Zero</p>
                  <p className="text-xs text-[var(--text-secondary)]">AI Hallucinations</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Hero Visual Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[var(--bg-primary)] aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=85"
                    alt="BrewBuddy Specialty Pour Over Coffee and Warm Café Ambiance"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Drink Badge on Image */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 dark:bg-[#2A201C]/95 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#B77B4B] flex items-center justify-center text-white font-serif font-bold">
                        BB
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Featured Single Estate</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white font-serif">Chikmagalur Velvet Roast</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#B77B4B]">₹190</span>
                  </div>
                </div>

                {/* Floating Table Dispatch Pill */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="absolute -top-4 -left-4 sm:-left-8 p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-xl flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#284C42] flex items-center justify-center text-white">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Table 12 Active</p>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">Ready in 5m 40s</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4-STEP HOW IT WORKS */}
      <section className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B77B4B]">Seamless Experience</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] mt-1.5">
              How BrewBuddy Smart Café Works
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3">
              No app download required. Everything runs in your browser from the table QR code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow relative group">
              <span className="text-4xl font-serif font-bold text-[#B77B4B]/20 group-hover:text-[#B77B4B]/40 transition-colors">01</span>
              <div className="w-12 h-12 rounded-xl bg-[#B77B4B]/10 text-[#B77B4B] flex items-center justify-center my-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">Scan Table QR</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Scan the unique QR stand on your table. Your table session connects automatically without collecting personal info or phone numbers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow relative group">
              <span className="text-4xl font-serif font-bold text-[#B77B4B]/20 group-hover:text-[#B77B4B]/40 transition-colors">02</span>
              <div className="w-12 h-12 rounded-xl bg-[#284C42]/10 text-[#284C42] dark:text-[#86EFAC] flex items-center justify-center my-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">Ask AI Barista</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Tell the AI what you crave. Say "Cold non-coffee under ₹150" or customize milks, sweetness, and extras with instant price calculation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow relative group">
              <span className="text-4xl font-serif font-bold text-[#B77B4B]/20 group-hover:text-[#B77B4B]/40 transition-colors">03</span>
              <div className="w-12 h-12 rounded-xl bg-[#B77B4B]/10 text-[#B77B4B] flex items-center justify-center my-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">Instant Kitchen Dispatch</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Order fires instantly to the Kitchen Display System (KDS). Kitchen accepts and starts preparation timer linked to your table ID.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow relative group">
              <span className="text-4xl font-serif font-bold text-[#B77B4B]/20 group-hover:text-[#B77B4B]/40 transition-colors">04</span>
              <div className="w-12 h-12 rounded-xl bg-[#284C42]/10 text-[#284C42] dark:text-[#86EFAC] flex items-center justify-center my-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">Live Status & Assistance</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Track status: Accepted, Preparing, Ready, Served with exact timestamps. Tap "Call Staff" or "Request Bill" anytime directly from your seat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI TRANSPARENCY PREVIEW BANNER */}
      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#2A201C] via-[#352823] to-[#1E1714] text-white shadow-xl border border-[#4D3A32] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B77B4B]/30 text-[#E8C2A0] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Academic & Viva Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
                Real AI Grounding. Zero Hard-Coded Fallacies.
              </h2>
              <p className="text-sm text-[#D4C7B8] leading-relaxed">
                Unlike generic mockups, BrewBuddy runs an enterprise grounding pipeline: deterministically filtering prices, allergens, and dietary constraints BEFORE sending candidate items to Gemini. If the model hallucinates an invalid ID or violates budget, the backend rejects it.
              </p>
            </div>
            <Link
              to="/ai-lab"
              className="px-6 py-3.5 rounded-xl bg-[#B77B4B] hover:bg-[#9E6436] text-white font-semibold text-sm shadow-md hover:scale-105 transition-all shrink-0 flex items-center gap-2"
            >
              <span>Explore AI Lab</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK CTA BAR */}
      <section className="py-12 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)]">
            Ready to order at your table?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Scan your table QR code or select a demo table to launch the full ordering experience.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/scan"
              className="px-7 py-3 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Scan Table QR
            </Link>
            <Link
              to="/table/12"
              className="px-7 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-sm hover:border-[#B77B4B] transition-colors"
            >
              Test Table 12 Directly
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
