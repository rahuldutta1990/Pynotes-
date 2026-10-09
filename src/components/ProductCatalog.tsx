import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { BookOpen, SlidersHorizontal, SearchX } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();

  const [sortBy, setSortBy] = useState<'bestseller' | 'price-low' | 'price-high' | 'rating'>('bestseller');

  const categories = [
    { id: 'All', label: 'All 13 Subjects' },
    { id: 'Bundles', label: '✨ Smart Bundles', highlight: true },
    { id: 'Python', label: 'Python' },
    { id: 'Java', label: 'Java' },
    { id: 'DSA', label: 'DSA & Algorithms' },
    { id: 'C/C++', label: 'C & C++' },
    { id: 'Systems', label: 'Systems & OS' },
    { id: 'Web Dev', label: 'Web & React' }
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by category
    if (selectedCategory === 'Bundles') {
      list = list.filter((p) => p.isBundle);
    } else if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory || (p.isBundle && p.category.includes(selectedCategory)));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: Bestseller / featured
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalog-section" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#CED7DF]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#12A5B0] bg-[#DDF3F4] px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 font-heading">
            <BookOpen className="w-3.5 h-3.5 text-[#12A5B0]" />
            <span>Complete Physical Catalogue</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B3561] tracking-tight font-heading">
            Printed Coding Notes & Bundles
          </h2>
          <p className="text-[#6D86A0] text-sm mt-1 max-w-xl font-body">
            Choose single subject books or save up to 49% with multi-book Smart Bundles. Stock is updated in real time.
          </p>
        </div>

        {/* Sort Filter Dropdown */}
        <div className="flex items-center gap-3 self-start md:self-end">
          <SlidersHorizontal className="w-4 h-4 text-[#6D86A0]" />
          <span className="text-xs font-bold text-[#6D86A0] font-heading uppercase">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold bg-white border border-[#CED7DF] rounded-xl px-3 py-2 text-[#0B3561] focus:outline-hidden focus:border-[#12A5B0] shadow-2xs cursor-pointer font-heading"
          >
            <option value="bestseller">Recommended & Bestsellers</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated (★)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-5 scrollbar-none font-heading text-xs uppercase tracking-wider">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0B3561] text-white shadow-md'
                  : cat.highlight
                  ? 'bg-[#DDF3F4] text-[#12A5B0] hover:bg-[#c2ebed] border border-[#A0DBDF]'
                  : 'bg-white text-[#3C5D81] hover:bg-[#E7EBEF] hover:text-[#0B3561] border border-[#CED7DF]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Active Search Filter Badge */}
      {searchQuery && (
        <div className="mb-6 flex items-center gap-2 bg-[#DDF3F4] border border-[#A0DBDF] rounded-2xl p-3 text-xs text-[#0B3561]">
          <span>Filtering by search: &ldquo;{searchQuery}&rdquo;</span>
          <button
            onClick={() => setSearchQuery('')}
            className="ml-auto font-bold text-[#12A5B0] hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#CED7DF] p-8">
          <SearchX className="w-12 h-12 text-[#9DAEC0] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0B3561] font-heading">No products found</h3>
          <p className="text-[#6D86A0] text-xs mt-1 font-body">
            We couldn&apos;t find any books matching &ldquo;{searchQuery}&rdquo;. Try another subject or reset filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 bg-[#0B3561] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#071E38] cursor-pointer font-heading uppercase"
          >
            View All Products
          </button>
        </div>
      )}
    </section>
  );
};
