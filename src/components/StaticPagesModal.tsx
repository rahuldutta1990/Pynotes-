import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, BookOpen, HelpCircle, Truck, RotateCcw, Shield } from 'lucide-react';

export const StaticPagesModal: React.FC = () => {
  const { activeStaticPage, setActiveStaticPage } = useStore();

  if (!activeStaticPage) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071E38]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl border border-[#CED7DF]/50 ring-1 ring-black/5 relative flex flex-col p-6 sm:p-10">
        <button
          onClick={() => setActiveStaticPage(null)}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. FAQ PAGE */}
        {activeStaticPage === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 font-serif">
                  Frequently Asked Questions (FAQ)
                </h2>
                <p className="text-xs text-stone-500">
                  Everything you need to know about Pynotes printed books and orders
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-extrabold text-stone-900 text-sm">
                  1. Are these physical printed books or digital PDF downloads?
                </div>
                <p className="text-stone-600 leading-relaxed">
                  These are <strong>100% physical printed books</strong>! Every book is spiral-bound with twin-loop wire so it lies completely flat on your study desk, printed on premium 100 GSM non-bleed opaque paper. We do not sell PDFs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-extrabold text-stone-900 text-sm">
                  2. Is Cash on Delivery (COD) available in my area?
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Yes! We offer Cash on Delivery across all 28 states and Union Territories in India. COD orders incur a nominal ₹49 handling fee. Please note that our team makes a quick phone or WhatsApp confirmation call before dispatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-extrabold text-stone-900 text-sm">
                  3. How does the 10% Prepaid Discount work?
                </div>
                <p className="text-stone-600 leading-relaxed">
                  When you choose Prepaid at checkout and pay online using UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, or NetBanking via Razorpay, you receive an immediate extra 10% discount subtracted from your total!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-extrabold text-stone-900 text-sm">
                  4. How long does shipping and delivery take?
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Orders are processed and packed in 1 to 2 business days. Delivery takes 3 to 5 business days for major metropolitan areas (Delhi NCR, Bengaluru, Mumbai, Hyderabad, Chennai, Kolkata, Pune) and 5 to 7 days for tier-2/tier-3 cities.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-extrabold text-stone-900 text-sm">
                  5. How do Smart Bundles work?
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Smart Bundles combine multiple subject books (e.g. Python + Java or The Core 4 Developer Pack) at a discounted price of up to 49% OFF. Bundles dynamically sync stock with the component books.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. SHIPPING & DELIVERY */}
        {activeStaticPage === 'shipping' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 font-serif">
                  Shipping & Fulfillment Policy
                </h2>
                <p className="text-xs text-stone-500">Pan-India express logistics partners</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <p>
                <strong>Delivery Partners:</strong> All consignments are routed through premier national courier partners including Delhivery Express, Blue Dart Surface, and Shadowfax via Shiprocket integration.
              </p>
              <p>
                <strong>Processing Timeline:</strong> Orders placed before 2:00 PM IST on working days are packed and assigned an AWB tracking number on the same day. Handover to couriers occurs within 24 to 48 hours.
              </p>
              <p>
                <strong>Tracking Notifications:</strong> You will receive real-time SMS and email updates containing your Shiprocket tracking link once your parcel is scanned at the hub.
              </p>
              <p>
                <strong>COD Order Dispatch:</strong> Because couriers charge Return-to-Origin (RTO) fees on refused parcels, all Cash on Delivery orders require positive telephonic or WhatsApp confirmation from the buyer prior to shipping label generation.
              </p>
            </div>
          </div>
        )}

        {/* 3. REFUND & CANCELLATION */}
        {activeStaticPage === 'refund' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 font-serif">
                  Cancellation & 48-Hour Return Policy
                </h2>
                <p className="text-xs text-stone-500">Clear and transparent consumer protection</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <p>
                <strong>Cancellation:</strong> You may cancel any order free of charge at any time before the parcel is marked as dispatched. For prepaid orders, a 100% refund is initiated back to your original payment method within 24 hours.
              </p>
              <p>
                <strong>48-Hour Damaged / Incorrect Item Replacement:</strong> In the rare event that your book arrives with bent wire spirals, severe print damage, or the wrong subject book was packaged, you must report the issue within <strong>48 hours of delivery</strong> using our online claim form. We dispatch a fresh replacement copy with zero shipping fees.
              </p>
              <p>
                <strong>Restock Routine:</strong> Cancelled orders automatically restore inventory to the master catalog.
              </p>
            </div>
          </div>
        )}

        {/* 4. PRIVACY POLICY */}
        {activeStaticPage === 'privacy' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 font-serif">
                  Privacy Policy & DPDP Act 2023 Compliance
                </h2>
                <p className="text-xs text-stone-500">Commitment to customer data security</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <p>
                Pynotes Educational Media LLP respects your privacy in accordance with the provisions of India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act).
              </p>
              <p>
                <strong>Data Collected:</strong> We collect customer names, shipping addresses, telephone numbers, and email addresses solely for the express purpose of processing physical book orders, generating MarginsMinds GST tax invoices, and transmitting delivery tracking coordinates.
              </p>
              <p>
                <strong>Payment Security:</strong> Card numbers, UPI PINs, and banking credentials never touch our servers. All financial transactions are securely processed by RBI-licensed payment aggregators (Razorpay).
              </p>
              <p>
                <strong>Data Retention & Deletion:</strong> Tax invoices are retained in accordance with Indian statutory accounting requirements. Customers may request erasure of non-tax operational records by contacting {useStore().settings.supportEmail}.
              </p>
            </div>
          </div>
        )}

        {/* 5. ABOUT */}
        {activeStaticPage === 'about' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 font-serif">
                  About Pynotes
                </h2>
                <p className="text-xs text-stone-500">Crafted by engineers, for engineers</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <p>
                Pynotes was founded by software engineers who noticed a critical flaw in modern computer science education: programming textbooks are dry, unengaging, and filled with academic fluff that nobody asks in real-world interviews.
              </p>
              <p>
                We set out to create the notes we wish we had during college and placement prep: <strong>visual mental models, memory allocation schematics, execution trees, and crisp handwritten diagrams</strong> that explain complex engineering ideas in minutes instead of weeks.
              </p>
              <p>
                Today, over 45,000 students and working developers across India rely on Pynotes printed books to prepare for college exams and crack technical interviews at leading tech companies.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
