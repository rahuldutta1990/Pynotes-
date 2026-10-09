import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  CheckCircle,
  Layers,
  MapPin,
  Eye,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { validatePincode, validateReview } from '../utils/validation';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addToCart,
    openCheckout,
    products,
    reviews,
    currentUser,
    handleAddReview,
    showToast
  } = useStore();

  const product = selectedProductForModal;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState(() => currentUser?.name || '');
  const [reviewerCollege, setReviewerCollege] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!product) return null;

  const isSoldOut = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
  const discountPercent = Math.round(
    ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
  );

  const allImages = [product.coverImage, ...(product.sampleImages || [])];

  const relatedBundles = products.filter(
    (p) => p.isBundle && p.bundledProductIds?.includes(product.id)
  );

  const componentBooks = product.isBundle
    ? products.filter((p) => product.bundledProductIds?.includes(p.id))
    : [];

  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.replace(/\D/g, '');
    const pinRes = validatePincode(cleanPin);
    if (!pinRes.isValid) {
      setPincodeResult({
        checked: true,
        valid: false,
        message: pinRes.message || 'Please enter a valid 6-digit Indian PIN code.'
      });
      return;
    }
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 4);
    const dateStr = estDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const stateText = pinRes.detectedState ? ` (${pinRes.detectedState})` : '';
    setPincodeResult({
      checked: true,
      valid: true,
      message: `Fast doorstep delivery to PIN ${cleanPin}${stateText} by ${dateStr} via Delhivery Express. COD available.`
    });
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addToCart(product, quantity);
    setSelectedProductForModal(null);
    openCheckout();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    const reviewVal = validateReview(reviewerName, reviewComment, reviewRating);
    if (!reviewVal.isValid) {
      const firstErr = Object.values(reviewVal.errors)[0];
      setReviewError(firstErr);
      return;
    }

    await handleAddReview({
      id: `rev-${Date.now()}`,
      productId: product.id,
      customerName: reviewerName.trim(),
      college: reviewerCollege.trim() || (currentUser ? 'Verified Student' : 'Engineering Student'),
      rating: reviewRating,
      comment: reviewComment.trim(),
      verified: true,
      date: new Date().toISOString().split('T')[0]
    });
    showToast('Thank you! Your verified student review was posted live.');
    setReviewComment('');
    setReviewError(null);
    setShowReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#CED7DF] relative flex flex-col font-body">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductForModal(null)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#F7FAFC] hover:bg-[#E7EBEF] text-[#0B3561] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Gallery & Handwritten Sample Flipper */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative aspect-4/3 sm:aspect-square bg-[#F7FAFC] rounded-2xl overflow-hidden border border-[#CED7DF] shadow-inner">
                <img
                  src={allImages[activeImageIndex] || product.coverImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-1.5 font-heading">
                  {product.badge && (
                    <span className="bg-[#FFD54A] text-[#071E38] font-black text-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                      {product.badge}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-[#12A5B0] text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow-xs">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 bg-[#071E38]/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full font-mono">
                  Page {activeImageIndex + 1} of {allImages.length}
                </div>
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div>
                  <div className="text-[11px] font-bold text-[#3C5D81] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-heading">
                    <Eye className="w-3.5 h-3.5 text-[#12A5B0]" />
                    <span>Click to preview sample handwritten notes:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#12A5B0] ring-2 ring-[#DDF3F4] scale-105'
                            : 'border-[#CED7DF] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical specifications */}
              <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-[#CED7DF] text-xs space-y-2">
                <div className="font-extrabold text-[#0B3561] uppercase tracking-wider text-[11px] font-heading">
                  Physical Book Specifications
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#3C5D81] pt-1">
                  <div>
                    <span className="text-[#9DAEC0]">Binding:</span> Twin-loop Wire Spiral
                  </div>
                  <div>
                    <span className="text-[#9DAEC0]">Paper:</span> 100 GSM Non-bleed
                  </div>
                  <div>
                    <span className="text-[#9DAEC0]">Pages:</span> {product.pages} Printed Pages
                  </div>
                  <div>
                    <span className="text-[#9DAEC0]">Format:</span> High-res Handwritten
                  </div>
                  <div>
                    <span className="text-[#9DAEC0]">HSN Code:</span> {product.hsnCode} (Books)
                  </div>
                  <div>
                    <span className="text-[#9DAEC0]">SKU:</span> {product.sku}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Details, Bundles & Purchase */}
            <div className="md:col-span-6 space-y-5 flex flex-col justify-between">
              <div>
                {/* Category & Rating */}
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#12A5B0] uppercase tracking-wider font-heading">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#071E38] font-bold">
                    <div className="flex text-[#FFD54A]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#FFD54A]" />
                      ))}
                    </div>
                    <span className="font-mono">{product.rating}</span>
                    <span className="text-[#9DAEC0] font-normal">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B3561] leading-tight font-heading">
                  {product.title}
                </h2>

                {/* Price block */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#0B3561] font-mono">
                    ₹{product.salePrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base text-[#9DAEC0] line-through font-mono">
                    ₹{product.regularPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-[#DDF3F4] text-[#12A5B0] text-xs font-black px-2.5 py-1 rounded-md font-heading">
                    SAVE ₹{(product.regularPrice - product.salePrice).toLocaleString('en-IN')} ({discountPercent}%)
                  </span>
                </div>

                {/* Stock status indicator */}
                <div className="mt-2 font-heading">
                  {isSoldOut ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                      <span>❌ Currently Sold Out</span>
                    </div>
                  ) : isLowStock ? (
                    <div className="bg-[#FFD54A]/30 border border-[#FFD54A] text-[#071E38] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 animate-pulse">
                      <span>🔥 Only {product.stockQuantity} copies remaining in stock!</span>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-[#12A5B0] flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#12A5B0]" />
                      <span>In Stock — Dispatched within 24 hours</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-[#3C5D81] text-xs sm:text-sm leading-relaxed">
                  {product.description}
                </p>

                {/* If bundle: list component books */}
                {product.isBundle && componentBooks.length > 0 && (
                  <div className="mt-4 bg-[#DDF3F4]/60 border border-[#A0DBDF] rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="font-bold text-[#0B3561] flex items-center gap-1.5 font-heading">
                      <Layers className="w-4 h-4 text-[#12A5B0]" />
                      <span>Included in this Smart Bundle ({componentBooks.length} books):</span>
                    </div>
                    <ul className="space-y-1 pl-5 list-disc text-[#071E38] font-medium">
                      {componentBooks.map((b) => (
                        <li key={b.id}>
                          <span>{b.title}</span>{' '}
                          <span className="text-[#6D86A0] text-[10px]">({b.stockQuantity} in stock)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* BUNDLE SWITCHER */}
                {!product.isBundle && relatedBundles.length > 0 && (
                  <div className="mt-4 p-3 bg-[#F7FAFC] border border-[#CED7DF] rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-[#0B3561] flex items-center gap-1.5 font-heading">
                      <Sparkles className="w-3.5 h-3.5 text-[#12A5B0]" />
                      <span>Upgrade to a Smart Bundle & Save Extra:</span>
                    </div>
                    <div className="space-y-1.5">
                      {relatedBundles.slice(0, 2).map((bundle) => (
                        <button
                          key={bundle.id}
                          onClick={() => setSelectedProductForModal(bundle)}
                          className="w-full text-left bg-white hover:bg-[#DDF3F4]/50 border border-[#CED7DF] hover:border-[#12A5B0] rounded-xl p-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                        >
                          <div>
                            <span className="font-bold text-[#0B3561] group-hover:text-[#12A5B0]">
                              {bundle.title}
                            </span>
                            <div className="text-[10px] text-[#6D86A0]">
                              Includes {product.category} + more subjects
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-[#12A5B0] font-mono">₹{bundle.salePrice}</span>
                            <span className="text-[10px] text-[#0B3561] bg-[#FFD54A] font-black px-1.5 py-0.2 rounded ml-1.5 font-heading">
                              {bundle.badge}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PINCODE DELIVERY CHECKER */}
                <div className="mt-4 p-3.5 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B3561] font-heading">
                    <MapPin className="w-3.5 h-3.5 text-[#12A5B0]" />
                    <span>Check Delivery & COD at Your Pincode:</span>
                  </div>
                  <form onSubmit={handleCheckPincode} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit PIN code (e.g. 560001)"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 bg-white border border-[#CED7DF] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#12A5B0] font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-[#0B3561] hover:bg-[#071E38] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer font-heading uppercase"
                    >
                      Check
                    </button>
                  </form>
                  {pincodeResult && (
                    <div
                      className={`text-xs p-2.5 rounded-xl font-medium ${
                        pincodeResult.valid
                          ? 'bg-[#DDF3F4] text-[#0B3561] border border-[#A0DBDF]'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {pincodeResult.message}
                    </div>
                  )}
                </div>

                {/* ORDER TIMELINE STRIP */}
                <div className="mt-4 pt-4 border-t border-[#E7EBEF]">
                  <div className="grid grid-cols-3 text-center text-[11px] gap-2 font-heading">
                    <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#CED7DF] text-[#0B3561]">
                      <div className="font-bold">1. Order Placed</div>
                      <div className="text-[10px] text-[#6D86A0]">Today</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#CED7DF] text-[#0B3561]">
                      <div className="font-bold">2. Dispatched</div>
                      <div className="text-[10px] text-[#6D86A0]">Within 24 Hours</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#DDF3F4] border border-[#12A5B0] font-bold text-[#0B3561]">
                      <div>3. Delivered</div>
                      <div className="text-[10px] text-[#12A5B0]">3 - 5 Days Pan-India</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="pt-4 border-t border-[#CED7DF] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#CED7DF] rounded-xl bg-[#F7FAFC] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isSoldOut || quantity <= 1}
                      className="px-3 py-2 text-[#0B3561] hover:bg-[#E7EBEF] font-bold text-sm cursor-pointer disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 font-black text-[#0B3561] text-sm min-w-8 text-center font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                      }
                      disabled={isSoldOut || quantity >= product.stockQuantity}
                      className="px-3 py-2 text-[#0B3561] hover:bg-[#E7EBEF] font-bold text-sm cursor-pointer disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all font-heading uppercase tracking-wider ${
                      isSoldOut
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-[#0B3561] hover:bg-[#071E38] text-white shadow-xs cursor-pointer active:scale-98'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#A0DBDF]" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isSoldOut}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all font-heading uppercase tracking-wider ${
                      isSoldOut
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-[#12A5B0] hover:bg-[#0e8a93] text-white shadow-md cursor-pointer active:scale-98'
                    }`}
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6D86A0] pt-1">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#12A5B0]" />
                    Free shipping across India
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#12A5B0]" />
                    48-Hour damaged replacement guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-12 pt-8 border-t border-[#CED7DF]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0B3561] font-heading">
                  Customer Reviews & Placements
                </h3>
                <p className="text-[#6D86A0] text-xs">
                  Genuine feedback from students who revised with PyNotes
                </p>
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#0B3561] px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer font-heading uppercase"
              >
                {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
              </button>
            </div>

            {/* Write Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleSubmitReview}
                className="mb-6 p-4 bg-[#F7FAFC] rounded-2xl border border-[#CED7DF] space-y-3"
              >
                <div className="font-bold text-sm text-[#0B3561] font-heading">
                  Share Your Learning Experience
                </div>
                {reviewError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="bg-white border border-[#CED7DF] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#12A5B0]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="College / Company (e.g. NIT / SDE Intern)"
                    value={reviewerCollege}
                    onChange={(e) => setReviewerCollege(e.target.value)}
                    className="bg-white border border-[#CED7DF] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#12A5B0]"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#0B3561]">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating
                            ? 'fill-[#FFD54A] text-[#FFD54A]'
                            : 'text-[#CED7DF]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="How did this book help your exams or interview prep?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-[#CED7DF] rounded-xl p-3 text-xs focus:outline-hidden focus:border-[#12A5B0]"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer font-heading uppercase"
                >
                  Post Review
                </button>
              </form>
            )}

            {/* Existing Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#CED7DF] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#12A5B0]/20 text-[#0B3561] font-bold text-xs flex items-center justify-center font-heading">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#0B3561] flex items-center gap-1.5 font-heading">
                            <span>{rev.customerName}</span>
                            {rev.verified && (
                              <span className="text-[10px] bg-[#DDF3F4] text-[#12A5B0] px-1.5 py-0.2 rounded font-bold">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          {rev.college && (
                            <div className="text-[10px] text-[#6D86A0]">{rev.college}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex text-[#FFD54A]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#FFD54A]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#3C5D81] leading-relaxed italic font-body">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <div className="text-[10px] text-[#9DAEC0] font-mono">{rev.date}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-[#9DAEC0] text-xs">
                  Be the first to review this book! Share your placement & exam prep feedback.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
