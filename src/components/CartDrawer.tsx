import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateCartQuantity,
    removeFromCart,
    openCheckout,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    cartCouponDiscount,
    cartPrepaidDiscount,
    cartShippingFee
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - cartCouponDiscount + cartShippingFee);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#071E38]/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={closeCart}
    >
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white h-screen max-h-screen shadow-2xl flex flex-col border-l border-[#CED7DF] animate-in slide-in-from-right duration-250 font-body overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#CED7DF] flex items-center justify-between bg-[#F7FAFC] shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#12A5B0]" />
            <h2 className="text-lg font-black text-[#0B3561] font-heading">
              Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-[#6D86A0] hover:text-[#0B3561] rounded-lg hover:bg-[#E7EBEF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-[#DDF3F4] px-5 py-3 border-b border-[#A0DBDF] shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-[#0B3561] mb-1.5 font-heading">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#12A5B0]" />
              <span>Free Express Delivery Across India</span>
            </span>
            <span className="text-[#12A5B0] font-black">UNLOCKED 🎉</span>
          </div>
          <div className="w-full bg-[#A0DBDF] h-2 rounded-full overflow-hidden">
            <div className="bg-[#12A5B0] h-full w-full rounded-full transition-all"></div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {cart.length > 0 ? (
            cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3.5 p-3 rounded-2xl border border-[#CED7DF] bg-[#F7FAFC] hover:bg-white transition-colors"
              >
                {/* Book Thumbnail */}
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-18 h-22 object-cover rounded-xl border border-[#CED7DF] shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-extrabold text-xs text-[#0B3561] line-clamp-2 leading-snug font-heading">
                        {product.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-[#9DAEC0] hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#12A5B0] font-bold mt-0.5 font-heading">
                      {product.isBundle ? '✨ Smart Bundle' : 'Single Book'} ({product.pages} pgs)
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E7EBEF]">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-[#CED7DF] rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="px-2 py-1 text-[#0B3561] hover:bg-[#E7EBEF] text-xs font-bold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 py-1 text-xs font-black text-[#0B3561] min-w-6 text-center font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stockQuantity}
                        className="px-2 py-1 text-[#0B3561] hover:bg-[#E7EBEF] text-xs font-bold cursor-pointer disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <div className="text-sm font-black text-[#0B3561] font-mono">
                        ₹{(product.salePrice * quantity).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#9DAEC0] line-through font-mono">
                        ₹{(product.regularPrice * quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#9DAEC0] mx-auto" />
              <div className="font-bold text-[#0B3561] font-heading">Your cart is empty</div>
              <p className="text-xs text-[#6D86A0] max-w-xs mx-auto">
                Explore our printed handwritten coding notes and smart bundles to start learning visually.
              </p>
              <button
                onClick={closeCart}
                className="mt-2 bg-[#0B3561] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#071E38] transition-colors cursor-pointer font-heading uppercase"
              >
                Browse All Books
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer with Pricing & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#CED7DF] bg-[#F7FAFC] space-y-3 shrink-0">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#DDF3F4] border border-[#A0DBDF] rounded-xl px-3 py-2 text-xs font-bold text-[#0B3561]">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#12A5B0]" />
                    <span>
                      Coupon <strong className="font-mono">{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% OFF)
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[#6D86A0] hover:text-red-600 font-bold ml-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. HC10)"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      className="flex-1 bg-white border border-[#CED7DF] rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#12A5B0] uppercase font-mono font-bold"
                    />
                    <button
                      type="submit"
                      className="bg-[#0B3561] hover:bg-[#071E38] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer font-heading uppercase"
                    >
                      Apply
                    </button>
                  </div>
                  {/* Coupon quick suggestion chips */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6D86A0] pt-1 flex-wrap">
                    <span>Try coupons:</span>
                    <button
                      type="button"
                      onClick={() => applyCoupon('PYNOTES10')}
                      className="bg-[#DDF3F4] text-[#0B3561] border border-[#A0DBDF] px-2 py-0.5 rounded-lg font-mono font-bold hover:bg-[#c6ecf0] cursor-pointer"
                    >
                      PYNOTES10
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCoupon('HC10')}
                      className="bg-[#FFD54A] text-[#071E38] px-2 py-0.5 rounded-lg font-mono font-bold hover:bg-[#ffe17d] cursor-pointer"
                    >
                      HC10
                    </button>
                  </div>
                  {couponError && (
                    <div className="text-[11px] text-red-600 font-medium pt-1">
                      {couponError}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Prepaid Discount Teaser Banner */}
            <div className="bg-[#DDF3F4] border border-[#A0DBDF] rounded-xl p-2.5 text-xs text-[#0B3561] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold font-heading">
                <Sparkles className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                <span>Prepaid Bonus:</span>
              </div>
              <span className="font-black text-[#12A5B0] font-mono">
                Save extra ₹{cartPrepaidDiscount} via UPI / Cards!
              </span>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-[#3C5D81] pt-1">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#0B3561] font-mono">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-[#12A5B0] font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">- ₹{cartCouponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping (India Express)</span>
                <span className="font-bold text-[#12A5B0]">FREE</span>
              </div>

              <div className="flex justify-between text-base font-black text-[#0B3561] pt-2 border-t border-[#CED7DF] font-heading">
                <span>Estimated Total</span>
                <span className="font-mono">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={openCheckout}
              className="w-full bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm font-heading uppercase tracking-wider"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Payment Trust Icons */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#6D86A0] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#12A5B0]" />
              <span>UPI • Google Pay • PhonePe • Cards • COD Available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
