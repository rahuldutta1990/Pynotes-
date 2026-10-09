import React from 'react';
import { Truck, BookOpen, PenTool, ShieldCheck, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const TrustTicker: React.FC = () => {
  const { settings } = useStore();

  return (
    <div className="bg-[#DDF3F4]/70 border-y border-[#A0DBDF] py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm font-bold text-[#0B3561]">
        <div className="flex items-center justify-around w-full flex-wrap gap-y-2 gap-x-4">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#12A5B0] shrink-0" />
            <span>Free Express Delivery Across India</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#12A5B0] shrink-0" />
            <span>Printed on 100 GSM Non-Bleed Paper</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PenTool className="w-4 h-4 text-[#12A5B0] shrink-0" />
            <span>Visual Diagrams & Memory Models</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#12A5B0] shrink-0" />
            <span>Cash on Delivery + 48h Support</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#071E38] font-extrabold">
            <Star className="w-4 h-4 fill-[#FFD54A] text-[#FFD54A] shrink-0" />
            <span>4.9/5 (45k+ Happy Students)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
