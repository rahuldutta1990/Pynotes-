import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Zap, Star, Layers, CheckCircle, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProductForModal, openCheckout, navigateTo, wishlist, toggleWishlist, openQuickView } = useStore();

  const isSoldOut = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
  const discountPercent = Math.round(
    ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
  );

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    addToCart(product, 1);
    openCheckout();
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    addToCart(product, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        setSelectedProductForModal(product);
        navigateTo('product');
      }}
      onMouseEnter={() => openQuickView(product)}
      className="group bg-white rounded-3xl border border-[#CED7DF] overflow-hidden shadow-2xs hover:shadow-xl hover:border-[#12A5B0] transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Product Image / Mockup Container */}
      <div className="relative aspect-4/3 sm:aspect-square bg-[#F7FAFC] overflow-hidden border-b border-[#E7EBEF]">
        <img
          src={product.coverImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="bg-[#FFD54A] text-[#071E38] font-black text-[11px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs font-heading">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#12A5B0] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-2xs font-heading">
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        {/* Bundle Tag */}
        {product.isBundle && (
          <div className="absolute bottom-3 left-3 bg-[#071E38]/90 backdrop-blur-xs text-[#DDF3F4] text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-heading">
            <Layers className="w-3.5 h-3.5 text-[#12A5B0]" />
            <span>Smart Bundle ({product.bundledProductIds?.length} Books)</span>
          </div>
        )}

        {/* Pages badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <div className="bg-white/95 backdrop-blur-xs text-[#0B3561] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs font-mono">
            {product.pages} pgs
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-2xs border border-[#CED7DF] text-[#6D86A0] hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-extrabold text-[#12A5B0] uppercase tracking-wider text-[11px] font-heading">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[#071E38] font-bold">
              <Star className="w-3.5 h-3.5 fill-[#FFD54A] text-[#FFD54A]" />
              <span className="font-mono">{product.rating}</span>
              <span className="text-[#9DAEC0] font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-[#0B3561] text-base leading-snug line-clamp-2 group-hover:text-[#12A5B0] transition-colors font-heading">
            {product.title}
          </h3>

          {/* Short description */}
          <p className="text-[#6D86A0] text-xs mt-1.5 line-clamp-2 leading-relaxed font-body">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Stock & Actions */}
        <div className="mt-4 pt-3 border-t border-[#E7EBEF]">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-xl font-black text-[#0B3561] font-mono">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#9DAEC0] line-through ml-2 font-mono">
                ₹{product.regularPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Stock indicator */}
            {isSoldOut ? (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded font-heading">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="text-[11px] font-bold text-[#0B3561] bg-[#FFD54A]/40 px-2 py-0.5 rounded font-heading animate-pulse">
                Only {product.stockQuantity} left!
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#12A5B0] flex items-center gap-1 font-heading">
                <CheckCircle className="w-3 h-3 text-[#12A5B0]" />
                <span>In Stock</span>
              </span>
            )}
          </div>

          {/* Buttons: Buy Now & Add to Cart */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={handleQuickAdd}
              disabled={isSoldOut}
              className={`py-2.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all font-heading uppercase tracking-wider ${
                isSoldOut
                  ? 'bg-[#E7EBEF] text-[#9DAEC0] cursor-not-allowed'
                  : 'bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] active:scale-95 cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#0B3561]" />
              <span>Add</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isSoldOut}
              className={`py-2.5 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 transition-all font-heading uppercase tracking-wider ${
                isSoldOut
                  ? 'bg-[#E7EBEF] text-[#9DAEC0] cursor-not-allowed'
                  : 'bg-[#12A5B0] hover:bg-[#0e8a93] text-white shadow-xs active:scale-95 cursor-pointer'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
