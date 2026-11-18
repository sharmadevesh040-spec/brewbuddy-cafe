import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Sparkles,
  Flame,
  Snowflake,
  Plus,
  Check,
  RotateCcw,
  ShoppingBag,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';

interface BaseOption {
  id: string;
  name: string;
  basePrice: number;
  caffeine: string;
  description: string;
}

interface MilkOption {
  id: string;
  name: string;
  price: number;
  vegan: boolean;
}

interface TempOption {
  id: string;
  name: string;
  price: number;
  icon: 'hot' | 'cold';
}

interface SweetOption {
  id: string;
  name: string;
  level: string;
}

interface SizeOption {
  id: string;
  name: string;
  volume: string;
  priceAdd: number;
}

interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export const DrinkBuilderPage: React.FC = () => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const bases: BaseOption[] = [
    { id: 'cappuccino', name: 'Velvet Cappuccino Base', basePrice: 190, caffeine: 'High', description: 'Double espresso with textured velvety microfoam.' },
    { id: 'latte', name: 'Smooth Latte Base', basePrice: 200, caffeine: 'Medium', description: 'Gentle, creamy espresso paired with silky steamed milk.' },
    { id: 'espresso', name: 'Single Origin Espresso Base', basePrice: 140, caffeine: 'High', description: 'Double shot of Chikmagalur estate Arabica.' },
    { id: 'cold-brew', name: '18h Nitro Cold Brew Base', basePrice: 210, caffeine: 'High', description: 'Velvety smooth, slow cold-steeped reserve.' },
    { id: 'matcha', name: 'Ceremonial Matcha Base', basePrice: 220, caffeine: 'Low', description: 'First harvest Japanese Uji ceremonial green tea.' },
    { id: 'chai', name: 'Royal Saffron Chai Base', basePrice: 120, caffeine: 'Medium', description: 'Assam whole leaf steeped with Kashmiri spices.' },
  ];

  const milks: MilkOption[] = [
    { id: 'whole-milk', name: 'Whole Milk', price: 0, vegan: false },
    { id: 'skim-milk', name: 'Skim Milk (Low Fat)', price: 0, vegan: false },
    { id: 'oat-milk', name: 'Oat Milk (Barista Blend)', price: 40, vegan: true },
    { id: 'almond-milk', name: 'Almond Milk', price: 40, vegan: true },
    { id: 'soy-milk', name: 'Organic Soy Milk', price: 30, vegan: true },
    { id: 'coconut-milk', name: 'Coconut Milk', price: 40, vegan: true },
    { id: 'none', name: 'No Milk / Black', price: 0, vegan: true },
  ];

  const temperatures: TempOption[] = [
    { id: 'hot', name: 'Piping Hot (65°C)', price: 0, icon: 'hot' },
    { id: 'extra-hot', name: 'Extra Hot (75°C)', price: 0, icon: 'hot' },
    { id: 'iced', name: 'Over Crystal Ice', price: 10, icon: 'cold' },
    { id: 'blended', name: 'Blended Frappé', price: 30, icon: 'cold' },
  ];

  const sweetnessLevels: SweetOption[] = [
    { id: 'zero', name: 'Unsweetened', level: '0%' },
    { id: 'light', name: 'Lightly Sweet', level: '25%' },
    { id: 'medium', name: 'Standard Medium', level: '50%' },
    { id: 'extra', name: 'Sweet Tooth', level: '100%' },
  ];

  const sizes: SizeOption[] = [
    { id: 'regular', name: 'Regular', volume: '240ml', priceAdd: 0 },
    { id: 'large', name: 'Grande', volume: '350ml', priceAdd: 40 },
    { id: 'jumbo', name: 'Venti', volume: '480ml', priceAdd: 70 },
  ];

  const extras: ExtraOption[] = [
    { id: 'extra-shot', name: 'Extra Espresso Shot', price: 50 },
    { id: 'vanilla', name: 'Madagascar Vanilla Syrup', price: 30 },
    { id: 'caramel', name: 'Salted Caramel Drizzle', price: 30 },
    { id: 'hazelnut', name: 'Hazelnut Praline Syrup', price: 35 },
    { id: 'cold-foam', name: 'Silky Cold Foam Cap', price: 40 },
    { id: 'whipped-cream', name: 'Vanilla Whipped Cream', price: 30 },
    { id: 'cinnamon', name: 'Ceylon Cinnamon Dust', price: 10 },
  ];

  // Selection states
  const [selectedBase, setSelectedBase] = useState<BaseOption>(bases[0]);
  const [selectedMilk, setSelectedMilk] = useState<MilkOption>(milks[2]); // Oat milk by default
  const [selectedTemp, setSelectedTemp] = useState<TempOption>(temperatures[0]);
  const [selectedSweetness, setSelectedSweetness] = useState<SweetOption>(sweetnessLevels[2]);
  const [selectedSize, setSelectedSize] = useState<SizeOption>(sizes[1]); // Large
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['vanilla']);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Live total calculation
  const totalPrice = useMemo(() => {
    let sum = selectedBase.basePrice;
    sum += selectedMilk.price;
    sum += selectedTemp.price;
    sum += selectedSize.priceAdd;
    for (const extraId of selectedExtras) {
      const found = extras.find((e) => e.id === extraId);
      if (found) sum += found.price;
    }
    return sum;
  }, [selectedBase, selectedMilk, selectedTemp, selectedSize, selectedExtras]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    const extraNames = selectedExtras
      .map((id) => extras.find((e) => e.id === id)?.name)
      .filter(Boolean) as string[];

    const extraTotal = totalPrice - selectedBase.basePrice;

    addItem({
      menuItemId: `custom-${selectedBase.id}`,
      name: `Custom ${selectedBase.name.replace(' Base', '')}`,
      category: 'Coffee',
      unitPrice: selectedBase.basePrice,
      preparationTime: 6,
      customization: {
        base: selectedBase.name,
        milk: selectedMilk.name,
        temperature: selectedTemp.name,
        sweetness: selectedSweetness.name,
        size: selectedSize.name,
        extras: extraNames,
        extraPrice: extraTotal,
      },
      specialInstructions: specialInstructions || undefined,
      quantity: 1,
    });

    showToast(`Added custom drink to cart (₹${totalPrice})`, 'success');
  };

  const resetCustomizer = () => {
    setSelectedBase(bases[0]);
    setSelectedMilk(milks[0]);
    setSelectedTemp(temperatures[0]);
    setSelectedSweetness(sweetnessLevels[2]);
    setSelectedSize(sizes[0]);
    setSelectedExtras([]);
    setSpecialInstructions('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B77B4B]">Bespoke Drink Lab</span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] mt-1">
              Build Your Drink
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-lg">
              Tailor every single note: craft base roast, artisan milks, extraction temperature, sweetness calibration, and gourmet garnishes.
            </p>
          </div>

          <button
            onClick={resetCustomizer}
            className="px-4 py-2 rounded-xl border border-[var(--border-color)] hover:border-[#B77B4B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Recipe</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CUSTOMIZATION STEPS */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: BASE */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#B77B4B] text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-base font-serif font-bold">Choose Drink Base</h2>
              </div>
              <span className="text-xs font-semibold text-[#B77B4B]">{selectedBase.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bases.map((base) => {
                const isSelected = selectedBase.id === base.id;
                return (
                  <button
                    key={base.id}
                    onClick={() => setSelectedBase(base)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[var(--bg-primary)] border-[#B77B4B] shadow-md ring-1 ring-[#B77B4B]'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[#B77B4B]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-serif font-bold text-[var(--text-primary)]">{base.name}</span>
                      <span className="text-xs font-bold text-[#B77B4B]">₹{base.basePrice}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{base.description}</p>
                    <span className="inline-block mt-2 text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                      Caffeine: {base.caffeine}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: MILK */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#B77B4B] text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-serif font-bold">Select Milk / Dairy Option</h2>
              </div>
              <span className="text-xs font-semibold text-[#B77B4B]">{selectedMilk.name}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {milks.map((milk) => {
                const isSelected = selectedMilk.id === milk.id;
                return (
                  <button
                    key={milk.id}
                    onClick={() => setSelectedMilk(milk)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#B77B4B] text-white border-[#B77B4B] shadow-sm'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[#B77B4B] text-[var(--text-primary)]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">{milk.name}</span>
                      {milk.vegan && (
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-[#284C42] dark:text-[#86EFAC]'}`}>
                          Plant-Based
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold mt-2">
                      {milk.price === 0 ? 'Included' : `+₹${milk.price}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3 & 4: TEMPERATURE & SWEETNESS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temperature */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#B77B4B] text-white text-xs font-bold flex items-center justify-center">3</span>
                <h2 className="text-base font-serif font-bold">Temperature</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {temperatures.map((temp) => {
                  const isSelected = selectedTemp.id === temp.id;
                  return (
                    <button
                      key={temp.id}
                      onClick={() => setSelectedTemp(temp)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[#B77B4B]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                        {temp.icon === 'hot' ? <Flame className="w-3.5 h-3.5" /> : <Snowflake className="w-3.5 h-3.5" />}
                        <span>{temp.name}</span>
                      </div>
                      <span className="text-[10px] block opacity-80 mt-1">
                        {temp.price === 0 ? 'Free' : `+₹${temp.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sweetness */}
            <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[#B77B4B] text-white text-xs font-bold flex items-center justify-center">4</span>
                <h2 className="text-base font-serif font-bold">Sweetness</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {sweetnessLevels.map((sweet) => {
                  const isSelected = selectedSweetness.id === sweet.id;
                  return (
                    <button
                      key={sweet.id}
                      onClick={() => setSelectedSweetness(sweet)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#B77B4B] text-white border-[#B77B4B]'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[#B77B4B]'
                      }`}
                    >
                      <span className="text-xs font-semibold block">{sweet.name}</span>
                      <span className="text-[10px] opacity-75">{sweet.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 5: SIZE */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#B77B4B] text-white text-xs font-bold flex items-center justify-center">5</span>
                <h2 className="text-base font-serif font-bold">Drink Size</h2>
              </div>
              <span className="text-xs font-semibold text-[#B77B4B]">{selectedSize.name} ({selectedSize.volume})</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSize.id === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white border-transparent shadow'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[#B77B4B]'
                    }`}
                  >
                    <span className="text-sm font-serif font-bold block">{size.name}</span>
                    <span className="text-xs opacity-80">{size.volume}</span>
                    <span className="text-xs font-bold block mt-2 text-[#B77B4B] dark:text-white">
                      {size.priceAdd === 0 ? 'Standard' : `+₹${size.priceAdd}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 6: EXTRAS */}
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#B77B4B] text-white text-xs font-bold flex items-center justify-center">6</span>
              <h2 className="text-base font-serif font-bold">Flavor Syrups & Gourmet Extras</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {extras.map((extra) => {
                const isChecked = selectedExtras.includes(extra.id);
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-[#B77B4B]/10 border-[#B77B4B] text-[#B77B4B] font-semibold'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div>
                      <span className="text-xs block">{extra.name}</span>
                      <span className="text-[10px] opacity-75">+₹{extra.price}</span>
                    </div>
                    {isChecked && <Check className="w-4 h-4 shrink-0 text-[#B77B4B]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE RECIPE CARD & PRICE SUMMARY */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B77B4B]">Live Preview</span>
                <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">Custom Recipe</h3>
              </div>
              <Coffee className="w-6 h-6 text-[#B77B4B]" />
            </div>

            {/* Customization Details List */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Base Drink:</span>
                <span className="font-semibold text-right">{selectedBase.name} (₹{selectedBase.basePrice})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Milk Choice:</span>
                <span className="font-semibold text-right">{selectedMilk.name} ({selectedMilk.price === 0 ? '₹0' : `+₹${selectedMilk.price}`})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Temperature:</span>
                <span className="font-semibold text-right">{selectedTemp.name} ({selectedTemp.price === 0 ? '₹0' : `+₹${selectedTemp.price}`})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Sweetness:</span>
                <span className="font-semibold text-right">{selectedSweetness.name} ({selectedSweetness.level})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Size:</span>
                <span className="font-semibold text-right">{selectedSize.name} ({selectedSize.priceAdd === 0 ? '₹0' : `+₹${selectedSize.priceAdd}`})</span>
              </div>
              {selectedExtras.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)] block mb-1">Extras:</span>
                  <div className="space-y-1 pl-2">
                    {selectedExtras.map((eId) => {
                      const ext = extras.find((e) => e.id === eId);
                      return ext ? (
                        <div key={eId} className="flex justify-between text-[11px]">
                          <span>• {ext.name}</span>
                          <span className="font-semibold">+₹{ext.price}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Total Price Display */}
            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Drink Price</span>
                <p className="text-2xl font-serif font-bold text-[#B77B4B]">₹{totalPrice}</p>
              </div>
              <span className="text-xs text-[var(--text-secondary)]">Inc. all options</span>
            </div>

            {/* Action CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#B77B4B] to-[#9E6436] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customized Drink</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
