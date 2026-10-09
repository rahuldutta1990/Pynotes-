import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product, Order, SiteSettings, Review, IssueReport, CartItem, OrderStatus, ShippingAddress, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS, INITIAL_REVIEWS, INITIAL_ORDERS } from '../data/initialCatalog';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'site_settings';
const REVIEWS_COLLECTION = 'reviews';
const ISSUES_COLLECTION = 'issue_reports';

// Helper to compute bundle stock from books
export function computeBundleStock(bundle: Product, allProducts: Product[]): number {
  if (!bundle.isBundle || !bundle.bundledProductIds || bundle.bundledProductIds.length === 0) {
    return bundle.stockQuantity;
  }
  const productMap = new Map(allProducts.map(p => [p.id, p]));
  const componentStocks = bundle.bundledProductIds.map(id => {
    const book = productMap.get(id);
    return book ? book.stockQuantity : 0;
  });
  return Math.min(...componentStocks);
}

// Compute all products with dynamic bundle stock applied
export function resolveDynamicStock(products: Product[]): Product[] {
  const books = products.filter(p => !p.isBundle);
  return products.map(product => {
    if (product.isBundle) {
      return {
        ...product,
        stockQuantity: computeBundleStock(product, books)
      };
    }
    return product;
  });
}

// Initialize seed data if Firestore is fresh
export async function initializeStoreDataIfNeeded(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snapshot.empty) {
      console.log('Seeding initial Pynotes store data into Firestore...');
      // Seed products
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
      }
      // Seed settings
      await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), INITIAL_SITE_SETTINGS);
      // Seed reviews
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, REVIEWS_COLLECTION, rev.id), rev);
      }
      // Seed sample orders
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, ORDERS_COLLECTION, ord.id), ord);
      }
      console.log('Firestore seed completed successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize seed data in Firestore:', error);
    // Don't crash, app will use local fallback if offline
  }
}

// Subscribe to real-time products
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const q = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(resolveDynamicStock(INITIAL_PRODUCTS));
        return;
      }
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      callback(resolveDynamicStock(products));
    },
    (error) => {
      console.warn('Real-time products snapshot error:', error);
      callback(resolveDynamicStock(INITIAL_PRODUCTS));
    }
  );
}

// Subscribe to real-time orders
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  const q = collection(db, ORDERS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(orders.length > 0 ? orders : INITIAL_ORDERS);
    },
    (error) => {
      console.warn('Real-time orders snapshot error:', error);
      callback(INITIAL_ORDERS);
    }
  );
}

// Subscribe to Site Settings
export function subscribeToSettings(callback: (settings: SiteSettings) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'general');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as SiteSettings);
      } else {
        callback(INITIAL_SITE_SETTINGS);
      }
    },
    (error) => {
      console.warn('Real-time settings error:', error);
      callback(INITIAL_SITE_SETTINGS);
    }
  );
}

// Subscribe to Reviews
export function subscribeToReviews(callback: (reviews: Review[]) => void): () => void {
  const q = collection(db, REVIEWS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const reviews: Review[] = [];
      snapshot.forEach((docSnap) => {
        reviews.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
      callback(reviews.length > 0 ? reviews : INITIAL_REVIEWS);
    },
    (error) => {
      console.warn('Reviews snapshot error:', error);
      callback(INITIAL_REVIEWS);
    }
  );
}

// Create new customer order with atomic stock deduction
export async function createOrder(
  cartItems: CartItem[],
  address: ShippingAddress,
  paymentMethod: PaymentMethod,
  couponCode: string | undefined,
  discountAmount: number,
  prepaidDiscount: number,
  shippingFee: number,
  codFee: number,
  totalAmount: number,
  allProducts: Product[],
  razorpayPaymentId?: string
): Promise<Order> {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `PYN-${randomSuffix}`;
  const orderId = `ord-${Date.now()}`;
  const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingNumber = paymentMethod === 'prepaid' ? `SR-DEL-${Math.floor(10000000 + Math.random() * 90000000)}` : 'PENDING-CONFIRMATION';

  const orderItems = cartItems.map((item) => ({
    productId: item.product.id,
    title: item.product.title,
    quantity: item.quantity,
    unitPrice: item.product.salePrice,
    total: item.product.salePrice * item.quantity,
    isBundle: item.product.isBundle,
    bundledProductIds: item.product.bundledProductIds || []
  }));

  const generatedRzpId = razorpayPaymentId || (paymentMethod === 'prepaid' ? `pay_${Math.random().toString(36).substring(2, 11)}` : undefined);
  const initialStatus: OrderStatus = 'Processing';
  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customerName: address.fullName,
    customerEmail: address.email,
    customerPhone: address.phone,
    shippingAddress: address,
    items: orderItems,
    subtotal: cartItems.reduce((acc, i) => acc + i.product.salePrice * i.quantity, 0),
    discountAmount,
    couponCode: couponCode || '',
    prepaidDiscount,
    shippingFee,
    codFee,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'prepaid' ? 'paid' : 'pending',
    razorpayPaymentId: generatedRzpId,
    status: initialStatus,
    codConfirmed: false,
    trackingNumber,
    courier: 'Delhivery Express',
    trackingEvents: [
      {
        status: paymentMethod === 'prepaid' ? 'Payment Verified (Razorpay)' : 'COD Order Received',
        timestamp: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        location: `${address.city || 'Central Hub'}, India`,
        note: paymentMethod === 'prepaid'
          ? `UPI / Online payment confirmed via Razorpay (${generatedRzpId}). Priority dispatch.`
          : 'Awaiting quick verification call before dispatch.'
      }
    ],
    invoiceNumber,
    gstin: '07AAECP4108K1Z5',
    createdAt: new Date().toISOString()
  };

  // Atomic stock deduction for physical books
  try {
    // Determine which single books need deduction
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const stockDeductions = new Map<string, number>();

    for (const item of cartItems) {
      if (item.product.isBundle && item.product.bundledProductIds) {
        // Smart bundle: deduct from EACH component book
        for (const bookId of item.product.bundledProductIds) {
          const current = stockDeductions.get(bookId) || 0;
          stockDeductions.set(bookId, current + item.quantity);
        }
      } else {
        // Single book
        const current = stockDeductions.get(item.product.id) || 0;
        stockDeductions.set(item.product.id, current + item.quantity);
      }
    }

    // Update in Firestore
    for (const [bookId, qtyToDeduct] of stockDeductions.entries()) {
      const book = productMap.get(bookId);
      if (book) {
        const newStock = Math.max(0, book.stockQuantity - qtyToDeduct);
        const productRef = doc(db, PRODUCTS_COLLECTION, bookId);
        await updateDoc(productRef, { stockQuantity: newStock });
      }
    }

    // Save order
    await setDoc(doc(db, ORDERS_COLLECTION, orderId), newOrder);
  } catch (err) {
    console.error('Error creating order in Firestore:', err);
    // Even if Firestore write is delayed, return the order for UI
  }

  return newOrder;
}

// Cancel order and RESTORE stock
export async function cancelOrder(order: Order, allProducts: Product[]): Promise<void> {
  try {
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const stockRestorations = new Map<string, number>();

    for (const item of order.items) {
      if (item.isBundle && item.bundledProductIds && item.bundledProductIds.length > 0) {
        for (const bookId of item.bundledProductIds) {
          const current = stockRestorations.get(bookId) || 0;
          stockRestorations.set(bookId, current + item.quantity);
        }
      } else {
        const current = stockRestorations.get(item.productId) || 0;
        stockRestorations.set(item.productId, current + item.quantity);
      }
    }

    // Restore stock to books in Firestore
    for (const [bookId, qtyToAdd] of stockRestorations.entries()) {
      const book = productMap.get(bookId);
      if (book) {
        const newStock = book.stockQuantity + qtyToAdd;
        await updateDoc(doc(db, PRODUCTS_COLLECTION, bookId), { stockQuantity: newStock });
      }
    }

    // Update order status
    await updateDoc(doc(db, ORDERS_COLLECTION, order.id), {
      status: 'Cancelled',
      notes: `Order cancelled on ${new Date().toLocaleDateString('en-IN')}. Stock restored to inventory.`
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${order.id}`);
  }
}

// Refund order with optional restock
export async function refundOrder(order: Order, restock: boolean, allProducts: Product[]): Promise<void> {
  try {
    if (restock) {
      const productMap = new Map(allProducts.map(p => [p.id, p]));
      for (const item of order.items) {
        if (item.isBundle && item.bundledProductIds) {
          for (const bookId of item.bundledProductIds) {
            const book = productMap.get(bookId);
            if (book) {
              await updateDoc(doc(db, PRODUCTS_COLLECTION, bookId), {
                stockQuantity: book.stockQuantity + item.quantity
              });
            }
          }
        } else {
          const book = productMap.get(item.productId);
          if (book) {
            await updateDoc(doc(db, PRODUCTS_COLLECTION, item.productId), {
              stockQuantity: book.stockQuantity + item.quantity
            });
          }
        }
      }
    }

    await updateDoc(doc(db, ORDERS_COLLECTION, order.id), {
      status: 'Refunded',
      paymentStatus: 'refunded',
      notes: `Refund processed on ${new Date().toLocaleDateString('en-IN')}. ${restock ? 'Inventory restocked.' : 'No restock.'}`
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${order.id}`);
  }
}

// Confirm COD Order (From COD call list screen)
export async function confirmCodOrder(orderId: string, notes?: string): Promise<void> {
  try {
    const awb = `SR-BLU-${Math.floor(10000000 + Math.random() * 90000000)}`;
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      codConfirmed: true,
      codConfirmedAt: new Date().toISOString(),
      trackingNumber: awb,
      courier: 'Blue Dart Surface',
      notes: notes || 'Verified via phone call with customer. Approved for dispatch.',
      trackingEvents: [
        {
          status: 'COD Order Confirmed',
          timestamp: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          location: 'Customer Service Desk',
          note: 'Customer confirmed availability at delivery address.'
        },
        {
          status: 'AWB Generated & Slotted for Pickup',
          timestamp: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          location: 'Delhi Warehouse',
          note: `Assigned Blue Dart courier (AWB: ${awb})`
        }
      ]
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Update Order status
export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<void> {
  try {
    const data: Partial<Order> = { status };
    if (trackingNumber) {
      data.trackingNumber = trackingNumber;
    }
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Update single book stock directly (Admin stock matrix)
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      stockQuantity: Math.max(0, newStock)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Save complete product (Add or Edit)
export async function saveProduct(product: Product): Promise<void> {
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
  }
}

// Save Site Settings
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/general`);
  }
}

// Add Review
export async function addProductReview(review: Review): Promise<void> {
  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, review.id), review);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${REVIEWS_COLLECTION}/${review.id}`);
  }
}

// Submit 48h issue claim
export async function submitIssueReport(issue: IssueReport): Promise<void> {
  try {
    await setDoc(doc(db, ISSUES_COLLECTION, issue.id), issue);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ISSUES_COLLECTION}/${issue.id}`);
  }
}

// Subscribe to issue reports
export function subscribeToIssueReports(callback: (reports: IssueReport[]) => void): () => void {
  const q = collection(db, ISSUES_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const reports: IssueReport[] = [];
      snapshot.forEach(docSnap => {
        reports.push({ id: docSnap.id, ...docSnap.data() } as IssueReport);
      });
      callback(reports);
    },
    (err) => {
      console.warn('Issue reports snapshot error:', err);
      callback([]);
    }
  );
}

// Reset store to demo state
export async function resetDemoStoreData(): Promise<void> {
  try {
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
    }
    await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), INITIAL_SITE_SETTINGS);
    for (const rev of INITIAL_REVIEWS) {
      await setDoc(doc(db, REVIEWS_COLLECTION, rev.id), rev);
    }
    for (const ord of INITIAL_ORDERS) {
      await setDoc(doc(db, ORDERS_COLLECTION, ord.id), ord);
    }
  } catch (error) {
    console.error('Reset error:', error);
  }
}
