import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Layers,
  Sparkles,
  Database,
  Lock,
  EyeOff,
  Code2,
  Bug,
  Play,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AiLabPage: React.FC = () => {
  // Interactive Hallucination Rejection Playground State
  const [testBudget, setTestBudget] = useState<number>(150);
  const [testItemId, setTestItemId] = useState<string>('dragon-coffee-999');
  const [testDietary, setTestDietary] = useState<string>('vegan');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const runSimulation = () => {
    // Grounding pipeline simulator replicating backend validation
    const catalog = [
      { id: 'single-origin-espresso', name: 'Single Origin Espresso', price: 140, dietary: ['vegan'], allergens: [] },
      { id: 'classic-cappuccino', name: 'Velvet Cappuccino', price: 190, dietary: ['vegetarian'], allergens: ['dairy'] },
      { id: 'lemon-iced-tea', name: 'Lemon Citrus Blossom Iced Tea', price: 130, dietary: ['vegan', 'dairy-free'], allergens: [] },
    ];

    const logs: string[] = [];
    logs.push(`[STAGE 1: INPUT VALIDATION] Sanitized input received. Budget cap: ₹${testBudget}`);

    // Pre-filtering check
    logs.push(`[STAGE 2: DETERMINISTIC FILTERING] Evaluating ${catalog.length} master catalog items...`);
    const preFiltered = catalog.filter((it) => {
      if (it.price > testBudget) {
        logs.push(`  ❌ Excluded "${it.name}" (Price ₹${it.price} > Budget ₹${testBudget})`);
        return false;
      }
      if (testDietary === 'vegan' && !it.dietary.includes('vegan')) {
        logs.push(`  ❌ Excluded "${it.name}" (Not certified vegan)`);
        return false;
      }
      logs.push(`  ✓ Approved candidate: "${it.name}" (₹${it.price})`);
      return true;
    });

    logs.push(`[STAGE 3: AI DISPATCH] Sent ${preFiltered.length} pre-approved candidate item(s) to Gemini 2.5 Flash.`);

    // Simulation of AI returning an item
    logs.push(`[STAGE 4: STRUCTURED JSON PARSING] Model returned recommendation for ID: "${testItemId}"`);
    logs.push(`[STAGE 5: BACKEND POST-VALIDATION & HALLUCINATION CHECK]`);

    let rejected = false;
    let reason = '';

    const existsInCatalog = catalog.some((c) => c.id === testItemId);
    if (!existsInCatalog) {
      rejected = true;
      reason = `HALLUCINATION DETECTED: Item ID "${testItemId}" does not exist in data/menu.json. REJECTED!`;
      logs.push(`  🚨 SECURITY ALERT: ${reason}`);
    } else {
      const eligible = preFiltered.some((c) => c.id === testItemId);
      if (!eligible) {
        rejected = true;
        reason = `CONSTRAINT VIOLATION: Item "${testItemId}" exists in catalog but violates active budget or dietary filters. REJECTED!`;
        logs.push(`  🚨 SECURITY ALERT: ${reason}`);
      } else {
        logs.push(`  ✓ Verified! "${testItemId}" is safe, grounded, and within budget.`);
      }
    }

    setSimulationResult({
      rejected,
      reason,
      logs,
      passed: !rejected,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Academic Transparency Lab</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
              AI Architecture & Integrity Lab
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              An exhaustive architectural walkthrough of BrewBuddy’s multi-stage grounding, deterministic constraints, and zero-hallucination validation pipeline.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* PIPELINE ARCHITECTURE FLOW */}
        <section className="space-y-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B77B4B]">End-to-End Pipeline</span>
            <h2 className="text-2xl font-serif font-bold mt-1">7-Stage Grounded Verification Architecture</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Every customer recommendation request traverses strict zero-trust boundaries before any recommendation is rendered.
            </p>
          </div>

          {/* Visual Step-by-Step Diagram */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
            {[
              {
                step: '01',
                title: 'USER REQUEST & NATURAL LANGUAGE INTENT',
                desc: 'Customer submits prompt (e.g. "Suggest a cold drink under ₹150") along with explicit budget and dietary toggles.',
                badge: 'Frontend Client',
                color: 'bg-blue-500',
              },
              {
                step: '02',
                title: 'BACKEND ZOD INPUT VALIDATION',
                desc: 'Express middleware sanitizes string lengths (max 500 chars), enforces numeric budget boundaries, and checks enum types.',
                badge: 'Security Layer',
                color: 'bg-indigo-500',
              },
              {
                step: '03',
                title: 'DETERMINISTIC PRE-FILTERING (CATALOG GROUNDING)',
                desc: 'Crucial step: Backend filters master data/menu.json FIRST. Any item over budget or containing excluded allergens is culled before reaching the model.',
                badge: 'Grounding Filter',
                color: 'bg-[#B77B4B]',
              },
              {
                step: '04',
                title: 'AI GENERATIVE MODEL (GEMINI 2.5 FLASH)',
                desc: 'Server passes ONLY pre-approved eligible items with strict system instructions requiring structured JSON matching the catalog schema.',
                badge: 'Real Generative API',
                color: 'bg-purple-500',
              },
              {
                step: '05',
                title: 'STRUCTURED JSON PARSER',
                desc: 'Server enforces strict JSON object deserialization. Discards non-conforming responses and handles API timeouts gracefully.',
                badge: 'Parsing Layer',
                color: 'bg-amber-500',
              },
              {
                step: '06',
                title: 'ZERO-TOLERANCE POST-VALIDATION',
                desc: 'Every item ID is cross-checked against data/menu.json. If AI invents a nonexistent item (e.g. "dragon-coffee-999") or violates budget, it is permanently REJECTED.',
                badge: 'Safety Sieve',
                color: 'bg-rose-500',
              },
              {
                step: '07',
                title: 'AUTHENTIC RECOMMENDATION TO USER',
                desc: 'Only fully verified, genuine menu items with exact prices and barista reasoning are delivered to the customer UI with allergen disclaimers.',
                badge: 'Customer UI',
                color: 'bg-emerald-500',
              },
            ].map((node, index, arr) => (
              <React.Fragment key={node.step}>
                <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-start gap-4">
                  <span className="text-xl font-serif font-bold text-[#B77B4B] shrink-0 font-mono">
                    {node.step}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold font-serif text-[var(--text-primary)]">
                        {node.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#2A201C] dark:bg-[#453630]">
                        {node.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {node.desc}
                    </p>
                  </div>
                </div>

                {index < arr.length - 1 && (
                  <div className="flex justify-center py-0.5 text-[var(--text-secondary)]">
                    <ArrowDown className="w-4 h-4 text-[#B77B4B] opacity-60 animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* SECURITY & DATA ACCESS POLICY */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>What the AI Receives</span>
            </div>
            <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-disc pl-5 leading-relaxed">
              <li>Customer's natural language drink preference and taste query.</li>
              <li>Only pre-filtered eligible items that already passed budget and allergen checks.</li>
              <li>Official catalog item IDs, names, flavor descriptions, and prices.</li>
              <li>Short-term conversation history for the current session only.</li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <EyeOff className="w-5 h-5" />
              <span>What the AI CANNOT Access</span>
            </div>
            <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-disc pl-5 leading-relaxed">
              <li>No customer PII (no names, phone numbers, or emails).</li>
              <li>No payment systems, billing credentials, or financial accounts.</li>
              <li>No internal database write access or server filesystem commands.</li>
              <li>No un-grounded internet browsing during table recommendation.</li>
            </ul>
          </div>
        </section>

        {/* INTERACTIVE HALLUCINATION REJECTION SANDBOX */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-[#B77B4B]" />
              <h3 className="text-lg font-serif font-bold">Interactive Hallucination Rejection Playground</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B77B4B]/20 text-[#B77B4B]">
              Live Simulator
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Test how BrewBuddy’s backend detects and rejects hallucinated items or budget violations. Enter an arbitrary test item ID or set an ultra-low budget below.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[var(--text-secondary)] block mb-1">
                Simulated AI Returned Item ID
              </label>
              <input
                type="text"
                value={testItemId}
                onChange={(e) => setTestItemId(e.target.value)}
                placeholder="e.g. dragon-coffee-999"
                className="w-full p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono text-xs focus:outline-none focus:border-[#B77B4B]"
              />
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                Try: "dragon-coffee-999" or "classic-cappuccino"
              </span>
            </div>

            <div>
              <label className="font-bold text-[var(--text-secondary)] block mb-1">
                User Budget Constraint (₹)
              </label>
              <input
                type="number"
                value={testBudget}
                onChange={(e) => setTestBudget(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-semibold focus:outline-none focus:border-[#B77B4B]"
              />
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                Cappuccino is ₹190. Set budget to ₹150 to test rejection.
              </span>
            </div>

            <div>
              <label className="font-bold text-[var(--text-secondary)] block mb-1">
                Dietary Constraint
              </label>
              <select
                value={testDietary}
                onChange={(e) => setTestDietary(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-semibold focus:outline-none focus:border-[#B77B4B]"
              >
                <option value="vegan">Vegan Only</option>
                <option value="all">Any</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={runSimulation}
              className="px-6 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold shadow flex items-center gap-1.5 hover:opacity-90"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Validation Sieve</span>
            </button>
          </div>

          {/* Simulation Output Terminal */}
          {simulationResult && (
            <div className="p-4 rounded-2xl bg-[#14100E] border border-[#382D27] text-neutral-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#382D27]">
                <span className="font-bold text-neutral-400">SIEVING LOGS:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    simulationResult.passed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {simulationResult.passed ? 'VERIFIED & APPROVED' : 'REJECTED BY BACKEND'}
                </span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {simulationResult.logs.map((log: string, idx: number) => (
                  <p key={idx} className="leading-relaxed">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
