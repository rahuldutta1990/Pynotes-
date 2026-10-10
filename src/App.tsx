/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { TrustTicker } from './components/TrustTicker';
import { Hero } from './components/Hero';
import { ComparisonSection } from './components/ComparisonSection';
import { ProductCatalog } from './components/ProductCatalog';
import { RecommendedProducts } from './components/RecommendedProducts';
import { FAQSection } from './components/FAQSection';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { StaticPagesModal } from './components/StaticPagesModal';
import { AuthModal } from './components/AuthModal';
import { SpotlightSearchModal } from './components/SpotlightSearchModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { AdminLoginPage } from './components/Admin/AdminLoginPage';
import { MyAccountPage } from './components/Account/MyAccountPage';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Chatbot } from './components/Chatbot';
import { CheckCircle2 } from 'lucide-react';

const ToastNotification: React.FC = () => {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-70 bg-[#071E38] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-[#0B3561] animate-in slide-in-from-bottom-3 duration-200">
      <CheckCircle2 className="w-4 h-4 text-[#12A5B0] shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};

const MainStorefront: React.FC = () => {
  const { currentRoute } = useStore();

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#071E38] flex flex-col font-body selection:bg-[#DDF3F4] selection:text-[#0B3561]">
      <Header />
      <main className="flex-1">
        {currentRoute === 'product' ? (
          <ProductDetailsPage />
        ) : (
          <>
            <Hero />
            <TrustTicker />
            <ComparisonSection />
            <ProductCatalog />
            <RecommendedProducts />
            <FAQSection />
          </>
        )}
      </main>
      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderTrackingModal />
      <InvoiceModal />
      <ReportIssueModal />
      <StaticPagesModal />
      <AuthModal />
      <SpotlightSearchModal />
      <ToastNotification />
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { currentRoute, isAdminAuthenticated } = useStore();

  // 1. Separate URL: Admin Panel with Login Page (/admin or #/admin)
  if (currentRoute === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <>
          <AdminLoginPage />
          <ToastNotification />
        </>
      );
    }
    return (
      <>
        <AdminPanel isStandalone={true} />
        <ToastNotification />
      </>
    );
  }

  // 2. Separate URL: My Account Page (/account or #/account)
  if (currentRoute === 'account') {
    return (
      <>
        <MyAccountPage />
        <AuthModal />
        <OrderTrackingModal />
        <InvoiceModal />
        <ReportIssueModal />
        <ToastNotification />
      </>
    );
  }

  // 3. Default Storefront Route
  return <MainStorefront />;
};


export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
      <WhatsAppButton />
      <Chatbot />
    </StoreProvider>
  );
}
