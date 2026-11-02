/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InstallationRequestModal } from './components/customer/InstallationRequestModal';
import { PaymentReceiptModal } from './components/common/PaymentReceiptModal';
import { AuthModal } from './components/auth/AuthModal';
import { PaymentReceipt, UserRole } from './types';
import { ShieldAlert, Wrench, UserCheck, Lock, ArrowRight, Shield } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, currentRole, switchDemoRole, latestReceipt, setLatestReceipt, adminEmailConfig } = useApp();

  // Default tab based on who is logged in
  const [currentTab, setCurrentTab] = useState<'landing' | 'customer' | 'technician' | 'admin'>(() => {
    if (!currentUser) return 'landing';
    if (currentUser.role === 'admin') return 'admin';
    if (currentUser.role === 'technician') return 'technician';
    return 'customer';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedPackageId, setPreselectedPackageId] = useState<string | undefined>(undefined);
  const [preselectedCapacityKw, setPreselectedCapacityKw] = useState<number | undefined>(undefined);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  // If a latest receipt was created from payment, open it
  useEffect(() => {
    if (latestReceipt) {
      setActiveReceipt(latestReceipt);
      setLatestReceipt(null);
    }
  }, [latestReceipt, setLatestReceipt]);

  const handleOpenBookingWithPackage = (pkgId?: string, kw?: number) => {
    setPreselectedPackageId(pkgId);
    setPreselectedCapacityKw(kw);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (_requestId: string) => {
    setIsBookingModalOpen(false);
    setCurrentTab('customer');
  };

  const handlePortalSwitchFromBanner = (tab: 'landing' | 'customer' | 'technician' | 'admin') => {
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Testing Role Switcher Banner */}
      <RoleSwitcherBanner onSwitchPortal={handlePortalSwitchFromBanner} />

      {/* Main Navigation Header - Tailored strictly to logged-in role */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenBooking={() => {
          setPreselectedPackageId(undefined);
          setPreselectedCapacityKw(undefined);
          setIsBookingModalOpen(true);
        }}
      />

      {/* Main Content Area with Protected Route Portals */}
      <main className="flex-1">
        {/* Landing Page */}
        {currentTab === 'landing' && (
          <LandingPage
            onOpenBookingWithPackage={handleOpenBookingWithPackage}
            onNavigateToCustomer={() => {
              if (currentUser) {
                if (currentRole === 'admin') setCurrentTab('admin');
                else if (currentRole === 'technician') setCurrentTab('technician');
                else setCurrentTab('customer');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        )}

        {/* Customer Portal */}
        {currentTab === 'customer' && (
          currentUser ? (
            <CustomerDashboard
              onOpenBooking={() => {
                setPreselectedPackageId(undefined);
                setPreselectedCapacityKw(undefined);
                setIsBookingModalOpen(true);
              }}
              onOpenReceipt={receipt => setActiveReceipt(receipt)}
            />
          ) : (
            /* Protected Gate for Customer */
            <div className="max-w-xl mx-auto my-16 px-4">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">Customer Portal Login Required</h2>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    Sign in to track your 7-stage rooftop solar installation, review monthly EMI schedules, and monitor your PM Surya Ghar central subsidy status.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      switchDemoRole('customer');
                      setCurrentTab('customer');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Login as Demo Customer (Rahul Sharma)
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Custom Sign In / Sign Up
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Technician Portal */}
        {currentTab === 'technician' && (
          currentUser && (currentRole === 'technician' || currentRole === 'admin') ? (
            <TechnicianDashboard />
          ) : (
            /* Protected Gate for Technician */
            <div className="max-w-xl mx-auto my-16 px-4">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
                  <Wrench className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">Technician Portal Restricted</h2>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    This job board is reserved for certified solar field technicians assigned to installation sites and service repairs.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      switchDemoRole('technician');
                      setCurrentTab('technician');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Login as Lead Technician (Vikram Patel)
                  </button>
                  <button
                    onClick={() => setCurrentTab('landing')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Return to Estimator
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Admin Dashboard */}
        {currentTab === 'admin' && (
          currentUser && currentRole === 'admin' ? (
            <AdminDashboard onOpenReceipt={receipt => setActiveReceipt(receipt)} />
          ) : (
            /* Protected Gate for Admin */
            <div className="max-w-xl mx-auto my-16 px-4">
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                    Administrator Authentication Required
                  </span>
                  <h2 className="text-xl font-bold text-stone-900 mt-2">
                    SolarOps Admin Operations Console
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    This management suite is restricted to authorized operations leads with administrative email (<code className="font-mono text-purple-900 font-semibold">{adminEmailConfig}</code>).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setCurrentTab('admin');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Sign In as Admin (Priya Iyer)
                  </button>
                  <button
                    onClick={() => {
                      if (currentUser) {
                        setCurrentTab(currentRole === 'technician' ? 'technician' : 'customer');
                      } else {
                        setCurrentTab('landing');
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Return to My Portal
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={tab => setCurrentTab(tab)} />

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <InstallationRequestModal
          initialPackageId={preselectedPackageId}
          initialCapacityKw={preselectedCapacityKw}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Auth Modal with Role Auto-routing */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(targetRole?: UserRole) => {
            const role = targetRole || currentRole;
            if (role === 'admin') setCurrentTab('admin');
            else if (role === 'technician') setCurrentTab('technician');
            else setCurrentTab('customer');
          }}
        />
      )}

      {/* Payment Receipt Modal */}
      {activeReceipt && (
        <PaymentReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
