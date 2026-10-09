import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import {
  Search,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Tag,
  Star,
  Check,
  ShoppingBag,
  CornerDownLeft
} from 'lucide-react';

export const SpotlightSearchModal: React.FC = () => {
  const {
    products,
    isSpotlightOpen,
    closeSpotlight,
    setSelectedProductForModal,
    setSelectedCategory,
    addToCart,
    showToast
  } = useStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isSpotlightOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSelectedFilter('All');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSpotlightOpen]);

  // Filter products based on query & filter
  const filteredProducts = React.useMemo(() => {
    let list = products;
    if (selectedFilter !== 'All') {
      if (selectedFilter === 'Bundles') {
        list = list.filter((p) => p.isBundle);
      } else {
        list = list.filter((p) => p.category.toLowerCase() === selectedFilter.toLowerCase());
      }
    }

    if (!query.trim()) {
      return list.slice(0, 8);
    }

    const q = query.toLowerCase().trim();
    return list.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchDesc = p.shortDescription.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchFeatures = p.features?.some((f) => f.toLowerCase().includes(q));
      return matchTitle || matchCat || matchDesc || matchFeatures;
    });
  }, [products, query, selectedFilter]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredProducts.length, query]);

  // Keyboard navigation (Arrow Up, Arrow Down, Enter, Escape)
  useEffect(() => {
    if (!isSpotlightOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSpotlight();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredProducts.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : Math.max(0, filteredProducts.length - 1)));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredProducts[selectedIndex]) {
          handleSelectProduct(filteredProducts[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotlightOpen, filteredProducts, selectedIndex]);

  // Keep active item in view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isSpotlightOpen) return null;

  const handleSelectProduct = (product: Product) => {
    closeSpotlight();
    setSelectedProductForModal(product);
  };

  const popularTags = [
    { label: 'All', tag: 'All' },
    { label: 'Smart Bundles', tag: 'Bundles' },
    { label: 'Python Notes', tag: 'Python' },
    { label: 'DSA Master', tag: 'DSA' },
    { label: 'Java OOPs', tag: 'Java' },
    { label: 'C / C++', tag: 'C/C++' },
    { label: 'Web Dev', tag: 'Web Dev' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/60 backdrop-blur-md flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4 animate-in fade-in duration-150 font-body"
      onClick={closeSpotlight}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#CED7DF] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Spotlight Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#CED7DF] flex items-center gap-3 bg-[#F7FAFC]">
          <div className="w-10 h-10 rounded-2xl bg-[#0B3561] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Search className="w-5 h-5 text-[#12A5B0]" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Spotlight Search notes, topics, smart bundles..."
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-[#071E38] placeholder-[#9DAEC0] focus:outline-hidden font-heading"
            />
          </div>

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 text-[#6D86A0] hover:text-[#0B3561] hover:bg-[#E7EBEF] rounded-lg transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6D86A0] bg-[#E7EBEF] px-2.5 py-1 rounded-lg border border-[#CED7DF] shrink-0 font-mono">
            <span>ESC</span>
          </div>
        </div>

        {/* Quick Filter Tag Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-[#E7EBEF] flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-[#6D86A0] uppercase tracking-wider mr-1 shrink-0 font-heading">
            Filter:
          </span>
          {popularTags.map((t) => (
            <button
              key={t.tag}
              onClick={() => setSelectedFilter(t.tag)}
              className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer font-heading ${
                selectedFilter === t.tag
                  ? 'bg-[#0B3561] text-white shadow-xs'
                  : 'bg-[#F7FAFC] text-[#3C5D81] hover:bg-[#E7EBEF] border border-[#CED7DF]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[50vh] sm:max-h-[55vh] overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={product.id}
                  data-index={idx}
                  onClick={() => handleSelectProduct(product)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#DDF3F4]/70 border-[#12A5B0] shadow-xs'
                      : 'bg-white hover:bg-[#F7FAFC] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail */}
                    <img
                      src={product.coverImage}
                      alt={product.title}
                      className="w-13 h-17 object-cover rounded-xl border border-[#CED7DF] shrink-0 shadow-2xs"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E7EBEF] text-[#0B3561] font-heading">
                          {product.category}
                        </span>
                        {product.isBundle && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#12A5B0] text-white font-heading flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Save 49%</span>
                          </span>
                        )}
                        {product.badge && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#FFD54A] text-[#071E38] font-heading">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-extrabold text-[#0B3561] truncate font-heading">
                        {product.title}
                      </h4>

                      <p className="text-[11px] text-[#6D86A0] truncate max-w-md hidden sm:block">
                        {product.shortDescription}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#3C5D81] mt-1 font-mono">
                        <span className="font-bold text-[#12A5B0]">
                          {product.pages} Printed Pages
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#0B3561] font-bold">
                          <Star className="w-3 h-3 text-[#FFD54A] fill-[#FFD54A]" />
                          <span>{product.rating}</span>
                        </span>
                        <span>•</span>
                        <span className={product.stockQuantity > 5 ? 'text-teal-700 font-bold' : 'text-amber-600 font-bold'}>
                          {product.stockQuantity > 5 ? 'In Stock' : `Only ${product.stockQuantity} left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="text-right shrink-0 pl-3">
                    <div className="text-sm sm:text-base font-black text-[#0B3561] font-mono">
                      ₹{product.salePrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#9DAEC0] line-through font-mono">
                      ₹{product.regularPrice.toLocaleString('en-IN')}
                    </div>

                    <div className="mt-1">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#12A5B0] bg-white px-2 py-0.5 rounded-md border border-[#A0DBDF] font-heading">
                          <span>Open</span>
                          <CornerDownLeft className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                          className="p-1.5 text-[#0B3561] hover:text-[#12A5B0] rounded-lg hover:bg-[#E7EBEF] cursor-pointer"
                          title="Quick Add to Cart"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 space-y-2">
              <Search className="w-10 h-10 text-[#9DAEC0] mx-auto" />
              <div className="text-sm font-bold text-[#0B3561] font-heading">
                No matching notes found for &quot;{query}&quot;
              </div>
              <p className="text-xs text-[#6D86A0] max-w-xs mx-auto">
                Try searching for Python, DSA, Java, C++, or explore our full catalog.
              </p>
            </div>
          )}
        </div>

        {/* Apple Spotlight Command Footer */}
        <div className="p-3 sm:p-3.5 bg-[#F7FAFC] border-t border-[#CED7DF] flex items-center justify-between text-[11px] text-[#6D86A0]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#CED7DF] text-[10px] font-mono font-bold text-[#0B3561]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#CED7DF] text-[10px] font-mono font-bold text-[#0B3561]">
                ↓
              </kbd>
              <span className="hidden sm:inline">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#CED7DF] text-[10px] font-mono font-bold text-[#0B3561]">
                ↵
              </kbd>
              <span>View Book</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#CED7DF] text-[10px] font-mono font-bold text-[#0B3561]">
                ESC
              </kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[#12A5B0] font-bold font-heading">
            <Sparkles className="w-3.5 h-3.5 text-[#12A5B0]" />
            <span className="hidden sm:inline">Instant Spotlight Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
