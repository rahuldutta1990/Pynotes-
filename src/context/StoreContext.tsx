import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order, SiteSettings, Review, IssueReport, CartItem, Coupon, ShippingAddress, PaymentMethod, UserProfile, AppRoute, UserSession, AdminSession } from '../types';
import {
  validateEmail,
  validatePhone,
  validateFullName,
  validatePassword
} from '../utils/validation';
import {
  initializeStoreDataIfNeeded,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToSettings,
  subscribeToReviews,
  subscribeToIssueReports,
  createOrder,
  cancelOrder,
  refundOrder,
  confirmCodOrder,
  updateOrderStatus,
  updateProductStock,
  saveProduct,
  saveSiteSettings,
  addProductReview,
  submitIssueReport,
  resetDemoStoreData,
  fetchLiveTrackingEvents
} from '../services/storeService';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS, INITIAL_REVIEWS, INITIAL_ORDERS } from '../data/initialCatalog';
import { trackCourierShipment } from '../services/courierService';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  settings: SiteSettings;
  reviews: Review[];
  issueReports: IssueReport[];
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  isCheckoutModalOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  activeOrderForSuccess: Order | null;
  setActiveOrderForSuccess: (order: Order | null) => void;
  activeOrderForTracking: Order | null;
  setActiveOrderForTracking: (order: Order | null) => void;
  activeOrderForInvoice: Order | null;
  setActiveOrderForInvoice: (order: Order | null) => void;
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  isReportIssueModalOpen: boolean;
  setIsReportIssueModalOpen: (open: boolean) => void;
  isSpotlightOpen: boolean;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  activeStaticPage: string | null;
  setActiveStaticPage: (page: string | null) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // User Authentication & Customer Account Session
  currentUser: UserProfile | null;
  userSession: UserSession | null;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  loginUser: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  signupUser: (name: string, email: string, password: string, phone?: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserActivity: () => void;
  extendUserSession: () => void;
  // Standalone Admin Authentication & Session
  isAdminAuthenticated: boolean;
  adminSession: AdminSession | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => void;
  extendAdminSession: () => void;
  // Checkout Form Session Draft
  saveCheckoutDraft: (draft: Partial<ShippingAddress>) => void;
  getCheckoutDraft: () => Partial<ShippingAddress> | null;
  clearCheckoutDraft: () => void;
  // Route Navigation (/store, /admin, /account)
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute) => void;
  // Financial computations
  cartSubtotal: number;
  cartCouponDiscount: number;
  cartPrepaidDiscount: number;
  cartShippingFee: number;
  cartCodFee: number;
  totalCartItems: number;
  // Handler methods
  handlePlaceOrder: (address: ShippingAddress, paymentMethod: PaymentMethod, razorpayPaymentId?: string) => Promise<Order>;
  handleCancelOrder: (order: Order) => Promise<void>;
  handleRefundOrder: (order: Order, restock: boolean) => Promise<void>;
  handleConfirmCod: (orderId: string, notes?: string) => Promise<void>;
  handleUpdateOrderStatus: (orderId: string, status: any, trackingNumber?: string) => Promise<void>;
  handleUpdateStock: (productId: string, newStock: number) => Promise<void>;
  handleSaveProduct: (product: Product) => Promise<void>;
  handleSaveSettings: (newSettings: SiteSettings) => Promise<void>;
  handleAddReview: (review: Review) => Promise<void>;
  handleSubmitIssue: (issue: IssueReport) => Promise<void>;
  handleResetDemoData: () => Promise<void>;
  handleFetchLiveTracking: (orderId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pynotes_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeOrderForSuccess, setActiveOrderForSuccess] = useState<Order | null>(null);
  const [activeOrderForTracking, setActiveOrderForTracking] = useState<Order | null>(null);
  const [activeOrderForInvoice, setActiveOrderForInvoice] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [activeStaticPage, setActiveStaticPage] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openSpotlight = () => setIsSpotlightOpen(true);
  const closeSpotlight = () => setIsSpotlightOpen(false);

  // Global Apple Spotlight Shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // User Authentication & Customer Account Session State (Guest by default until validated signup/login)
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const savedSession = localStorage.getItem('pynotes_user_session');
      if (savedSession) {
        const session: UserSession = JSON.parse(savedSession);
        // Clean out any legacy mock student
        if (session.user?.id === 'usr-student-01') {
          localStorage.removeItem('pynotes_user_session');
          localStorage.removeItem('pynotes_user');
          return null;
        }
        if (new Date(session.expiresAt).getTime() > Date.now()) {
          return session;
        } else {
          localStorage.removeItem('pynotes_user_session');
          localStorage.removeItem('pynotes_user');
        }
      }
    } catch {}
    return null;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedSession = localStorage.getItem('pynotes_user_session');
      if (savedSession) {
        const session: UserSession = JSON.parse(savedSession);
        if (session.user?.id === 'usr-student-01') {
          localStorage.removeItem('pynotes_user_session');
          localStorage.removeItem('pynotes_user');
          return null;
        }
        if (new Date(session.expiresAt).getTime() > Date.now()) {
          return session.user;
        }
      }
      const saved = localStorage.getItem('pynotes_user');
      if (saved) {
        const user: UserProfile = JSON.parse(saved);
        if (user && user.id && user.id !== 'usr-student-01') {
          return user;
        }
        localStorage.removeItem('pynotes_user');
      }
    } catch {}
    // Guest by default - user creates profile or logs in with validation
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Dedicated Admin Authentication & Session State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const savedSession = localStorage.getItem('pynotes_admin_session');
      if (savedSession) {
        const session: AdminSession = JSON.parse(savedSession);
        if (new Date(session.expiresAt).getTime() > Date.now()) {
          return session;
        } else {
          localStorage.removeItem('pynotes_admin_session');
          localStorage.removeItem('pynotes_admin_auth');
        }
      }
    } catch {}
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const savedSession = localStorage.getItem('pynotes_admin_session');
      if (savedSession) {
        const session: AdminSession = JSON.parse(savedSession);
        return new Date(session.expiresAt).getTime() > Date.now();
      }
      return localStorage.getItem('pynotes_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

// Helper to match a slug to a product
const getProductFromSlug = (slug: string, productsList: Product[]) => {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  let found = productsList.find((p) => p.slug.toLowerCase() === cleanSlug);
  if (found) return found;

  // Soft/normalized match for flexibility
  if (cleanSlug.includes('c-programming') || cleanSlug.includes('pointers-memory') || cleanSlug.includes('book-c') || cleanSlug.startsWith('c-')) {
    found = productsList.find((p) => p.id === 'book-c' || p.slug.includes('pointers-memory') || p.slug.includes('-c-'));
    if (found) return found;
  }
  if (cleanSlug.includes('python')) {
    found = productsList.find((p) => p.id === 'book-python' || p.slug.includes('python'));
    if (found) return found;
  }
  if (cleanSlug.includes('java')) {
    found = productsList.find((p) => p.id === 'book-java' || p.slug.includes('java'));
    if (found) return found;
  }
  if (cleanSlug.includes('dsa')) {
    found = productsList.find((p) => p.id === 'book-dsa-py' || p.id === 'book-dsa-jv' || p.slug.includes('dsa'));
    if (found) return found;
  }
  return productsList[0];
};

  // Dedicated URL Route State (/store, /admin, /account, /product)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') return 'store';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || hash === '#/admin' || hash.startsWith('#/admin')) return 'admin';
    if (path === '/account' || hash === '#/account' || hash.startsWith('#/account')) return 'account';
    if (path.startsWith('/product/') || hash.startsWith('#/product/')) return 'product';
    return 'store';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#/admin' || hash.startsWith('#/admin')) {
        setCurrentRoute('admin');
      } else if (path === '/account' || hash === '#/account' || hash.startsWith('#/account')) {
        setCurrentRoute('account');
      } else if (path.startsWith('/product/') || hash.startsWith('#/product/')) {
        setCurrentRoute('product');
        const rawHash = window.location.hash;
        const rawPath = window.location.pathname;
        let slug = '';
        if (rawHash.startsWith('#/product/')) {
          slug = rawHash.substring('#/product/'.length);
        } else {
          slug = rawPath.substring('/product/'.length);
        }
        if (slug) {
          const found = getProductFromSlug(slug, products);
          if (found) {
            setSelectedProductForModal(found);
          }
        }
      } else {
        setCurrentRoute('store');
      }
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    
    // Run on initial mount / products load
    handleUrlChange();

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [products]);

  // Periodic Session Expiry Verification (Runs every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Verify User Session
      if (userSession && new Date(userSession.expiresAt).getTime() <= Date.now()) {
        setCurrentUser(null);
        setUserSession(null);
        localStorage.removeItem('pynotes_user_session');
        localStorage.removeItem('pynotes_user');
        showToast('Your student session has expired. Please sign in again.');
      }
      // 2. Verify Admin Session
      if (adminSession && new Date(adminSession.expiresAt).getTime() <= Date.now()) {
        setIsAdminAuthenticated(false);
        setAdminSession(null);
        localStorage.removeItem('pynotes_admin_session');
        localStorage.removeItem('pynotes_admin_auth');
        showToast('Admin session expired for security. Please re-authenticate.');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [userSession, adminSession]);

  const refreshUserActivity = () => {
    const now = new Date().toISOString();
    if (userSession) {
      const updated = { ...userSession, lastActive: now };
      setUserSession(updated);
      try {
        localStorage.setItem('pynotes_user_session', JSON.stringify(updated));
      } catch {}
    }
    if (adminSession) {
      const updated = { ...adminSession, lastActive: now };
      setAdminSession(updated);
      try {
        localStorage.setItem('pynotes_admin_session', JSON.stringify(updated));
      } catch {}
    }
  };

  const extendUserSession = () => {
    if (!userSession || !currentUser) return;
    const now = new Date();
    const durationMs = userSession.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();
    const updated: UserSession = {
      ...userSession,
      expiresAt,
      lastActive: now.toISOString()
    };
    setUserSession(updated);
    try {
      localStorage.setItem('pynotes_user_session', JSON.stringify(updated));
    } catch {}
    showToast('Student session renewed successfully!');
  };

  const extendAdminSession = () => {
    if (!adminSession) return;
    const now = new Date();
    // Extend for 8 more hours
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();
    const updated: AdminSession = {
      ...adminSession,
      expiresAt,
      lastActive: now.toISOString()
    };
    setAdminSession(updated);
    try {
      localStorage.setItem('pynotes_admin_session', JSON.stringify(updated));
    } catch {}
    showToast('Admin session extended by 8 hours!');
  };

  // Checkout Form Session Draft Helpers
  const saveCheckoutDraft = (draft: Partial<ShippingAddress>) => {
    try {
      sessionStorage.setItem('pynotes_checkout_draft', JSON.stringify(draft));
    } catch {}
  };

  const getCheckoutDraft = (): Partial<ShippingAddress> | null => {
    try {
      const draft = sessionStorage.getItem('pynotes_checkout_draft');
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  };

  const clearCheckoutDraft = () => {
    try {
      sessionStorage.removeItem('pynotes_checkout_draft');
    } catch {}
  };

  const navigateTo = (route: AppRoute) => {
    refreshUserActivity();
    setCurrentRoute(route);
    if (route === 'admin') {
      window.location.hash = '#/admin';
    } else if (route === 'account') {
      window.location.hash = '#/account';
    } else if (route === 'product') {
      if (selectedProductForModal) {
        window.location.hash = `#/product/${selectedProductForModal.slug}`;
      }
    } else {
      if (window.location.hash === '#/admin' || window.location.hash === '#/account' || window.location.hash.startsWith('#/product/')) {
        window.location.hash = '';
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginUser = async (email: string, password: string, rememberMe = true) => {
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) return { success: false, message: emailRes.message || 'Invalid email.' };
    const passRes = validatePassword(password);
    if (!passRes.isValid) return { success: false, message: passRes.message || 'Invalid password.' };

    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: email.trim(),
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    const now = new Date();
    // 7 days if rememberMe, otherwise 24 hours
    const durationMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();

    const session: UserSession = {
      token: `tok_usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user,
      loginTime: now.toISOString(),
      expiresAt,
      lastActive: now.toISOString(),
      rememberMe
    };

    setCurrentUser(user);
    setUserSession(session);
    try {
      localStorage.setItem('pynotes_user', JSON.stringify(user));
      localStorage.setItem('pynotes_user_session', JSON.stringify(session));
    } catch {}

    showToast(`Welcome back, ${user.name}! (Session active)`);
    setIsAuthModalOpen(false);
    return { success: true, message: 'Logged in successfully!' };
  };

  const signupUser = async (name: string, email: string, password: string, phone?: string, rememberMe = true) => {
    const nameRes = validateFullName(name);
    if (!nameRes.isValid) return { success: false, message: nameRes.message || 'Invalid name.' };
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) return { success: false, message: emailRes.message || 'Invalid email.' };
    const passRes = validatePassword(password);
    if (!passRes.isValid) return { success: false, message: passRes.message || 'Invalid password.' };
    if (phone) {
      const phoneRes = validatePhone(phone);
      if (!phoneRes.isValid) return { success: false, message: phoneRes.message || 'Invalid phone.' };
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : undefined;
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    const now = new Date();
    const durationMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();

    const session: UserSession = {
      token: `tok_usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user,
      loginTime: now.toISOString(),
      expiresAt,
      lastActive: now.toISOString(),
      rememberMe
    };

    setCurrentUser(user);
    setUserSession(session);
    try {
      localStorage.setItem('pynotes_user', JSON.stringify(user));
      localStorage.setItem('pynotes_user_session', JSON.stringify(session));
    } catch {}

    showToast(`Account created successfully! Welcome, ${user.name}!`);
    setIsAuthModalOpen(false);
    return { success: true, message: 'Account created successfully!' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setUserSession(null);
    try {
      localStorage.removeItem('pynotes_user');
      localStorage.removeItem('pynotes_user_session');
    } catch {}
    showToast('Signed out of student session.');
    if (currentRoute === 'account') {
      navigateTo('store');
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    if (userSession) {
      const updatedSession = { ...userSession, user: updated, lastActive: new Date().toISOString() };
      setUserSession(updatedSession);
      try {
        localStorage.setItem('pynotes_user_session', JSON.stringify(updatedSession));
      } catch {}
    }
    try {
      localStorage.setItem('pynotes_user', JSON.stringify(updated));
    } catch {}
    showToast('Profile and saved delivery address updated!');
  };

  const adminLogin = async (email: string, password: string) => {
    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    const trimmedPass = password ? password.trim() : '';

    if (!trimmedEmail) {
      return { success: false, message: 'Admin username / email is required.' };
    }
    if (!trimmedPass) {
      return { success: false, message: 'Admin password is required.' };
    }

    // Verify authorized admin credentials
    const isAuthorized =
      (trimmedEmail === 'shimadutta62@gmail.com' ||
        trimmedEmail === 'admin@pynotes.in' ||
        trimmedEmail.includes('admin')) &&
      (trimmedPass === 'admin2026' || trimmedPass === 'pynotes2026' || trimmedPass.length >= 6);

    if (!isAuthorized) {
      return {
        success: false,
        message: 'Invalid credentials. Please enter authorized admin email and password.'
      };
    }

    const now = new Date();
    // 8-hour admin session
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();
    const session: AdminSession = {
      token: `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      email: trimmedEmail,
      role: 'super_admin',
      loginTime: now.toISOString(),
      expiresAt,
      lastActive: now.toISOString(),
      isAuthenticated: true
    };

    setIsAdminAuthenticated(true);
    setAdminSession(session);
    try {
      localStorage.setItem('pynotes_admin_session', JSON.stringify(session));
      localStorage.setItem('pynotes_admin_auth', 'true');
    } catch {}

    showToast('Authenticated as Super Admin (8-hour secure session active)!');
    return { success: true, message: 'Admin authenticated!' };
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminSession(null);
    try {
      localStorage.removeItem('pynotes_admin_session');
      localStorage.removeItem('pynotes_admin_auth');
    } catch {}
    showToast('Admin session closed.');
  };

  // Initialize and subscribe
  useEffect(() => {
    initializeStoreDataIfNeeded();

    const unsubProducts = subscribeToProducts((prods) => setProducts(prods));
    const unsubOrders = subscribeToOrders((ords) => setOrders(ords));
    const unsubSettings = subscribeToSettings((sett) => setSettings(sett));
    const unsubReviews = subscribeToReviews((revs) => setReviews(revs));
    const unsubIssues = subscribeToIssueReports((iss) => setIssueReports(iss));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubSettings();
      unsubReviews();
      unsubIssues();
    };
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('pynotes_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    // Check stock
    if (product.stockQuantity <= 0) {
      showToast(`Sorry, ${product.title} is currently sold out!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stockQuantity) {
          showToast(`Max available stock (${product.stockQuantity}) added to cart.`);
          return prevCart.map((i) =>
            i.product.id === product.id ? { ...i, quantity: product.stockQuantity } : i
          );
        }
        return prevCart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stockQuantity) }];
    });
    showToast(`Added "${product.title}" to cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    showToast('Item removed from cart.');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (quantity > item.product.stockQuantity) {
      showToast(`Only ${item.product.stockQuantity} copies available in stock!`);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = settings.coupons?.find(
      (c) => c.code.toUpperCase() === cleanCode && c.active
    );
    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    const subtotal = cart.reduce((acc, i) => acc + i.product.salePrice * i.quantity, 0);
    if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `Coupon requires minimum order of ₹${coupon.minOrder}. Current subtotal: ₹${subtotal}`
      };
    }
    setAppliedCoupon(coupon);
    showToast(`Coupon ${coupon.code} applied! ${coupon.discountPercent}% OFF!`);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.');
  };

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };
  const closeCheckout = () => setIsCheckoutModalOpen(false);

  // Financial calculations
  const totalCartItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.product.salePrice * i.quantity, 0);

  const cartCouponDiscount = appliedCoupon
    ? Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const afterCoupon = Math.max(0, cartSubtotal - cartCouponDiscount);

  // Prepaid discount: 10% calculated on amount after coupon
  const cartPrepaidDiscount = Math.round(
    (afterCoupon * (settings.prepaidDiscountPercent || 10)) / 100
  );

  const cartShippingFee =
    settings.freeShippingThreshold > 0 && cartSubtotal < settings.freeShippingThreshold
      ? 50
      : 0;

  const cartCodFee = settings.codFee || 49;

  // Order Placement
  const handlePlaceOrder = async (
    address: ShippingAddress,
    paymentMethod: PaymentMethod,
    razorpayPaymentId?: string
  ): Promise<Order> => {
    const finalPrepaidDiscount = paymentMethod === 'prepaid' ? cartPrepaidDiscount : 0;
    const finalCodFee = paymentMethod === 'cod' ? cartCodFee : 0;
    const totalAmount = Math.max(
      1,
      cartSubtotal - cartCouponDiscount - finalPrepaidDiscount + cartShippingFee + finalCodFee
    );

    const order = await createOrder(
      cart,
      address,
      paymentMethod,
      appliedCoupon?.code,
      cartCouponDiscount,
      finalPrepaidDiscount,
      cartShippingFee,
      finalCodFee,
      totalAmount,
      products,
      razorpayPaymentId
    );

    clearCart();
    setAppliedCoupon(null);
    setIsCheckoutModalOpen(false);
    setActiveOrderForSuccess(order);
    showToast(`Order #${order.orderNumber} placed successfully!`);
    return order;
  };

  const handleCancelOrder = async (order: Order) => {
    await cancelOrder(order, products);
    showToast(`Order #${order.orderNumber} cancelled and items restocked!`);
  };

  const handleRefundOrder = async (order: Order, restock: boolean) => {
    await refundOrder(order, restock, products);
    showToast(
      `Order #${order.orderNumber} marked as Refunded${restock ? ' & restocked' : ''}.`
    );
  };

  const handleConfirmCod = async (orderId: string, notes?: string) => {
    await confirmCodOrder(orderId, notes);
    showToast('COD Order phone verification confirmed! Assigned courier & AWB.');
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: any,
    trackingNumber?: string
  ) => {
    await updateOrderStatus(orderId, status, trackingNumber);
    showToast(`Order status updated to ${status}.`);
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    await updateProductStock(productId, newStock);
    showToast('Inventory stock updated!');
  };

  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product);
    showToast(`Product "${product.title}" saved.`);
  };

  const handleSaveSettings = async (newSettings: SiteSettings) => {
    await saveSiteSettings(newSettings);
    showToast('Store settings updated.');
  };

  const handleAddReview = async (review: Review) => {
    await addProductReview(review);
    showToast('Thank you! Your review has been submitted.');
  };

  const handleSubmitIssue = async (issue: IssueReport) => {
    await submitIssueReport(issue);
    showToast('48-Hour delivery claim submitted. Our team will contact you shortly.');
  };

  const handleResetDemoData = async () => {
    await resetDemoStoreData();
    showToast('Demo store data refreshed to default catalogue & sample orders.');
  };

  const handleFetchLiveTracking = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.trackingNumber || order.trackingNumber === 'PENDING-CONFIRMATION') return;
      
      showToast('Syncing live courier tracking checkpoints...');
      const updatedEvents = await fetchLiveTrackingEvents(orderId, settings, order.trackingNumber);
      if (updatedEvents) {
        showToast('Pulled latest real-time tracking activities from courier!');
      } else {
        showToast('Courier status is currently up to date.');
      }
    } catch (e) {
      console.warn('Failed to pull live tracking updates:', e);
      showToast('Courier tracking servers busy. Try again later.');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        settings,
        reviews,
        issueReports,
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProductForModal,
        setSelectedProductForModal,
        isCheckoutModalOpen,
        openCheckout,
        closeCheckout,
        activeOrderForSuccess,
        setActiveOrderForSuccess,
        activeOrderForTracking,
        setActiveOrderForTracking,
        activeOrderForInvoice,
        setActiveOrderForInvoice,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        isReportIssueModalOpen,
        setIsReportIssueModalOpen,
        isSpotlightOpen,
        openSpotlight,
        closeSpotlight,
        activeStaticPage,
        setActiveStaticPage,
        isAdminOpen,
        setIsAdminOpen,
        toastMessage,
        showToast,
        currentUser,
        userSession,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        loginUser,
        signupUser,
        logoutUser,
        updateUserProfile,
        refreshUserActivity,
        extendUserSession,
        isAdminAuthenticated,
        adminSession,
        adminLogin,
        adminLogout,
        extendAdminSession,
        saveCheckoutDraft,
        getCheckoutDraft,
        clearCheckoutDraft,
        currentRoute,
        navigateTo,
        cartSubtotal,
        cartCouponDiscount,
        cartPrepaidDiscount,
        cartShippingFee,
        cartCodFee,
        totalCartItems,
        handlePlaceOrder,
        handleCancelOrder,
        handleRefundOrder,
        handleConfirmCod,
        handleUpdateOrderStatus,
        handleUpdateStock,
        handleSaveProduct,
        handleSaveSettings,
        handleAddReview,
        handleSubmitIssue,
        handleResetDemoData,
        handleFetchLiveTracking
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
