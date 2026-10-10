export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string; // 'Python' | 'Java' | 'C/C++' | 'DSA' | 'Web Dev' | 'Systems' | 'Bundles'
  regularPrice: number;
  salePrice: number;
  stockQuantity: number;
  isBundle: boolean;
  bundledProductIds: string[]; // for bundles: IDs of component books
  pages: number;
  shortDescription: string;
  description: string;
  coverImage: string;
  sampleImages: string[];
  features: string[];
  hsnCode: string; // '4901'
  sku: string;
  rating: number;
  reviewCount: number;
  badge?: string; // 'Bestseller' | 'Popular' | 'Hot Deal' | 'Staff Pick'
  isFeatured: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'Pending payment'
  | 'Processing'
  | 'On hold'
  | 'Completed or Shipped'
  | 'Cancelled'
  | 'Refunded'
  | 'Failed';

export type PaymentMethod = 'prepaid' | 'cod';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isBundle: boolean;
  coverImage?: string;
  bundledProductIds?: string[];
}

export interface TrackingEvent {
  status: string;
  timestamp: string;
  location: string;
  note: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PYN-73914"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  prepaidDiscount: number;
  shippingFee: number;
  codFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  codConfirmed: boolean;
  codConfirmedAt?: string;
  trackingNumber: string; // AWB e.g. "SR-DEL-98214"
  courier: string;
  trackingEvents: TrackingEvent[];
  invoiceNumber: string; // e.g. "INV-2026-1042"
  gstin?: string;
  razorpayPaymentId?: string;
  notes?: string;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  text: string;
  highlight?: string;
  active: boolean;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minOrder: number;
  active: boolean;
  expiryDate?: string;
}

export interface SiteSettings {
  storeName: string;
  logoUrl?: string;
  logoHeight?: number;
  announcements: AnnouncementItem[];
  trustTicker: string[];
  prepaidDiscountPercent: number; // e.g. 10
  codFee: number; // e.g. 49
  freeShippingThreshold: number; // 0 for free shipping on all orders
  gstin: string; // e.g. "07AAGCP1234F1Z8"
  legalEntity: string;
  supportPhone: string;
  supportEmail: string;
  coupons: Coupon[];
  serviceablePincodes?: string[];
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
  courierProvider?: 'delhivery' | 'shiprocket' | 'mock';
  courierToken?: string;
  courierSandbox?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  college?: string;
  role?: string;
  verified: boolean;
  date: string;
}

export interface IssueReport {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  savedAddress?: ShippingAddress;
  wishlist: string[];
  createdAt: string;
}

export interface UserSession {
  token: string;
  user: UserProfile;
  loginTime: string;
  expiresAt: string;
  lastActive: string;
  rememberMe: boolean;
}

export interface AdminSession {
  token: string;
  email: string;
  role: 'super_admin' | 'shop_manager';
  loginTime: string;
  expiresAt: string;
  lastActive: string;
  isAuthenticated: boolean;
}

export type AppRoute = 'store' | 'admin' | 'account' | 'product';
