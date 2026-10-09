import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus, SiteSettings } from '../../types';
import { BrandLogo } from '../BrandLogo';
import {
  X,
  LayoutDashboard,
  ShoppingBag,
  PhoneCall,
  Package,
  Layers,
  Settings,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Plus,
  Edit2,
  MessageCircle,
  RefreshCw,
  Search,
  DollarSign,
  Check,
  Upload,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Mail
} from 'lucide-react';
import {
  validateProductForm,
  validateStoreSettings,
  validateGstin
} from '../../utils/validation';
import { subscribeToNewsletterSubscribers } from '../../services/storeService';

interface AdminPanelProps {
  isStandalone?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isStandalone = false }) => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    currentRoute,
    navigateTo,
    adminLogout,
    adminSession,
    extendAdminSession,
    products,
    orders,
    settings,
    issueReports,
    handleUpdateStock,
    handleSaveProduct,
    handleUpdateOrderStatus,
    handleCancelOrder,
    handleRefundOrder,
    handleConfirmCod,
    handleSaveSettings,
    handleResetDemoData,
    setActiveOrderForInvoice,
    showToast
  } = useStore();

  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [settingsFormError, setSettingsFormError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'cod-call-list' | 'products' | 'stock' | 'settings' | 'issues' | 'newsletter'
  >('dashboard');

  // Newsletter subscribers state
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'newsletter') {
      const unsubscribe = subscribeToNewsletterSubscribers((data) => {
        setSubscribers(data);
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  // Orders filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderPaymentFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Product edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Settings form state (including logoUrl)
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [logoPreview, setLogoPreview] = useState<string>(settings.logoUrl || '');

  useEffect(() => {
    setSettingsForm(settings);
    setLogoPreview(settings.logoUrl || '');
  }, [settings]);

  const isDedicatedPage = isStandalone || currentRoute === 'admin';
  if (!isAdminOpen && !isDedicatedPage) return null;

  // 1. ANALYTICS CALCULATIONS (from SOW SQL queries)
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalOrdersCount = orders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / (orders.filter(o => o.status !== 'Cancelled').length || 1)) : 0;

  // COD vs Prepaid Breakdown
  const prepaidOrders = orders.filter((o) => o.paymentMethod === 'prepaid');
  const codOrders = orders.filter((o) => o.paymentMethod === 'cod');

  const prepaidRevenue = prepaidOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const codRevenue = codOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Units sold per product
  const unitsSoldMap = new Map<string, { title: string; units: number; revenue: number }>();
  orders.forEach((ord) => {
    if (ord.status !== 'Cancelled') {
      ord.items.forEach((item) => {
        const curr = unitsSoldMap.get(item.productId) || {
          title: item.title,
          units: 0,
          revenue: 0
        };
        curr.units += item.quantity;
        curr.revenue += item.total;
        unitsSoldMap.set(item.productId, curr);
      });
    }
  });
  const unitsSoldList = Array.from(unitsSoldMap.entries()).sort(
    (a, b) => b[1].units - a[1].units
  );

  // Low stock products alert
  const lowStockAlerts = products.filter((p) => p.stockQuantity < 10);

  // COD Call list orders
  const codCallListOrders = orders.filter(
    (o) => o.paymentMethod === 'cod' && o.status === 'Processing' && !o.codConfirmed
  );

  // Filtered orders list
  const filteredOrders = orders.filter((ord) => {
    if (orderStatusFilter !== 'All' && ord.status !== orderStatusFilter) return false;
    if (orderPaymentFilter !== 'All' && ord.paymentMethod !== orderPaymentFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      return (
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerPhone.includes(q) ||
        ord.trackingNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenProductEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleOpenNewProduct = () => {
    setEditingProduct({
      id: `book-${Date.now()}`,
      title: '',
      slug: '',
      category: 'Python',
      regularPrice: 799,
      salePrice: 499,
      stockQuantity: 20,
      isBundle: false,
      bundledProductIds: [],
      pages: 180,
      shortDescription: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      sampleImages: [],
      features: ['100 GSM printed paper', 'High-yield visual diagrams'],
      hsnCode: '4901',
      sku: `PYN-${Math.floor(10 + Math.random() * 90)}`,
      rating: 4.9,
      reviewCount: 0,
      badge: 'New Release',
      isFeatured: false
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProductFormError(null);

    const valResult = validateProductForm(
      editingProduct.title,
      editingProduct.regularPrice,
      editingProduct.salePrice,
      editingProduct.stockQuantity,
      editingProduct.sku
    );

    if (!valResult.isValid) {
      const firstErr = Object.values(valResult.errors)[0];
      setProductFormError(firstErr);
      showToast(firstErr);
      return;
    }

    await handleSaveProduct(editingProduct);
    showToast(`Product "${editingProduct.title}" saved to physical catalog!`);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductFormError(null);
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFormError(null);

    const settingsVal = validateStoreSettings(
      settingsForm.storeName,
      settingsForm.supportEmail,
      settingsForm.supportPhone
    );

    if (!settingsVal.isValid) {
      const firstErr = Object.values(settingsVal.errors)[0];
      setSettingsFormError(firstErr);
      showToast(firstErr);
      return;
    }

    if (settingsForm.gstin) {
      const gstinVal = validateGstin(settingsForm.gstin);
      if (!gstinVal.isValid) {
        setSettingsFormError(gstinVal.message || 'Invalid GSTIN');
        showToast(gstinVal.message || 'Invalid GSTIN');
        return;
      }
    }

    const updated = {
      ...settingsForm,
      logoUrl: logoPreview
    };
    await handleSaveSettings(updated);
    setSettingsFormError(null);
    showToast('Brand settings, pricing rules, and logo saved live!');
  };

  // Immediate save helper for logo modifications
  const handleSaveLogoDirectly = async (newLogoUrl: string, newHeight?: number) => {
    setLogoPreview(newLogoUrl);
    const updated: SiteSettings = {
      ...settingsForm,
      logoUrl: newLogoUrl,
      ...(newHeight !== undefined ? { logoHeight: newHeight } : {})
    };
    setSettingsForm(updated);
    await handleSaveSettings(updated);
  };

  // Handle Logo File Upload (reads file into Data URL and auto-saves)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('Image size should be under 3MB for optimal loading.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await handleSaveLogoDirectly(dataUrl);
        showToast('New logo uploaded and applied to storefront live!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (presetId: string) => {
    await handleSaveLogoDirectly(presetId);
    showToast('Brand logo preset applied and saved live!');
  };

  const handleResetToDefaultLogo = async () => {
    await handleSaveLogoDirectly('');
    showToast('Reset to Official PyNotes Master Vector Logo!');
  };

  const handleApplyLogoUrl = async () => {
    if (!logoPreview.trim()) {
      showToast('Please enter an image URL first.');
      return;
    }
    await handleSaveLogoDirectly(logoPreview.trim());
    showToast('Logo URL applied and saved to storefront!');
  };

  const handleLogoHeightChange = async (h: number) => {
    await handleSaveLogoDirectly(logoPreview, h);
  };

  return (
    <div
      className={
        isDedicatedPage
          ? 'min-h-screen bg-[#071E38] flex flex-col text-left font-body'
          : 'fixed inset-0 z-50 overflow-hidden bg-[#071E38]/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200 text-left font-body'
      }
    >
      <div
        className={
          isDedicatedPage
            ? 'flex-1 bg-[#F7FAFC] flex flex-col overflow-hidden min-h-screen'
            : 'bg-[#F7FAFC] rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl border border-[#CED7DF] overflow-hidden'
        }
      >
        {/* Top Admin Navigation Header (PyNotes Navy & Ink Night) */}
        <div className="bg-[#071E38] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#0B3561] shrink-0 font-heading">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#12A5B0] text-[#071E38] font-black flex items-center justify-center text-xl shadow-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight font-heading">
                  PyNotes Admin Console
                </h1>
                <span className="bg-[#12A5B0]/20 text-[#12A5B0] border border-[#12A5B0]/40 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Shop Manager
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="bg-[#12A5B0]/20 hover:bg-[#12A5B0]/40 text-[#DDF3F4] border border-[#12A5B0]/50 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                  title="Open Brand Logo & Settings tab"
                >
                  <ImageIcon className="w-3 h-3 text-[#12A5B0]" />
                  <span>Logo: {logoPreview ? (logoPreview.startsWith('preset:') ? logoPreview.replace('preset:', '') : 'Custom') : 'Official'} (Edit)</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A0DBDF]">
                <span>
                  Admin: <span className="font-mono text-[#FFD54A] font-bold">{adminSession?.email || 'shimadutta62@gmail.com'}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-teal-300 bg-teal-950/70 border border-teal-700/60 px-2 py-0.5 rounded-full text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>Session Active (8h)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#CED7DF] hover:bg-[#0B3561]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'orders'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#CED7DF] hover:bg-[#0B3561]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cod-call-list')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'cod-call-list'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#FFD54A] hover:bg-[#0B3561]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>COD Call List</span>
              {codCallListOrders.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {codCallListOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#CED7DF] hover:bg-[#0B3561]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Catalogue</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'stock'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#CED7DF] hover:bg-[#0B3561]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stock Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#CED7DF] hover:bg-[#0B3561]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Logo</span>
            </button>

            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'issues'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#CED7DF] hover:bg-[#0B3561]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Claims ({issueReports.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('newsletter')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'newsletter'
                  ? 'bg-[#12A5B0] text-white shadow-sm'
                  : 'text-[#CED7DF] hover:bg-[#0B3561]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Newsletter ({subscribers.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {adminSession && (
              <div className="hidden sm:flex items-center gap-2 bg-[#0B3561] border border-[#12A5B0]/40 px-3 py-1.5 rounded-xl text-[11px] text-[#DDF3F4]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold font-mono">Admin Session Active</span>
                <button
                  type="button"
                  onClick={extendAdminSession}
                  className="text-[#FFD54A] hover:underline font-bold ml-1 cursor-pointer font-heading uppercase text-[10px]"
                  title="Renew 8-hour admin token"
                >
                  Renew (+8h)
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setIsAdminOpen(false);
                navigateTo('store');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#CED7DF] hover:text-white bg-[#0B3561] hover:bg-[#113d6b] transition-all cursor-pointer font-heading"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>

            <button
              onClick={() => {
                adminLogout();
                setIsAdminOpen(false);
                navigateTo('admin');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-200 hover:text-white bg-red-950/60 hover:bg-red-900 border border-red-800/60 transition-all cursor-pointer font-heading"
              title="Sign Out of Shop Manager Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            {!isDedicatedPage && (
              <button
                onClick={() => setIsAdminOpen(false)}
                className="p-1.5 text-[#9DAEC0] hover:text-white rounded-lg hover:bg-[#0B3561] cursor-pointer ml-1"
                title="Close Admin Panel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Admin Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ===================== TAB 1: DASHBOARD ===================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-[#CED7DF] shadow-2xs">
                  <div className="flex items-center justify-between text-[#6D86A0] text-xs font-bold uppercase font-heading">
                    <span>Total Net Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#12A5B0]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#0B3561] mt-2 font-mono">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-[#12A5B0] font-bold mt-1 flex items-center gap-1 font-heading">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real-time orders in sync</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#CED7DF] shadow-2xs">
                  <div className="flex items-center justify-between text-[#6D86A0] text-xs font-bold uppercase font-heading">
                    <span>Total Orders Placed</span>
                    <ShoppingBag className="w-4 h-4 text-[#0B3561]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#0B3561] mt-2 font-mono">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[11px] text-[#6D86A0] mt-1 font-heading">
                    HPOS database active
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#CED7DF] shadow-2xs">
                  <div className="flex items-center justify-between text-[#6D86A0] text-xs font-bold uppercase font-heading">
                    <span>Average Order Value</span>
                    <TrendingUp className="w-4 h-4 text-[#12A5B0]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#0B3561] mt-2 font-mono">
                    ₹{aov.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-[#6D86A0] mt-1 font-heading">
                    Boosted by Smart Bundles
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#CED7DF] shadow-2xs">
                  <div className="flex items-center justify-between text-[#6D86A0] text-xs font-bold uppercase font-heading">
                    <span>COD Verification Queue</span>
                    <PhoneCall className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 font-mono">
                    {codCallListOrders.length}
                  </div>
                  <div className="text-[11px] text-amber-700 font-bold mt-1 font-heading">
                    Awaiting phone confirmation
                  </div>
                </div>
              </div>

              {/* COD against Prepaid Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#CED7DF] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E7EBEF] pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0B3561] uppercase tracking-wide font-heading">
                        Payment Method Split (COD vs Prepaid)
                      </h3>
                      <p className="text-xs text-[#6D86A0]">
                        SOW Query: 30-Day orders & revenue breakdown
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#9DAEC0]">wp_wc_orders</span>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1 font-heading">
                        <span className="text-[#12A5B0] flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#12A5B0]"></span>
                          Prepaid (Razorpay UPI / Cards)
                        </span>
                        <span className="font-mono text-[#0B3561]">
                          {prepaidOrders.length} orders (₹{prepaidRevenue.toLocaleString('en-IN')})
                        </span>
                      </div>
                      <div className="w-full bg-[#E7EBEF] h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-[#12A5B0] h-full rounded-full transition-all"
                          style={{
                            width: `${totalOrdersCount > 0 ? (prepaidOrders.length / totalOrdersCount) * 100 : 50}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1 font-heading">
                        <span className="text-[#0B3561] flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0B3561]"></span>
                          Cash on Delivery (COD)
                        </span>
                        <span className="font-mono text-[#0B3561]">
                          {codOrders.length} orders (₹{codRevenue.toLocaleString('en-IN')})
                        </span>
                      </div>
                      <div className="w-full bg-[#E7EBEF] h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0B3561] h-full rounded-full transition-all"
                          style={{
                            width: `${totalOrdersCount > 0 ? (codOrders.length / totalOrdersCount) * 100 : 50}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#DDF3F4] rounded-2xl text-xs text-[#0B3561] leading-relaxed border border-[#A0DBDF]">
                      💡 <strong>Conversion Lever:</strong> Prepaid orders save ₹{settings.prepaidDiscountPercent}% and eliminate RTO refusal risk. The COD fee is currently set at ₹{settings.codFee}.
                    </div>
                  </div>
                </div>

                {/* Units Sold per Product */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#CED7DF] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E7EBEF] pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0B3561] uppercase tracking-wide font-heading">
                        Units Sold Per Title (Last 30 Days)
                      </h3>
                      <p className="text-xs text-[#6D86A0]">
                        SOW Query: wp_wc_order_product_lookup
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#9DAEC0]">Top Sellers</span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {unitsSoldList.length > 0 ? (
                      unitsSoldList.map(([id, data]) => (
                        <div
                          key={id}
                          className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#F7FAFC] border border-[#CED7DF]"
                        >
                          <div className="pr-2 truncate">
                            <span className="font-bold text-[#0B3561]">{data.title}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="bg-[#DDF3F4] text-[#12A5B0] font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                              {data.units} copies
                            </span>
                            <span className="font-black text-[#0B3561] ml-2 font-mono">
                              ₹{data.revenue.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-[#9DAEC0]">
                        No orders recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              {lowStockAlerts.length > 0 && (
                <div className="bg-[#DDF3F4]/50 border-2 border-[#12A5B0] rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-[#0B3561] font-bold text-sm mb-3 font-heading">
                    <AlertTriangle className="w-5 h-5 text-[#12A5B0]" />
                    <span>Inventory Reorder Alert: Low Stock on Physical Titles</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStockAlerts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-3.5 rounded-2xl border border-[#CED7DF] flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold text-[#0B3561] truncate">{prod.title}</div>
                          <div className="text-[10px] text-[#6D86A0] font-mono">SKU: {prod.sku}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`px-2 py-1 rounded font-black font-mono text-xs ${
                              prod.stockQuantity <= 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-[#FFD54A]/40 text-[#071E38]'
                            }`}
                          >
                            {prod.stockQuantity} left
                          </span>
                          <button
                            onClick={() => handleUpdateStock(prod.id, prod.stockQuantity + 25)}
                            className="block mt-1 text-[10px] text-[#12A5B0] font-bold hover:underline cursor-pointer"
                          >
                            + Restock 25
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: ORDERS MANAGEMENT ===================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-[#CED7DF] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 font-heading uppercase text-xs">
                  <span className="font-bold text-[#6D86A0]">Status:</span>
                  {[
                    'All',
                    'Processing',
                    'Completed or Shipped',
                    'On hold',
                    'Cancelled',
                    'Refunded'
                  ].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                        orderStatusFilter === st
                          ? 'bg-[#0B3561] text-white'
                          : 'bg-[#F7FAFC] text-[#3C5D81] hover:bg-[#E7EBEF]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#9DAEC0] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search Order #, Phone, Name..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F7FAFC] border border-[#CED7DF] rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-[#12A5B0] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-3xl border border-[#CED7DF] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-[#E7EBEF]">
                    <thead className="bg-[#F7FAFC] font-bold text-[#6D86A0] uppercase text-[10px] font-heading">
                      <tr>
                        <th className="py-3.5 px-4">Order</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Customer & Phone</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7EBEF] text-[#071E38]">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#F7FAFC] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-black text-[#0B3561]">
                              {ord.orderNumber}
                            </td>
                            <td className="py-3.5 px-4 text-[#6D86A0] text-[11px]">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#0B3561]">{ord.customerName}</div>
                              <div className="text-[11px] text-[#6D86A0] font-mono">
                                +91 {ord.customerPhone}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold">{ord.items.length} titles</span>
                              <div className="text-[10px] text-[#9DAEC0] truncate max-w-xs">
                                {ord.items.map((i) => i.title).join(', ')}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-heading ${
                                  ord.paymentMethod === 'prepaid'
                                    ? 'bg-[#DDF3F4] text-[#12A5B0]'
                                    : 'bg-[#FFD54A]/30 text-[#071E38]'
                                }`}
                              >
                                {ord.paymentMethod === 'prepaid' ? 'Razorpay' : 'COD'} ({ord.paymentStatus})
                              </span>
                              {ord.razorpayPaymentId && (
                                <div className="text-[9px] font-mono text-[#6D86A0] mt-0.5 truncate max-w-[110px]" title={ord.razorpayPaymentId}>
                                  {ord.razorpayPaymentId}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-black text-[#0B3561]">
                              ₹{ord.totalAmount}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold font-heading ${
                                  ord.status === 'Completed or Shipped'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'Processing'
                                    ? 'bg-[#DDF3F4] text-[#0B3561]'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-[#E7EBEF] text-[#6D86A0]'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedOrderDetails(ord)}
                                className="bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer font-heading"
                              >
                                Manage
                              </button>
                              <button
                                onClick={() => setActiveOrderForInvoice(ord)}
                                className="bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#12A5B0] px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                                title="View GST Invoice"
                              >
                                <FileText className="w-3.5 h-3.5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-[#9DAEC0]">
                            No orders found matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: COD CALL LIST ===================== */}
          {activeTab === 'cod-call-list' && (
            <div className="space-y-4">
              <div className="bg-[#DDF3F4] border border-[#A0DBDF] rounded-3xl p-5 flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-[#12A5B0] shrink-0 mt-0.5" />
                <div className="text-xs text-[#0B3561]">
                  <h3 className="font-extrabold text-sm font-heading">
                    Daily COD Call List (Pre-Dispatch Verification)
                  </h3>
                  <p className="mt-0.5 leading-relaxed font-body">
                    As mandated by the SOW: COD orders in <em>Processing</em> must be verified by phone or WhatsApp before booking pickup with Shiprocket to eliminate door refusals. Confirming automatically assigns an AWB; rejecting cancels and restores inventory.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {codCallListOrders.length > 0 ? (
                  codCallListOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-5 rounded-3xl border-2 border-[#A0DBDF] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-[#0B3561] text-sm">
                          {ord.orderNumber}
                        </span>
                        <span className="bg-[#FFD54A] text-[#071E38] font-black px-2.5 py-0.5 rounded text-xs font-mono">
                          Collect: ₹{ord.totalAmount}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-bold text-[#0B3561] text-sm">{ord.customerName}</div>
                        <div className="text-[#3C5D81] font-mono">
                          Mobile: <strong>+91 {ord.customerPhone}</strong>
                        </div>
                        <div className="text-[#6D86A0] text-[11px]">
                          {ord.shippingAddress.streetAddress}, {ord.shippingAddress.city},{' '}
                          {ord.shippingAddress.state} - {ord.shippingAddress.pincode}
                        </div>
                        <div className="text-[#071E38] font-medium pt-1">
                          Items: {ord.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E7EBEF] flex flex-wrap gap-2 text-xs font-heading">
                        <a
                          href={`tel:+91${ord.customerPhone}`}
                          className="flex-1 bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-[#0B3561]" />
                          <span>Call Phone</span>
                        </a>

                        <a
                          href={`https://wa.me/91${ord.customerPhone}?text=${encodeURIComponent(
                            `Hello ${ord.customerName}, this is PyNotes verifying your Cash on Delivery order (${ord.orderNumber}) for ₹${ord.totalAmount}. Please reply YES to confirm delivery to ${ord.shippingAddress.city}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => handleConfirmCod(ord.id)}
                          className="w-full bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Mark Verified & Generate Courier AWB</span>
                        </button>

                        <button
                          onClick={() => handleCancelOrder(ord)}
                          className="w-full text-[#9DAEC0] hover:text-red-600 font-semibold py-1 text-center cursor-pointer text-[11px]"
                        >
                          Customer Refused / Unreachable &rarr; Cancel & Restock
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-dashed border-[#CED7DF] p-8 space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-[#12A5B0] mx-auto" />
                    <h4 className="font-bold text-[#0B3561] font-heading">All COD Orders Verified!</h4>
                    <p className="text-[#6D86A0] text-xs">
                      No pending Cash on Delivery orders waiting for telephone confirmation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB 4: PRODUCTS & BUNDLES ===================== */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#0B3561] font-heading">
                    Catalogue & Smart Bundles
                  </h3>
                  <p className="text-xs text-[#6D86A0]">
                    13 physical books plus Smart Bundles linked dynamically.
                  </p>
                </div>
                <button
                  onClick={handleOpenNewProduct}
                  className="bg-[#0B3561] hover:bg-[#071E38] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer font-heading uppercase"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Title / Bundle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-[#CED7DF] p-4 shadow-2xs flex flex-col justify-between hover:border-[#12A5B0] transition-colors"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={prod.coverImage}
                          alt={prod.title}
                          className="w-14 h-18 object-cover rounded-xl border border-[#CED7DF] shrink-0"
                        />
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-1.5 font-heading">
                            <span className="text-[10px] font-bold text-[#12A5B0] bg-[#DDF3F4] px-1.5 py-0.2 rounded uppercase">
                              {prod.category}
                            </span>
                            {prod.isBundle && (
                              <span className="text-[10px] font-bold text-[#0B3561] bg-[#E7EBEF] px-1.5 py-0.2 rounded">
                                Smart Bundle
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-xs text-[#0B3561] mt-1 line-clamp-2 font-heading">
                            {prod.title}
                          </h4>
                          <div className="text-[11px] text-[#6D86A0] font-mono mt-0.5">
                            SKU: {prod.sku} • {prod.pages} pgs
                          </div>
                        </div>
                      </div>

                      {prod.isBundle && prod.bundledProductIds && (
                        <div className="mt-3 p-2 bg-[#F7FAFC] rounded-xl text-[10px] text-[#3C5D81] border border-[#CED7DF]">
                          <strong>Bundled:</strong> {prod.bundledProductIds.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E7EBEF] flex items-center justify-between">
                      <div>
                        <span className="font-black text-sm text-[#0B3561] font-mono">
                          ₹{prod.salePrice}
                        </span>
                        <span className="text-xs text-[#9DAEC0] line-through ml-1 font-mono">
                          ₹{prod.regularPrice}
                        </span>
                        <div className="text-[10px] font-bold text-[#3C5D81] mt-0.5">
                          Stock: <span className="font-mono text-[#12A5B0] font-black">{prod.stockQuantity}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenProductEdit(prod)}
                        className="bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 font-heading"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 5: STOCK MATRIX ===================== */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="bg-[#DDF3F4] border border-[#A0DBDF] rounded-3xl p-5 text-xs text-[#0B3561]">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5 font-heading">
                  <Layers className="w-4 h-4 text-[#12A5B0]" />
                  <span>Real-Time Inventory Matrix & Dynamic Bundle Sync</span>
                </h3>
                <p className="mt-1 leading-relaxed font-body">
                  Single books manage physical stock. Smart Bundles automatically derive available quantity:
                  <code>bundleStock = min(book1, book2...)</code>.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-[#CED7DF] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-[#E7EBEF]">
                  <thead className="bg-[#F7FAFC] font-bold text-[#6D86A0] uppercase text-[10px] font-heading">
                    <tr>
                      <th className="py-3 px-4">Subject Title</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4 text-center">Available Stock</th>
                      <th className="py-3 px-4 text-right">Adjust Physical Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7EBEF] text-[#071E38]">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#F7FAFC] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0B3561]">
                          {prod.title}
                        </td>
                        <td className="py-3 px-4">
                          {prod.isBundle ? (
                            <span className="bg-[#DDF3F4] text-[#12A5B0] text-[10px] font-bold px-2 py-0.5 rounded font-heading">
                              Smart Bundle (Derived)
                            </span>
                          ) : (
                            <span className="bg-[#E7EBEF] text-[#0B3561] text-[10px] font-bold px-2 py-0.5 rounded font-heading">
                              Single Book
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#6D86A0]">{prod.sku}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full font-mono font-black text-xs ${
                              prod.stockQuantity <= 0
                                ? 'bg-red-100 text-red-700'
                                : prod.stockQuantity <= 10
                                ? 'bg-[#FFD54A]/40 text-[#071E38]'
                                : 'bg-[#DDF3F4] text-[#12A5B0]'
                            }`}
                          >
                            {prod.stockQuantity} {prod.stockQuantity <= 0 ? '(Sold Out)' : 'units'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {prod.isBundle ? (
                            <span className="text-[11px] text-[#9DAEC0] italic font-body">
                              Auto-derived from books
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateStock(prod.id, prod.stockQuantity - 1)}
                                className="w-7 h-7 rounded-lg bg-[#E7EBEF] hover:bg-[#CED7DF] font-bold text-xs cursor-pointer text-[#0B3561]"
                                title="-1"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleUpdateStock(prod.id, prod.stockQuantity + 1)}
                                className="w-7 h-7 rounded-lg bg-[#E7EBEF] hover:bg-[#CED7DF] font-bold text-xs cursor-pointer text-[#0B3561]"
                                title="+1"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleUpdateStock(prod.id, prod.stockQuantity + 10)}
                                className="px-2 h-7 rounded-lg bg-[#DDF3F4] hover:bg-[#c2ebed] text-[#12A5B0] font-bold text-xs cursor-pointer ml-1 font-heading"
                                title="+10 batch restock"
                              >
                                +10
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 6: SETTINGS & LOGO MANAGEMENT ===================== */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
              {/* BRAND LOGO MANAGEMENT SECTION (Requested by User) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CED7DF] shadow-xs space-y-6 text-xs">
                <div className="flex flex-wrap items-center justify-between border-b border-[#E7EBEF] pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-[#0B3561] font-heading flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#12A5B0]" />
                        <span>Brand Logo & Identity Assets</span>
                      </h3>
                      <span className="bg-[#DDF3F4] text-[#12A5B0] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase font-heading">
                        Live Editable
                      </span>
                    </div>
                    <p className="text-[#6D86A0] text-xs mt-0.5 font-body">
                      Change your storefront logo anytime. Select from official Brand Guideline presets or upload custom PNG / SVG files.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleResetToDefaultLogo}
                        className="bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer font-heading"
                      >
                        Reset to Official Logo
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black px-5 py-2 rounded-xl text-xs shadow-xs cursor-pointer font-heading uppercase tracking-wider"
                    >
                      Save All Settings
                    </button>
                  </div>
                </div>

                {/* 1. Official Brand Presets Selector */}
                <div className="space-y-2">
                  <div className="font-bold text-[#0B3561] font-heading uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#12A5B0]" />
                    <span>Quick Select Brand Guidelines Preset:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        id: '',
                        label: 'Horizontal Full-Color',
                        desc: 'Official Master Logo (Navy & Teal)',
                        presetVariant: 'horizontal' as const
                      },
                      {
                        id: 'preset:stacked',
                        label: 'Stacked Centered',
                        desc: 'Book on top of PyNotes wordmark',
                        presetVariant: 'stacked' as const
                      },
                      {
                        id: 'preset:icon',
                        label: 'Sparks Icon Mark',
                        desc: 'Compact open book symbol only',
                        presetVariant: 'icon' as const
                      },
                      {
                        id: 'preset:white',
                        label: 'Monochrome Light',
                        desc: 'White with mint accents',
                        presetVariant: 'white' as const
                      }
                    ].map((p) => {
                      const isSelected = (!logoPreview && p.id === '') || logoPreview === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPreset(p.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-2 border-[#12A5B0] bg-[#DDF3F4]/50 shadow-xs ring-2 ring-[#12A5B0]/20'
                              : 'border-[#CED7DF] bg-[#F7FAFC] hover:bg-[#E7EBEF]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#0B3561] font-heading text-xs">
                              {p.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#12A5B0] shrink-0" />
                            )}
                          </div>
                          <div className="h-10 flex items-center justify-center bg-white rounded-lg p-1 border border-[#E7EBEF] overflow-hidden my-1">
                            <BrandLogo variant={p.presetVariant} height={26} showTagline={false} />
                          </div>
                          <p className="text-[10px] text-[#6D86A0] mt-1 line-clamp-1">{p.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Dual Live Previews (Storefront Header & Dark Footer) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Preview on Light / Paper White Background */}
                  <div className="p-4 rounded-2xl border border-[#CED7DF] bg-[#F7FAFC] flex flex-col items-center justify-center space-y-2 min-h-36">
                    <span className="text-[10px] font-bold text-[#6D86A0] uppercase font-heading tracking-wider">
                      Storefront Header Preview (Paper White #F7FAFC)
                    </span>
                    <div className="w-full p-4 bg-white rounded-xl shadow-2xs border border-[#E7EBEF] flex items-center justify-center min-h-[64px]">
                      {logoPreview && !logoPreview.startsWith('preset:') ? (
                        <img
                          src={logoPreview}
                          alt="Custom Logo Preview"
                          style={{ height: `${settingsForm.logoHeight || 42}px` }}
                          className="object-contain max-w-full"
                        />
                      ) : (
                        <BrandLogo height={settingsForm.logoHeight || 42} showTagline={true} />
                      )}
                    </div>
                    <span className="text-[10px] text-[#9DAEC0] font-mono">
                      Height: {settingsForm.logoHeight || 42}px
                    </span>
                  </div>

                  {/* Preview on Dark / Ink Night Background */}
                  <div className="p-4 rounded-2xl border border-[#0B3561] bg-[#071E38] flex flex-col items-center justify-center space-y-2 min-h-36 text-white">
                    <span className="text-[10px] font-bold text-[#A0DBDF] uppercase font-heading tracking-wider">
                      Footer / Dark Background Preview (Ink Night #071E38)
                    </span>
                    <div className="w-full p-4 bg-[#0B3561] rounded-xl border border-[#113d6b] flex items-center justify-center min-h-[64px]">
                      {logoPreview && !logoPreview.startsWith('preset:') ? (
                        <img
                          src={logoPreview}
                          alt="Custom Logo Dark Preview"
                          style={{ height: `${settingsForm.logoHeight || 42}px` }}
                          className="object-contain max-w-full bg-white/10 p-1 rounded-lg"
                        />
                      ) : (
                        <BrandLogo variant="white" height={settingsForm.logoHeight || 42} showTagline={true} />
                      )}
                    </div>
                    <span className="text-[10px] text-[#A0DBDF] font-mono">
                      Footer Contrast Verified
                    </span>
                  </div>
                </div>

                {/* 3. Logo Height Sizing Slider */}
                <div className="p-4 bg-[#F7FAFC] border border-[#CED7DF] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#12A5B0]" />
                    <div>
                      <span className="font-bold text-[#0B3561] font-heading text-xs">
                        Logo Display Height on Storefront
                      </span>
                      <p className="text-[11px] text-[#6D86A0]">
                        Scales the header and footer logo smoothly across all screen sizes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="range"
                      min={32}
                      max={68}
                      step={2}
                      value={settingsForm.logoHeight || 42}
                      onChange={(e) => handleLogoHeightChange(Number(e.target.value))}
                      className="accent-[#12A5B0] w-36 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-[#CED7DF] text-[#0B3561] shrink-0">
                      {settingsForm.logoHeight || 42}px
                    </span>
                  </div>
                </div>

                {/* 4. Logo File Upload & URL Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* File Upload Option */}
                  <div className="p-4 bg-[#F7FAFC] border border-[#CED7DF] rounded-2xl space-y-2.5">
                    <div className="font-bold text-[#0B3561] flex items-center gap-1.5 font-heading">
                      <Upload className="w-4 h-4 text-[#12A5B0]" />
                      <span>Upload Custom Logo File (PNG / SVG / JPG)</span>
                    </div>
                    <p className="text-[11px] text-[#6D86A0]">
                      Choose an image from your computer. Automatically saves and applies live.
                    </p>
                    <label className="block pt-1">
                      <span className="sr-only">Choose logo file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="block w-full text-xs text-[#0B3561] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#12A5B0] file:text-white hover:file:bg-[#0e8a93] cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Image URL Option */}
                  <div className="p-4 bg-[#F7FAFC] border border-[#CED7DF] rounded-2xl space-y-2.5">
                    <div className="font-bold text-[#0B3561] flex items-center gap-1.5 font-heading">
                      <ImageIcon className="w-4 h-4 text-[#12A5B0]" />
                      <span>Or Enter Hosted Logo Image URL</span>
                    </div>
                    <p className="text-[11px] text-[#6D86A0]">
                      Paste any HTTPS image URL (CDN, Google Cloud Storage, or external host).
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logoPreview.startsWith('preset:') || logoPreview.startsWith('data:') ? '' : logoPreview}
                        onChange={(e) => setLogoPreview(e.target.value)}
                        className="w-full bg-white border border-[#CED7DF] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#12A5B0] font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyLogoUrl}
                        className="bg-[#0B3561] hover:bg-[#071E38] text-white font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 cursor-pointer font-heading"
                      >
                        Apply URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Notice */}
                <div className="flex flex-wrap items-center justify-between pt-2 text-[11px] text-[#6D86A0] border-t border-[#E7EBEF]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#0B3561]">Current Active Logo:</span>
                    <span className="font-mono bg-[#DDF3F4] text-[#0B3561] px-2 py-0.5 rounded font-bold">
                      {logoPreview === ''
                        ? 'Official Master Vector Logo'
                        : logoPreview.startsWith('preset:')
                        ? `Brand Preset (${logoPreview.replace('preset:', '')})`
                        : logoPreview.startsWith('data:')
                        ? 'Custom Uploaded Image File'
                        : 'Custom Image URL'}
                    </span>
                  </div>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleResetToDefaultLogo}
                      className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer font-heading"
                    >
                      Reset to Official Brand Logo
                    </button>
                  )}
                </div>
              </div>

              {/* STORE RULES & SCF OPTIONS */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CED7DF] shadow-xs space-y-5 text-xs">
                <div className="flex items-center justify-between border-b border-[#E7EBEF] pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0B3561] uppercase font-heading">
                      WooCommerce & Secure Custom Fields (SCF) Options
                    </h3>
                    <p className="text-[#6D86A0] text-xs">
                      Plugin business rules and pricing parameters
                    </p>
                  </div>
                </div>

                {settingsFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{settingsFormError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-body">
                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, storeName: e.target.value })
                      }
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-bold text-[#0B3561]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading">
                      Prepaid Discount (% on UPI/Cards)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.prepaidDiscountPercent}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          prepaidDiscountPercent: Number(e.target.value)
                        })
                      }
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-bold font-mono text-[#0B3561]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading">
                      Cash on Delivery (COD) Fee (INR)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.codFee}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          codFee: Number(e.target.value)
                        })
                      }
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-bold font-mono text-[#0B3561]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading">
                      Free Shipping Threshold (INR, 0 = Always Free)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          freeShippingThreshold: Number(e.target.value)
                        })
                      }
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-bold font-mono text-[#0B3561]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading">
                      GST Identification Number (GSTIN)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.gstin}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, gstin: e.target.value })
                      }
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-bold font-mono text-[#0B3561]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B3561] mb-1 font-heading">
                      Legal Entity Registered Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.legalEntity}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, legalEntity: e.target.value })
                      }
                      className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-semibold text-[#0B3561]"
                    />
                  </div>
                </div>

                {/* Reset Store to Demo State button */}
                <div className="pt-4 border-t border-[#E7EBEF] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0B3561] font-heading">Reset Demo Store Data</div>
                    <p className="text-[11px] text-[#6D86A0]">
                      Re-seeds the pristine 13 books catalogue, initial orders, and reviews.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDemoData}
                    className="bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer font-heading"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Store Data</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ===================== TAB 7: 48-HOUR ISSUE CLAIMS ===================== */}
          {activeTab === 'issues' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-[#CED7DF] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7EBEF] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B3561] uppercase font-heading">
                      48-Hour Damaged / Incorrect Book Claims
                    </h3>
                    <p className="text-xs text-[#6D86A0]">
                      Claims submitted by customers within the 48-hour delivery window
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0B3561]">
                    Total: {issueReports.length}
                  </span>
                </div>

                {issueReports.length > 0 ? (
                  <div className="space-y-3">
                    {issueReports.map((claim) => (
                      <div
                        key={claim.id}
                        className="bg-[#F7FAFC] p-4 rounded-2xl border border-[#CED7DF] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#0B3561]">
                            Order Ref: {claim.orderId}
                          </span>
                          <span className="bg-[#DDF3F4] text-[#12A5B0] font-bold text-[10px] px-2 py-0.5 rounded uppercase font-heading">
                            {claim.status}
                          </span>
                        </div>
                        <div className="text-[#071E38]">
                          <strong>Customer:</strong> {claim.customerName} (Phone: {claim.customerPhone})
                        </div>
                        <p className="text-[#3C5D81] bg-white p-3 rounded-xl border border-[#CED7DF]">
                          {claim.description}
                        </p>
                        <div className="text-[10px] text-[#9DAEC0] font-mono">
                          Filed on: {new Date(claim.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#9DAEC0] text-xs">
                    No open 48-hour claims. All parcels reported in good condition.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB 8: NEWSLETTER SUBSCRIBERS ===================== */}
          {activeTab === 'newsletter' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-[#CED7DF] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E7EBEF] pb-4 gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B3561] uppercase font-heading">
                      Newsletter Marketing Email List
                    </h3>
                    <p className="text-xs text-[#6D86A0]">
                      Active subscribers captured through the storefront footer signup for future marketing updates
                    </p>
                  </div>
                  <div className="bg-[#DDF3F4] text-[#12A5B0] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{subscribers.length} Emails Registered</span>
                  </div>
                </div>

                {subscribers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs font-body divide-y divide-[#CED7DF] text-left">
                      <thead>
                        <tr className="bg-[#F7FAFC] text-[#6D86A0] uppercase font-bold text-[10px] font-heading">
                          <th className="py-3 px-4">Index</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Registered Date</th>
                          <th className="py-3 px-4">Marketing Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CED7DF]">
                        {subscribers.map((sub, i) => (
                          <tr key={sub.id} className="hover:bg-[#F7FAFC] transition-colors">
                            <td className="py-3 px-4 text-[#6D86A0] font-mono">{i + 1}</td>
                            <td className="py-3 px-4 font-bold text-[#0B3561] font-mono">{sub.email}</td>
                            <td className="py-3 px-4 text-[#6D86A0] font-mono">
                              {sub.createdAt ? new Date(sub.createdAt).toLocaleString('en-IN') : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                                {sub.active ? 'Active Subscriber' : 'Unsubscribed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#9DAEC0] text-xs">
                    No newsletter signups yet. Subscribers will appear here automatically when they sign up on the storefront.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-60 bg-[#071E38]/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-[#CED7DF] shadow-2xl text-xs font-body">
            <div className="flex justify-between items-center pb-3 border-b border-[#E7EBEF]">
              <h3 className="font-black text-base text-[#0B3561] font-mono">
                Order #{selectedOrderDetails.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-[#6D86A0] hover:text-[#0B3561] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-[#071E38]">
              <div>
                <strong>Customer:</strong> {selectedOrderDetails.customerName} (+91{' '}
                {selectedOrderDetails.customerPhone})
              </div>
              <div>
                <strong>Address:</strong> {selectedOrderDetails.shippingAddress.streetAddress},{' '}
                {selectedOrderDetails.shippingAddress.city} -{' '}
                {selectedOrderDetails.shippingAddress.pincode}
              </div>
              <div>
                <strong>Payment:</strong> {selectedOrderDetails.paymentMethod.toUpperCase()} (₹
                {selectedOrderDetails.totalAmount})
              </div>
              <div>
                <strong>AWB Courier Tracking:</strong>{' '}
                <span className="font-mono text-[#12A5B0] font-bold">{selectedOrderDetails.trackingNumber}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7EBEF] space-y-2">
              <label className="block font-bold text-[#0B3561] font-heading">Change Fulfillment Status:</label>
              <div className="flex flex-wrap gap-2">
                {(['Processing', 'Completed or Shipped', 'On hold'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrderDetails.id, st);
                      setSelectedOrderDetails(null);
                    }}
                    className="bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] font-bold px-3 py-1.5 rounded-xl cursor-pointer font-heading"
                  >
                    Move to {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7EBEF] flex gap-2 font-heading">
              <button
                onClick={() => {
                  handleCancelOrder(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 px-3 rounded-xl cursor-pointer text-center"
              >
                Cancel & Restore Stock
              </button>

              <button
                onClick={() => {
                  handleRefundOrder(selectedOrderDetails, true);
                  setSelectedOrderDetails(null);
                }}
                className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2.5 px-3 rounded-xl cursor-pointer text-center"
              >
                Refund with Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-60 bg-[#071E38]/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#CED7DF] shadow-2xl text-xs font-body">
            <div className="flex justify-between items-center pb-3 border-b border-[#E7EBEF]">
              <h3 className="font-extrabold text-base text-[#0B3561] font-heading">
                {editingProduct.id ? 'Edit Book / Bundle' : 'Create New Title'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-[#6D86A0] hover:text-[#0B3561] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{productFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Title *</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, title: e.target.value })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-bold text-[#071E38]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5"
                  >
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C/C++">C/C++</option>
                    <option value="DSA">DSA</option>
                    <option value="Systems">Systems</option>
                    <option value="Web Dev">Web Dev</option>
                    <option value="Bundles">Bundles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Is Smart Bundle?</label>
                  <select
                    value={editingProduct.isBundle ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isBundle: e.target.value === 'true'
                      })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5"
                  >
                    <option value="false">No (Single Physical Book)</option>
                    <option value="true">Yes (Multi-Subject Smart Bundle)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Sale Price (INR) *</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-bold font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Regular List Price (INR)</label>
                  <input
                    type="number"
                    value={editingProduct.regularPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        regularPrice: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Printed Pages</label>
                  <input
                    type="number"
                    value={editingProduct.pages}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        pages: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Cover Image URL</label>
                  <input
                    type="text"
                    value={editingProduct.coverImage}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, coverImage: e.target.value })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-[#0B3561] mb-1 font-heading">Short Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.shortDescription}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        shortDescription: e.target.value
                      })
                    }
                    className="w-full bg-[#F7FAFC] border border-[#CED7DF] rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7EBEF] flex justify-end gap-2 font-heading uppercase">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-[#E7EBEF] hover:bg-[#CED7DF] text-[#0B3561] px-4 py-2 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#12A5B0] hover:bg-[#0e8a93] text-white font-black px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
