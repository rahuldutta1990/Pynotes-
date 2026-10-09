import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import {
  ShoppingBag,
  Search,
  Truck,
  ChevronDown,
  User,
  UserCheck,
  LogOut,
  Package,
  Menu,
  X,
  Code,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    totalCartItems,
    openCart,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    openSpotlight,
    setIsTrackingModalOpen,
    currentUser,
    userSession,
    openAuthModal,
    logoutUser,
    extendUserSession,
    navigateTo,
    showToast
  } = useStore();

  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [isDsaMenuOpen, setIsDsaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeAnnouncements = settings.announcements?.filter((a) => a.active) || [];

  // Cycle announcements
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentAnnouncement = activeAnnouncements[currentAnnouncementIndex];

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`Copied code "${code}" to clipboard!`);
  };

  const navCategories = [
    { id: 'Python', label: 'Python' },
    { id: 'Java', label: 'Java' },
    { id: 'DSA', label: 'DSA', hasDropdown: true },
    { id: 'C/C++', label: 'C / C++' },
    { id: 'Systems', label: 'Systems' },
    { id: 'Web Dev', label: 'Web Dev' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7FAFC]/95 backdrop-blur-md border-b border-[#CED7DF] shadow-xs">
      {/* 1. TOP ANNOUNCEMENT BAR (Clean, no admin button) */}
      {currentAnnouncement && (
        <div className="bg-[#071E38] text-[#DDF3F4] text-xs font-medium py-1.5 px-4 transition-all border-b border-[#0B3561]">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="flex items-center justify-center gap-2 overflow-hidden text-center">
              <span className="inline-block text-[#FFD54A] animate-pulse">⚡</span>
              <span className="truncate text-[11px] sm:text-xs">{currentAnnouncement.text}</span>
              {currentAnnouncement.highlight && (
                <button
                  onClick={() => handleCopyCode('HC10')}
                  className="bg-[#FFD54A] text-[#071E38] font-black px-2 py-0.5 rounded text-[10px] sm:text-[11px] tracking-wide hover:bg-[#ffe17d] transition-colors uppercase cursor-pointer"
                  title="Click to copy coupon code"
                >
                  {currentAnnouncement.highlight}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SLICK & ELEGANT MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 lg:gap-6">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#0B3561] hover:text-[#12A5B0] rounded-xl hover:bg-[#E7EBEF] focus:outline-hidden cursor-pointer transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* PyNotes Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                navigateTo('store');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="focus:outline-hidden cursor-pointer py-1 group"
              aria-label="PyNotes Home"
            >
              <BrandLogo height={settings.logoHeight || 42} showTagline={true} />
            </button>
          </div>

          {/* Desktop Navigation Links: Slick, balanced, elegant */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navCategories.map((cat) => {
              if (cat.hasDropdown) {
                return (
                  <div
                    key={cat.id}
                    className="relative"
                    onMouseLeave={() => setIsDsaMenuOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory('DSA');
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onMouseEnter={() => setIsDsaMenuOpen(true)}
                      className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all flex items-center gap-1 cursor-pointer font-heading ${
                        selectedCategory === 'DSA'
                          ? 'text-[#12A5B0] bg-[#DDF3F4]'
                          : 'text-[#0B3561] hover:text-[#12A5B0] hover:bg-[#E7EBEF]/60'
                      }`}
                    >
                      <span>DSA</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isDsaMenuOpen ? 'rotate-180 text-[#12A5B0]' : ''
                        }`}
                      />
                    </button>

                    {/* DSA Dropdown Menu */}
                    {isDsaMenuOpen && (
                      <div className="absolute left-0 mt-1 w-60 bg-white rounded-2xl shadow-xl border border-[#CED7DF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6D86A0] font-heading">
                          Data Structures & Algorithms
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory('DSA');
                            setSearchQuery('Python');
                            setIsDsaMenuOpen(false);
                            const el = document.getElementById('catalog-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#0B3561] hover:bg-[#DDF3F4] hover:text-[#12A5B0] flex items-center justify-between cursor-pointer"
                        >
                          <span>DSA with Python</span>
                          <span className="text-[10px] text-[#12A5B0] font-bold bg-[#DDF3F4] px-1.5 py-0.5 rounded">15 Patterns</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategory('DSA');
                            setSearchQuery('Java');
                            setIsDsaMenuOpen(false);
                            const el = document.getElementById('catalog-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#0B3561] hover:bg-[#DDF3F4] hover:text-[#12A5B0] flex items-center justify-between cursor-pointer"
                        >
                          <span>DSA with Java</span>
                          <span className="text-[10px] text-[#0B3561] font-bold bg-[#E7EBEF] px-1.5 py-0.5 rounded">Interview Prep</span>
                        </button>
                        <div className="border-t border-[#E7EBEF] mt-1 pt-1">
                          <button
                            onClick={() => {
                              setSelectedCategory('DSA');
                              setSearchQuery('');
                              setIsDsaMenuOpen(false);
                              const el = document.getElementById('catalog-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-[#12A5B0] hover:bg-[#DDF3F4] cursor-pointer"
                          >
                            Explore All DSA Notes &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all cursor-pointer font-heading whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'text-[#12A5B0] bg-[#DDF3F4]'
                      : 'text-[#0B3561] hover:text-[#12A5B0] hover:bg-[#E7EBEF]/60'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Group: Spotlight Search, Track Order, User Login, Cart (ALL ICON-ONLY) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* 1. Apple-Style Spotlight Search (Only Icon) */}
            <button
              onClick={openSpotlight}
              className="p-2 sm:p-2.5 rounded-full border border-[#CED7DF] hover:border-[#12A5B0] bg-white hover:bg-[#DDF3F4] text-[#0B3561] hover:text-[#12A5B0] transition-all cursor-pointer shadow-2xs group flex items-center gap-1.5 shrink-0"
              title="Spotlight Search Notes (⌘K)"
              aria-label="Spotlight Search"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0B3561] group-hover:text-[#12A5B0] transition-colors" />
              <kbd className="hidden xl:inline-block text-[9px] font-mono font-bold text-[#6D86A0] bg-[#E7EBEF] px-1.5 py-0.2 rounded border border-[#CED7DF]">
                ⌘K
              </kbd>
            </button>

            {/* 2. Track Order (ONLY ICON) */}
            <button
              onClick={() => setIsTrackingModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-full border border-[#CED7DF] hover:border-[#12A5B0] bg-white hover:bg-[#DDF3F4] text-[#0B3561] hover:text-[#12A5B0] transition-all cursor-pointer shadow-2xs group shrink-0"
              title="Track Order (Shiprocket)"
              aria-label="Track Order"
            >
              <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0B3561] group-hover:text-[#12A5B0] transition-colors" />
            </button>

            {/* 3. User Login / Student Session (ONLY ICON) */}
            <div className="relative" ref={userMenuRef}>
              {currentUser ? (
                // Authenticated Student Avatar & Menu (Only Icon)
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="relative p-1 rounded-full border border-[#A0DBDF] bg-[#DDF3F4] hover:bg-[#cbebee] transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
                    title={`Active Student: ${currentUser.name}`}
                    aria-label="Student Account"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#12A5B0] text-white flex items-center justify-center font-black text-xs sm:text-sm font-heading shadow-2xs">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </button>

                  {/* Account Dropdown with Live Session Information */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#CED7DF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left font-body">
                      <div className="px-4 py-2.5 border-b border-[#E7EBEF]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-[#0B3561] truncate font-heading">{currentUser.name}</p>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-heading">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Active</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6D86A0] truncate">{currentUser.email}</p>
                        {userSession && (
                          <div className="mt-2 pt-2 border-t border-[#E7EBEF]/60 flex items-center justify-between text-[10px] text-[#6D86A0]">
                            <span className="flex items-center gap-1 font-mono">
                              <ShieldCheck className="w-3 h-3 text-teal-600" />
                              <span>256-Bit SSL</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                extendUserSession();
                              }}
                              className="text-[10px] text-[#12A5B0] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                              title="Keep session alive"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Renew Session</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigateTo('account');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#0B3561] hover:bg-[#DDF3F4] hover:text-[#12A5B0] flex items-center gap-2 cursor-pointer font-heading"
                      >
                        <User className="w-4 h-4 text-[#12A5B0]" />
                        <span>My Account & Orders</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsTrackingModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0B3561] hover:bg-[#DDF3F4] flex items-center gap-2 cursor-pointer"
                      >
                        <Truck className="w-4 h-4 text-[#6D86A0]" />
                        <span>Track Courier Parcel</span>
                      </button>
                      <div className="border-t border-[#E7EBEF] mt-1 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logoutUser();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Unauthenticated: User Login (Only Icon)
                <button
                  onClick={() => openAuthModal('login')}
                  className="p-2 sm:p-2.5 rounded-full border border-[#CED7DF] hover:border-[#12A5B0] bg-white hover:bg-[#DDF3F4] text-[#0B3561] hover:text-[#12A5B0] transition-all cursor-pointer shadow-2xs group shrink-0"
                  title="Student Login / Sign Up"
                  aria-label="Student Login"
                >
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0B3561] group-hover:text-[#12A5B0] group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>

            {/* 4. Cart (ONLY ICON) */}
            <button
              onClick={openCart}
              className="relative p-2 sm:p-2.5 rounded-full bg-[#0B3561] hover:bg-[#071E38] text-white transition-all active:scale-95 cursor-pointer shadow-sm shrink-0 flex items-center justify-center"
              title={`Shopping Cart (${totalCartItems} items)`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#12A5B0] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs font-mono">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-[#CED7DF]">
            <div className="flex items-center bg-white rounded-xl px-3 py-2 border border-[#CED7DF]">
              <Search className="w-4 h-4 text-[#6D86A0] mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search Python, Java, DSA, Systems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full focus:outline-hidden text-[#071E38]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-stone-500 text-sm px-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#CED7DF] bg-[#F7FAFC] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* Mobile User Account / Sign In */}
          <div className="pb-2 border-b border-[#CED7DF]">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#12A5B0] text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0B3561]">{currentUser.name}</p>
                    <p className="text-[10px] text-[#6D86A0]">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateTo('account');
                  }}
                  className="text-xs font-bold text-[#12A5B0] bg-[#DDF3F4] px-3 py-1.5 rounded-lg"
                >
                  My Account
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full bg-[#0B3561] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 font-heading"
              >
                <User className="w-4 h-4 text-[#12A5B0]" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6D86A0] px-1 font-heading">
            Browse Subjects
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-bold font-heading">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setIsMobileMenuOpen(false);
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left px-3 py-2 rounded-xl transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#12A5B0] text-white'
                    : 'bg-white border border-[#CED7DF] text-[#0B3561] hover:bg-[#E7EBEF]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#CED7DF]">
            <button
              onClick={() => {
                setIsTrackingModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-white border border-[#CED7DF] text-[#0B3561] text-xs font-bold py-2.5 rounded-xl hover:bg-[#E7EBEF]"
            >
              <Truck className="w-4 h-4 text-[#12A5B0]" />
              <span>Track Courier (Shiprocket)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
