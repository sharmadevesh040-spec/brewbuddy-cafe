import React from 'react';
import { Coffee, ShieldCheck, Heart, Code2, Sparkles, Award, Cpu, Database } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-[#B77B4B]/10 text-[#B77B4B] mb-3">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-[var(--text-primary)]">
            About BrewBuddy Café
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 max-w-2xl mx-auto">
            Where specialty third-wave coffee meets state-of-the-art grounded artificial intelligence and frictionless QR table dispatch.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* BRAND STORY */}
        <section className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B77B4B]">Our Philosophy</span>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
            The Craft of Coffee, Re-imagined Around Your Seat
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            BrewBuddy Café was conceived with a simple observation: modern cafés often force a choice between high-touch artisanal hospitality and fast digital convenience. Customers either wait in long counter queues or use impersonal generic apps that harvest excessive personal data.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            We designed BrewBuddy to put the table first. By placing unique cryptographic QR identifiers at each station (Table 01 to 20), guests can immediately browse, consult an intelligent AI Barista, customize their drinks, and monitor live barista preparation—all without downloading an app or handing over sensitive phone numbers.
          </p>
        </section>

        {/* AI DISCLOSURE & INTEGRITY */}
        <section className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-2.5 text-[#B77B4B]">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">
              Formal AI Disclosure & Grounding Policy
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            The AI Barista in BrewBuddy Café connects to Google's real generative models server-side (Gemini API) via a zero-trust grounding architecture. Unlike generic prompt wrappers:
          </p>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)] list-disc pl-5">
            <li>
              <strong>Deterministic Pre-filtering:</strong> Prices, allergies, and temperature tags are verified by the backend prior to contacting the model.
            </li>
            <li>
              <strong>Controlled Catalog Grounding:</strong> The AI only receives valid menu item IDs from <code className="text-[#B77B4B]">data/menu.json</code>.
            </li>
            <li>
              <strong>Zero-Tolerance Post-Validation:</strong> Any hallucinated item ID or budget overrun returned by the model is immediately rejected before reaching the user.
            </li>
            <li>
              <strong>Privacy Guaranteed:</strong> No customer PII or authentication keys are ever stored or exposed client-side.
            </li>
          </ul>
        </section>

        {/* TECHNOLOGY STACK */}
        <section className="space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B77B4B]">Engineering Stack</span>
          <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
            Production-Quality Technical Foundation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-[#B77B4B] font-bold text-sm">
                <Code2 className="w-4 h-4" />
                <span>Frontend Architecture</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                React 19 + TypeScript + Vite, Tailwind CSS v4 design tokens, Framer Motion animations, Lucide React icons, and Recharts operational visualization.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-[#284C42] dark:text-[#86EFAC] font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>Backend & Database</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Node.js + Express with Zod schema validation, real-time Server-Sent Events (SSE), rate limiting, and zero stack-trace leaking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Artificial Intelligence</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Server-side Gemini Generative Language API integration with structured JSON mode and multi-stage verification pipeline.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Automated Testing Suite</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Vitest + Supertest testing suite enforcing strict budget boundary tests, hallucination rejection, and timestamp logging integrity.
              </p>
            </div>
          </div>
        </section>

        {/* TEAM & CREDITS */}
        <section className="pt-6 border-t border-[var(--border-color)] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B77B4B]">Academic Credits</span>
          <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">
            Project & Viva Demonstration
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Developed as an assessed, production-grade smart café and QR table ordering application demonstration. Built to showcase full-stack systems engineering, human-centered UI/UX design, real AI safety architectures, and accessible interactive web standards.
          </p>
        </section>
      </div>
    </div>
  );
};
