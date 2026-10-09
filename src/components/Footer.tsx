import React from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import {
  Truck,
  Phone,
  Mail,
  Sparkles,
  Code2,
  Coffee,
  GitBranch,
  Cpu,
  Layers,
  Globe,
  ShieldAlert,
  HelpCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  User,
  MapPin,
  Clock3
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    settings,
    setSelectedCategory,
    setIsTrackingModalOpen,
    setIsReportIssueModalOpen,
    setActiveStaticPage,
    navigateTo
  } = useStore();

  return (
    <footer className="bg-[#071E38] text-[#CED7DF] border-t border-[#0B3561] text-xs font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          {/* Col 1: Brand Logo & Bio */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-4">
            <div className="flex items-center">
              <BrandLogo variant="white" height={settings.logoHeight || 42} showTagline={true} />
            </div>

            <p className="text-[#9DAEC0] text-xs max-w-xs leading-relaxed">
              PyNotes makes printed, handwritten coding notes: Python, Java, C, and DSA,
              laid out the way a good student writes them, with the visual shortcuts,
              diagrams, and margin notes that textbooks leave out.
            </p>

            <div className="space-y-1 text-[#9DAEC0] text-[11px] pt-1">
              <div>
                <strong>Legal Entity:</strong> {settings.legalEntity || 'Pynotes Educational Media LLP'}
              </div>
              <div>
                <strong>GSTIN:</strong>{' '}
                <span className="font-mono text-[#12A5B0]">{settings.gstin || '07AAECP4108K1Z5'}</span>
              </div>
              <div>
                <strong>HSN Code:</strong> 4901 (Educational Printed Books & Leaflets)
              </div>
            </div>
          </div>

          {/* Col 2: Subjects & Bundles - All links strictly in ONE line (No wrap/break) */}
          <div className="lg:col-span-3 space-y-3 min-w-[200px]">
            <h4 className="text-white font-extrabold uppercase tracking-wider text-xs font-heading">
              Catalogue
            </h4>
            <ul className="space-y-2.5 text-[#9DAEC0]">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Bundles');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#12A5B0] transition-colors flex items-center gap-2 cursor-pointer font-bold text-[#DDF3F4] whitespace-nowrap text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD54A] shrink-0" />
                  <span className="whitespace-nowrap">Smart Bundles (Save 49%)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Python');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Python Simplified Notes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Java');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Coffee className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Java & OOPs Visual Guide</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('DSA');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">DSA (Python & Java)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('C/C++');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">C & C++ STL Master</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Systems');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Operating Systems & Networks</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory('Web Dev');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Globe className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">JavaScript, React & SQL</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies - All links strictly in ONE line (No wrap/break) */}
          <div className="lg:col-span-3 space-y-3 min-w-[230px]">
            <h4 className="text-white font-extrabold uppercase tracking-wider text-xs font-heading">
              Orders & Policies
            </h4>
            <ul className="space-y-2.5 text-[#9DAEC0]">
              <li>
                <button
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="hover:text-[#12A5B0] transition-colors flex items-center gap-2 cursor-pointer font-semibold text-[#DDF3F4] whitespace-nowrap"
                >
                  <Truck className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Track Courier (Shiprocket)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsReportIssueModalOpen(true)}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FFD54A] shrink-0" />
                  <span className="whitespace-nowrap">48-Hour Damaged Item Claim</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveStaticPage('faq')}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Frequently Asked Questions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveStaticPage('shipping')}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Clock className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Shipping & Delivery Timeline</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveStaticPage('refund')}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Cancellation & Refund Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveStaticPage('privacy')}
                  className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                  <span className="whitespace-nowrap">Privacy Policy (DPDP Act 2023)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Student Account */}
          <div className="lg:col-span-2 space-y-3 min-w-[180px]">
            <h4 className="text-white font-extrabold uppercase tracking-wider text-xs font-heading">
              Support & Account
            </h4>
            <div className="space-y-2.5 text-[#9DAEC0] text-xs">
              <a
                href={`tel:${settings.supportPhone || '+919876543210'}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                <span>{settings.supportPhone || '+91 98765 43210'}</span>
              </a>

              <a
                href={`mailto:${settings.supportEmail || 'support@pynotes.in'}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                <span>{settings.supportEmail || 'support@pynotes.in'}</span>
              </a>

              <button
                onClick={() => navigateTo('account')}
                className="flex items-center gap-2 hover:text-white text-[#DDF3F4] transition-colors cursor-pointer text-left"
              >
                <User className="w-3.5 h-3.5 text-[#12A5B0] shrink-0" />
                <span>Student Account & Orders</span>
              </button>

              <div className="flex items-center gap-2 text-[#9DAEC0] text-[11px] pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#6D86A0] shrink-0" />
                <span>Pan-India Courier Dispatch Center</span>
              </div>

              <div className="flex items-center gap-2 text-[#9DAEC0] text-[11px]">
                <Clock3 className="w-3.5 h-3.5 text-[#6D86A0] shrink-0" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#0B3561] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#6D86A0] text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} PyNotes Educational Media LLP. All rights reserved.
            LEARN &bull; WRITE &bull; GROW
          </div>

          <div className="flex items-center gap-2 text-[#9DAEC0]">
            <span>Accepted Payments:</span>
            <span className="font-semibold text-white">
              UPI • GPay • PhonePe • RuPay • Visa • Mastercard • Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
