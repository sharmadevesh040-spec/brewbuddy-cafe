import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Coffee,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { recommendItems } from '../services/api.js';
import type {
  RecommendationRequest,
  RecommendationResponse,
  ValidatedRecommendation,
} from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendations?: ValidatedRecommendation[];
  modelUsed?: string;
  rejectedHallucinations?: string[];
  filterStats?: { totalCatalogItems: number; eligibleItemsCount: number };
  timestamp: string;
}

export const AiBaristaPage: React.FC = () => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Advanced constraints
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [temperature, setTemperature] = useState<'hot' | 'cold' | 'all'>('all');
  const [coffeePreference, setCoffeePreference] = useState<'coffee' | 'non-coffee' | 'any'>('any');
  const [isVegan, setIsVegan] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [caffeinePref, setCaffeinePref] = useState<'high' | 'medium' | 'low' | 'none' | 'any'>('any');
  const [showFilters, setShowFilters] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your BrewBuddy AI Barista. Tell me about your mood, taste preferences, or budget, and I will recommend freshly brewed drinks and gourmet treats grounded directly in our menu catalog.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    'Suggest a cold drink under ₹150',
    'I do not drink coffee, suggest something refreshing',
    'I want something sweet with high caffeine',
    'Suggest vegan drinks under ₹250',
    'Best dessert and beverage pairing',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || inputMessage).trim();
    if (!textToSend && !maxBudget && !isVegan) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend || `Find recommendations with active filters`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history for current session context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-4)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          text: m.text,
        }));

      const requestPayload: RecommendationRequest = {
        message: textToSend,
        maxBudget: maxBudget || undefined,
        temperature,
        coffeePreference,
        vegan: isVegan,
        allergenExclusions: selectedAllergens,
        caffeinePreference: caffeinePref,
        history,
      };

      const res: RecommendationResponse = await recommendItems(requestPayload);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.greeting,
        recommendations: res.recommendations,
        modelUsed: res.modelUsed,
        rejectedHallucinations: res.rejectedHallucinations,
        filterStats: res.filterStats,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      showToast(err.message || 'AI Barista is temporarily unavailable.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I apologize, that request took longer than expected. Please try again or relax your budget/dietary constraints.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: any) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice: item.price,
      image: item.image,
      preparationTime: item.preparationTime,
      quantity: 1,
    });
    showToast(`Added ${item.name} to cart (₹${item.price})`, 'success');
  };

  const toggleAllergen = (alg: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(alg) ? prev.filter((a) => a !== alg) : [...prev, alg]
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-12 flex flex-col">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B77B4B] to-[#9E6436] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                  BrewBuddy AI Barista
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#284C42]/10 text-[#284C42] dark:bg-[#284C42]/30 dark:text-[#86EFAC]">
                  Live Grounding
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Catalog-Grounded Model • Zero Hallucinations • Real-Time Menu Constraints
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              showFilters || maxBudget || isVegan || selectedAllergens.length > 0
                ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Constraint Settings</span>
            {(maxBudget || isVegan || selectedAllergens.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Constraints Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-secondary)]"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Budget Limit */}
              <div>
                <label className="font-bold text-[var(--text-secondary)] block mb-1">
                  Budget Cap (₹): {maxBudget ? `₹${maxBudget}` : 'No limit'}
                </label>
                <div className="flex gap-1.5">
                  {[150, 200, 250, 300].map((b) => (
                    <button
                      key={b}
                      onClick={() => setMaxBudget(maxBudget === b ? undefined : b)}
                      className={`px-2.5 py-1.5 rounded-lg border font-semibold ${
                        maxBudget === b
                          ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                      }`}
                    >
                      ≤ ₹{b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className="font-bold text-[var(--text-secondary)] block mb-1">Temperature</label>
                <div className="flex gap-1.5">
                  {(['all', 'hot', 'cold'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTemperature(t)}
                      className={`px-3 py-1.5 rounded-lg border font-semibold capitalize ${
                        temperature === t
                          ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coffee vs Non-Coffee */}
              <div>
                <label className="font-bold text-[var(--text-secondary)] block mb-1">Coffee Preference</label>
                <div className="flex gap-1.5">
                  {(['any', 'coffee', 'non-coffee'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCoffeePreference(c)}
                      className={`px-2.5 py-1.5 rounded-lg border font-semibold capitalize ${
                        coffeePreference === c
                          ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vegan / Allergens */}
              <div>
                <label className="font-bold text-[var(--text-secondary)] block mb-1">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setIsVegan(!isVegan)}
                    className={`px-2.5 py-1 rounded-lg border font-semibold ${
                      isVegan
                        ? 'bg-[#284C42] text-white border-[#284C42]'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                    }`}
                  >
                    {isVegan ? '✓ Vegan Only' : 'Vegan'}
                  </button>
                  {['dairy', 'gluten', 'nuts'].map((alg) => (
                    <button
                      key={alg}
                      onClick={() => toggleAllergen(alg)}
                      className={`px-2 py-1 rounded-lg border text-[11px] capitalize ${
                        selectedAllergens.includes(alg)
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                      }`}
                    >
                      {selectedAllergens.includes(alg) ? `✕ No ${alg}` : `No ${alg}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Scroll Region */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B77B4B] to-[#9E6436] text-white flex items-center justify-center shrink-0 shadow mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Chat Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white rounded-tr-none'
                      : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`text-[10px] block mt-1.5 opacity-60 ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Grounded Recommendation Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#B77B4B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Certified Barista Recommendations</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] shadow-sm flex flex-col justify-between transition-all"
                        >
                          <div>
                            {/* Image & Price */}
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-neutral-200">
                              <img
                                src={rec.item.image}
                                alt={rec.item.name}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-serif font-bold bg-black/75 text-white">
                                ₹{rec.item.price}
                              </span>
                            </div>

                            <h4 className="text-sm font-serif font-bold text-[var(--text-primary)]">
                              {rec.item.name}
                            </h4>

                            {/* Why this? reason */}
                            <p className="text-xs text-[var(--text-secondary)] mt-1.5 italic bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-color)]">
                              "{rec.reason}"
                            </p>

                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {rec.item.dietaryTags.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded-md text-[10px] bg-[#284C42]/10 text-[#284C42] dark:text-[#86EFAC] capitalize font-medium"
                                >
                                  {t}
                                </span>
                              ))}
                              <span className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--bg-primary)] border text-[var(--text-secondary)] capitalize font-medium">
                                {rec.item.temperature}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                            <span className="text-xs font-serif font-bold text-[#B77B4B]">
                              ₹{rec.item.price}
                            </span>
                            <button
                              onClick={() => handleAddToCart(rec.item)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1 shadow"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Disclaimer & Model info */}
                    <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] space-y-1">
                      <p className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#284C42] shrink-0" />
                        <span>AI suggestions — verify ingredients and allergens with café staff.</span>
                      </p>
                      {msg.modelUsed && (
                        <p className="text-[10px] opacity-75 font-mono">
                          Model: {msg.modelUsed} • Pre-filtered catalog items: {msg.filterStats?.eligibleItemsCount}/{msg.filterStats?.totalCatalogItems}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-[#2A201C] text-white flex items-center justify-center shrink-0 shadow mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B77B4B] to-[#9E6436] text-white flex items-center justify-center shrink-0 shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#B77B4B] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#B77B4B] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#B77B4B] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-medium ml-1">
                Barista is checking recipe catalog and grounding constraints...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] shrink-0">Try:</span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[#B77B4B] hover:text-white border border-[var(--border-color)] text-[var(--text-secondary)] font-medium whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask AI Barista (e.g. 'Suggest a cold non-coffee drink under ₹150')..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="w-full pl-5 pr-14 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[#B77B4B] focus:outline-none text-sm text-[var(--text-primary)] shadow-sm transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="absolute right-3 p-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white disabled:opacity-40 hover:opacity-90 shadow transition-all"
            aria-label="Send prompt to AI Barista"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
