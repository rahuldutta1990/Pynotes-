import React from 'react';
import { Truck, Layers, Workflow, ShieldCheck, Star } from 'lucide-react';

export const TrustTicker: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: "Free Express Delivery",
      subtitle: "Across India",
      desc: "Dispatched from Bangalore and Delhi hubs within 24 hours. Reaches your desk in 2-4 business days with live SMS tracking.",
      accent: "text-[#12A5B0]",
      glow: "group-hover:shadow-[#12A5B0]/20"
    },
    {
      icon: Layers,
      title: "100 GSM Premium Paper",
      subtitle: "Non-Bleed & Ultra-White",
      desc: "Super-heavy opaque sheets designed for heavy highlighters. Double-sided high-contrast print with lay-flat spiral binding.",
      accent: "text-[#FFD54A]",
      glow: "group-hover:shadow-[#FFD54A]/20"
    },
    {
      icon: Workflow,
      title: "Visual Memory Models",
      subtitle: "Engineered for Retention",
      desc: "Ditch the dry text blocks. Hand-sketched system pipelines, flowcharts, and memory anchors that help you revise in hours.",
      accent: "text-[#12A5B0]",
      glow: "group-hover:shadow-[#12A5B0]/20"
    },
    {
      icon: ShieldCheck,
      title: "Cash on Delivery",
      subtitle: "+ 48h Direct Support",
      desc: "Pay securely at your door using cash or UPI. Dedicated email and WhatsApp support guarantees resolution within 48 hours.",
      accent: "text-[#FFD54A]",
      glow: "group-hover:shadow-[#FFD54A]/20"
    }
  ];

  return (
    <section className="relative bg-[#071E38] text-white py-12 lg:py-16 overflow-hidden border-b border-white/10">
      {/* Background radial glowing accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-[#12A5B0]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-[#FFD54A]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Subtle, premium header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#A0DBDF] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12A5B0]" />
              <span>Premium Publishing Standards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
              Crafted for students who value <span className="text-[#12A5B0]">depth over speed</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 hover:bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-3 px-4 shrink-0 transition-all duration-300">
            <div className="flex -space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-[#071E38] bg-[#12A5B0] overflow-hidden flex items-center justify-center text-[8px] font-bold text-white">
                  {i === 1 ? '🎓' : i === 2 ? '💻' : i === 3 ? '🚀' : '✨'}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold font-heading">4.9/5 Rating</span>
                <div className="flex">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-3 h-3 fill-[#FFD54A] text-[#FFD54A] shrink-0" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-[#CED7DF] font-medium">45,000+ happy engineers across India</p>
            </div>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={idx} 
                className="group relative bg-gradient-to-b from-white/5 to-transparent hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Glowing Icon Base */}
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-[#071E38] group-hover:border-white/20 group-hover:scale-105 shadow-inner`}>
                    <IconComponent className={`w-5 h-5 ${item.accent} transition-transform duration-300 group-hover:rotate-6`} />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1 mb-3">
                    <h3 className="font-heading font-black text-base text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-[#A0DBDF] tracking-wide">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#CED7DF] leading-relaxed font-body">
                    {item.desc}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">Active standard</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12A5B0]" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
