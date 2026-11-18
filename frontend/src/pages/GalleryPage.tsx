import React, { useState, useEffect } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Coffee' | 'Interior' | 'Food' | 'Roasting';
  image: string;
  alt: string;
}

export const GalleryPage: React.FC = () => {
  const photos: GalleryPhoto[] = [
    {
      id: 'photo-1',
      title: 'Artisanal Velvet Pour-Over',
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=85',
      alt: 'Barista carefully preparing a manual pour-over brew with warm amber lighting',
    },
    {
      id: 'photo-2',
      title: 'Warm Mezzanine Loft Ambiance',
      category: 'Interior',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=85',
      alt: 'Architectural view of BrewBuddy Café with wood furniture and warm ambient lighting',
    },
    {
      id: 'photo-3',
      title: 'Handcrafted Latte Microfoam Art',
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=1200&auto=format&fit=crop&q=85',
      alt: 'Detailed close-up of intricate swan latte art dusted with cocoa',
    },
    {
      id: 'photo-4',
      title: 'House-Baked Biscoff Cheesecake',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=1200&auto=format&fit=crop&q=85',
      alt: 'Slice of creamy New York style cheesecake with Lotus Biscoff glaze',
    },
    {
      id: 'photo-5',
      title: 'Outdoor Garden Patio Tables',
      category: 'Interior',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=85',
      alt: 'Sunlit café patio tables with lush green foliage and QR stands',
    },
    {
      id: 'photo-6',
      title: '18h Slow Nitro Cold Brew Extraction',
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&auto=format&fit=crop&q=85',
      alt: 'Tall glass of nitrogen-infused dark cold brew coffee with micro-bubbles',
    },
    {
      id: 'photo-7',
      title: 'Single-Estate Green Bean Sourcing',
      category: 'Roasting',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=85',
      alt: 'Freshly roasted Arabica coffee beans spilling across a rustic burlap sack',
    },
    {
      id: 'photo-8',
      title: 'Artisan Avocado Sourdough Tartine',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&auto=format&fit=crop&q=85',
      alt: 'Toasted wild yeast sourdough bread topped with sliced ripe avocado and cherry tomatoes',
    },
    {
      id: 'photo-9',
      title: 'Espresso Extraction at Counter',
      category: 'Roasting',
      image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=1200&auto=format&fit=crop&q=85',
      alt: 'Rich golden crema pouring from commercial dual-boiler portafilter',
    },
  ];

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const filteredPhotos =
    activeCategory === 'All'
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  // Keyboard navigation for Lightbox (Esc, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
      else if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => ((prev! + 1) % filteredPhotos.length));
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredPhotos.length]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B77B4B]/10 text-[#B77B4B] text-xs font-semibold mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Visual Journey</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)]">
              Café Atmosphere & Craft
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Immerse yourself in our specialty brewing philosophy, roastery details, and cozy seating sections.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto">
            {['All', 'Coffee', 'Interior', 'Food', 'Roasting'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedPhotoIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#2A201C] dark:bg-[#B77B4B] text-white shadow'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[#B77B4B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedPhotoIndex(index)}
              className="group relative rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 aspect-[4/3] cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={photo.image}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B77B4B]">
                  {photo.category}
                </span>
                <h3 className="text-base font-serif font-bold mt-0.5">{photo.title}</h3>
                <p className="text-xs text-neutral-300 mt-1 line-clamp-1">{photo.alt}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#86EFAC] font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Click to view full screen</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex(
                  (prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden sm:block"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex((prev) => ((prev! + 1) % filteredPhotos.length));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden sm:block"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
              <img
                src={filteredPhotos[selectedPhotoIndex].image}
                alt={filteredPhotos[selectedPhotoIndex].alt}
                className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="text-xl font-serif font-bold">
                  {filteredPhotos[selectedPhotoIndex].title}
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-lg mx-auto">
                  {filteredPhotos[selectedPhotoIndex].alt}
                </p>
                <span className="text-[11px] text-neutral-400 mt-2 block font-mono">
                  {selectedPhotoIndex + 1} of {filteredPhotos.length} • Use Arrow Keys or ESC
                </span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
