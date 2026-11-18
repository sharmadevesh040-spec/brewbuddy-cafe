import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Coffee,
  Sparkles,
  Clock,
  Flame,
  Check,
  Plus,
  Info,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MenuItem, Category } from '../types/index.js';
import { getMenu } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

export const MenuPage: React.FC = () => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAllergensExclusion, setSelectedAllergensExclusion] = useState<string[]>([]);
  const [selectedCaffeine, setSelectedCaffeine] = useState<string>('all');
  const [selectedTemperature, setSelectedTemperature] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'prep-asc'>('featured');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Item details modal
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);

  const categories: Array<'All' | Category> = ['All', 'Coffee', 'Tea', 'Coolers', 'Snacks', 'Desserts', 'Specials'];

  useEffect(() => {
    async function loadMenuData() {
      setLoading(true);
      try {
        const data = await getMenu();
        setItems(data.items);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Menu data could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    loadMenuData();
  }, []);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxPrice(300);
    setSelectedDietary([]);
    setSelectedAllergensExclusion([]);
    setSelectedCaffeine('all');
    setSelectedTemperature('all');
    setSortBy('featured');
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchIng = item.ingredients.some((i) => i.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchIng) return false;
        }

        // Max price
        if (item.price > maxPrice) return false;

        // Dietary tags
        if (selectedDietary.length > 0) {
          const hasAllDietary = selectedDietary.every((tag) => item.dietaryTags.includes(tag));
          if (!hasAllDietary) return false;
        }

        // Allergen exclusions
        if (selectedAllergensExclusion.length > 0) {
          const hasExcludedAllergen = selectedAllergensExclusion.some((alg) =>
            item.allergens.map((a) => a.toLowerCase()).includes(alg.toLowerCase())
          );
          if (hasExcludedAllergen) return false;
        }

        // Caffeine
        if (selectedCaffeine !== 'all' && item.caffeine !== selectedCaffeine) {
          return false;
        }

        // Temperature
        if (selectedTemperature !== 'all' && item.temperature !== selectedTemperature) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'prep-asc') return a.preparationTime - b.preparationTime;
        return 0; // featured natural order
      });
  }, [
    items,
    selectedCategory,
    searchQuery,
    maxPrice,
    selectedDietary,
    selectedAllergensExclusion,
    selectedCaffeine,
    selectedTemperature,
    sortBy,
  ]);

  const handleAddToCart = (item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleAllergenExclusion = (alg: string) => {
    setSelectedAllergensExclusion((prev) => (prev.includes(alg) ? prev.filter((a) => a !== alg) : [...prev, alg]));
  };

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (maxPrice < 300 ? 1 : 0) +
    selectedDietary.length +
    selectedAllergensExclusion.length +
    (selectedCaffeine !== 'all' ? 1 : 0) +
    (selectedTemperature !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header Banner */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B77B4B]">Handcrafted Specialty Menu</span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] mt-1">
              BrewBuddy Café Menu
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-xl">
              Ethically sourced beans, organic loose leaves, house-baked pastries, and fresh savories with guaranteed catalog grounding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFiltersDrawer(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[#B77B4B] text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#B77B4B]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#B77B4B] text-white text-[11px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search Bar & Sort Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by drink name, roast notes, or ingredients (e.g. oat milk, matcha, saffron)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-[#B77B4B] focus:outline-none text-sm text-[var(--text-primary)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[var(--text-secondary)]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-semibold focus:outline-none focus:border-[#B77B4B] text-[var(--text-primary)]"
            >
              <option value="featured">Featured Roasts</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="prep-asc">Preparation Time (Fastest)</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white shadow-md'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#B77B4B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active Filters Display & Clear Button */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-[var(--text-secondary)]">Active Filters:</span>
            {selectedCategory !== 'All' && (
              <span className="px-2.5 py-1 rounded-md bg-[#B77B4B]/10 text-[#B77B4B] border border-[#B77B4B]/20 font-medium">
                Category: {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-md bg-[#B77B4B]/10 text-[#B77B4B] border border-[#B77B4B]/20 font-medium">
                Query: "{searchQuery}"
              </span>
            )}
            {maxPrice < 300 && (
              <span className="px-2.5 py-1 rounded-md bg-[#B77B4B]/10 text-[#B77B4B] border border-[#B77B4B]/20 font-medium">
                Under ₹{maxPrice}
              </span>
            )}
            {selectedDietary.map((d) => (
              <span key={d} className="px-2.5 py-1 rounded-md bg-[#284C42]/10 text-[#284C42] dark:text-[#86EFAC] border border-[#284C42]/20 font-medium">
                {d}
              </span>
            ))}
            {selectedAllergensExclusion.map((a) => (
              <span key={a} className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium">
                No {a}
              </span>
            ))}
            {selectedCaffeine !== 'all' && (
              <span className="px-2.5 py-1 rounded-md bg-[#B77B4B]/10 text-[#B77B4B] border border-[#B77B4B]/20 font-medium">
                Caffeine: {selectedCaffeine}
              </span>
            )}
            {selectedTemperature !== 'all' && (
              <span className="px-2.5 py-1 rounded-md bg-[#B77B4B]/10 text-[#B77B4B] border border-[#B77B4B]/20 font-medium">
                Temp: {selectedTemperature}
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-500 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Loading / Error / Empty / Grid States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-[var(--bg-secondary)] animate-pulse border border-[var(--border-color)]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center max-w-md mx-auto my-12">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-secondary)]/50 p-8 max-w-lg mx-auto">
            <Coffee className="w-12 h-12 text-[#B77B4B] mx-auto opacity-60 mb-3" />
            <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">No matching menu items</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
              No items match your active combination of filters and dietary criteria. Try relaxing budget or temperature filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold hover:opacity-90"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemDetail(item)}
                className="group rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#B77B4B] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                      {item.category}
                    </span>
                    {item.temperature && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 dark:bg-black/80 backdrop-blur-md text-neutral-800 dark:text-neutral-200 capitalize">
                        {item.temperature}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-[#86EFAC]">
                    <Clock className="w-3 h-3" />
                    <span>{item.preparationTime}m</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-serif font-bold text-[var(--text-primary)] group-hover:text-[#B77B4B] transition-colors leading-snug">
                        {item.name}
                      </h3>
                      <span className="text-base font-serif font-bold text-[#B77B4B] shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Badges & Actions */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {item.dietaryTags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#284C42]/10 text-[#284C42] dark:text-[#86EFAC] capitalize"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FILTER DRAWER / MODAL */}
      <AnimatePresence>
        {showFiltersDrawer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[var(--bg-primary)] border-l border-[var(--border-color)] p-6 overflow-y-auto text-[var(--text-primary)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#B77B4B]" />
                    <h2 className="text-lg font-serif font-bold">Filter Menu</h2>
                  </div>
                  <button
                    onClick={() => setShowFiltersDrawer(false)}
                    className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Max Price Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span>Maximum Budget</span>
                      <span className="text-[#B77B4B] font-bold">₹{maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={300}
                      step={10}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#B77B4B]"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
                      <span>₹100</span>
                      <span>₹200</span>
                      <span>₹300</span>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2">
                      Temperature
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['all', 'hot', 'cold', 'room'].map((temp) => (
                        <button
                          key={temp}
                          onClick={() => setSelectedTemperature(temp)}
                          className={`py-2 text-xs font-medium rounded-lg border capitalize transition-all ${
                            selectedTemperature === temp
                              ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {temp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caffeine Level */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2">
                      Caffeine Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['all', 'high', 'medium', 'none'].map((caff) => (
                        <button
                          key={caff}
                          onClick={() => setSelectedCaffeine(caff)}
                          className={`py-2 text-xs font-medium rounded-lg border capitalize transition-all ${
                            selectedCaffeine === caff
                              ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {caff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Certifications */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-2">
                      Dietary Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['vegan', 'dairy-free', 'gluten-free', 'vegetarian'].map((tag) => {
                        const isChecked = selectedDietary.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleDietary(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                              isChecked
                                ? 'bg-[#284C42] text-white border-[#284C42]'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {isChecked ? `✓ ${tag}` : tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Allergen Exclusions */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-rose-500 block mb-2">
                      Exclude Allergens
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['dairy', 'gluten', 'nuts', 'eggs', 'sesame', 'oats'].map((alg) => {
                        const isExcluded = selectedAllergensExclusion.includes(alg);
                        return (
                          <button
                            key={alg}
                            onClick={() => toggleAllergenExclusion(alg)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                              isExcluded
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {isExcluded ? `✕ No ${alg}` : `No ${alg}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFiltersDrawer(false)}
                  className="flex-1 py-3 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white text-xs font-semibold hover:opacity-90 shadow"
                >
                  Apply Filters ({filteredItems.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ITEM DETAILS MODAL */}
      <AnimatePresence>
        {selectedItemDetail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden text-[var(--text-primary)]">
              <div className="relative aspect-[16/9] bg-neutral-200 dark:bg-neutral-800">
                <img
                  src={selectedItemDetail.image}
                  alt={selectedItemDetail.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedItemDetail(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B77B4B]">
                      {selectedItemDetail.category} • {selectedItemDetail.temperature}
                    </span>
                    <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mt-0.5">
                      {selectedItemDetail.name}
                    </h2>
                  </div>
                  <span className="text-2xl font-serif font-bold text-[#B77B4B]">
                    ₹{selectedItemDetail.price}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                  {selectedItemDetail.description}
                </p>

                {/* Ingredients */}
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Ingredients
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItemDetail.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-2.5 py-1 rounded-md text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Allergens & Prep */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-[var(--text-secondary)] block">Allergens:</span>
                    <span className="capitalize">
                      {selectedItemDetail.allergens.length > 0
                        ? selectedItemDetail.allergens.join(', ')
                        : 'None detected'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[var(--text-secondary)] block">Prep Time:</span>
                    <span>Approx. {selectedItemDetail.preparationTime} minutes</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedItemDetail);
                      setSelectedItemDetail(null);
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#2A201C] dark:bg-[#B77B4B] text-white font-semibold text-sm shadow hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart — ₹{selectedItemDetail.price}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
