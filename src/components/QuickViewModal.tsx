import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Zap, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const QuickViewModal: React.FC = () => {
  const { isQuickViewModalOpen, closeQuickView, selectedProductForQuickView, addToCart, openCheckout } = useStore();

  if (!isQuickViewModalOpen || !selectedProductForQuickView) return null;

  const product = selectedProductForQuickView;

  const handleQuickAdd = () => {
    addToCart(product, 1);
    closeQuickView();
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    openCheckout();
    closeQuickView();
  };

  return (
    <AnimatePresence>
      {isQuickViewModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-[#CED7DF]/50 ring-1 ring-black/5 relative flex flex-col font-body"
          >
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F7FAFC] text-[#6D86A0] transition-colors"
              aria-label="Close Quick View"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-64 object-cover rounded-2xl mb-4"
              />
              <h2 className="text-xl font-black text-[#0B3561] font-heading mb-2">{product.title}</h2>
              <div className="flex items-center gap-1 text-[#0B3561] font-bold text-sm mb-3">
                  <Star className="w-4 h-4 fill-[#FFD54A] text-[#FFD54A]" />
                  <span>{product.rating} ({product.reviewCount} reviews)</span>
              </div>
              <p className="text-[#6D86A0] text-sm mb-6">{product.shortDescription}</p>
              
              <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-black text-[#0B3561] font-mono">₹{product.salePrice.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-[#9DAEC0] line-through font-mono">₹{product.regularPrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleQuickAdd}
                  className="py-3 bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] rounded-xl font-bold text-sm transition-all"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3 bg-[#12A5B0] hover:bg-[#0e8a93] text-white rounded-xl font-bold text-sm transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
