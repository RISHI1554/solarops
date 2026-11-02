import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Shield, Wrench, User, LogOut, Menu, X, PlusCircle, LayoutDashboard, ChevronRight } from 'lucide-react';

interface HeaderProps {
  currentTab: 'landing' | 'customer' | 'technician' | 'admin';
  setCurrentTab: (tab: 'landing' | 'customer' | 'technician' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenBooking,
}) => {
  const { currentUser, currentRole, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'technician':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
            <Wrench className="w-3 h-3" /> Technician
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            <User className="w-3 h-3" /> Customer
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (currentUser) {
                if (currentRole === 'admin') setCurrentTab('admin');
                else if (currentRole === 'technician') setCurrentTab('technician');
                else setCurrentTab('customer');
              } else {
                setCurrentTab('landing');
              }
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Sun className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-stone-900">
                  Solar<span className="text-emerald-600">Ops</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                  {currentUser ? (currentRole === 'admin' ? 'Admin Portal' : currentRole === 'technician' ? 'Technician' : 'Customer') : 'India'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Solar Energy Installation & Billing Management
              </p>
            </div>
          </div>

          {/* Desktop Nav - STRICTLY ROLE-APPROPRIATE */}
          <nav className="hidden md:flex items-center gap-1">
            {/* If NOT logged in, show Landing options */}
            {!currentUser && (
              <>
                <button
                  onClick={() => setCurrentTab('landing')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentTab === 'landing'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Solar Estimator & Plans
                </button>
              </>
            )}

            {/* If logged in as ADMIN -> ONLY show Admin Console and Estimator */}
            {currentUser && currentRole === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-purple-50 text-purple-900 font-bold shadow-2xs border border-purple-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Admin Operations Console</span>
                </button>

                <button
                  onClick={() => setCurrentTab('landing')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentTab === 'landing'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Solar Estimator & Packages
                </button>
              </>
            )}

            {/* If logged in as TECHNICIAN -> ONLY show Technician Portal and Estimator */}
            {currentUser && currentRole === 'technician' && (
              <>
                <button
                  onClick={() => setCurrentTab('technician')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentTab === 'technician'
                      ? 'bg-amber-50 text-amber-900 font-bold shadow-2xs border border-amber-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>Technician Job Board</span>
                </button>

                <button
                  onClick={() => setCurrentTab('landing')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentTab === 'landing'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Solar Estimator & Specs
                </button>
              </>
            )}

            {/* If logged in as CUSTOMER -> ONLY show Customer Portal and Estimator */}
            {currentUser && currentRole === 'customer' && (
              <>
                <button
                  onClick={() => setCurrentTab('customer')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentTab === 'customer'
                      ? 'bg-emerald-50 text-emerald-900 font-bold shadow-2xs border border-emerald-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span>My Customer Portal</span>
                </button>

                <button
                  onClick={() => setCurrentTab('landing')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentTab === 'landing'
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Savings Estimator & Plans
                </button>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {(!currentUser || currentRole === 'customer') && (
              <button
                onClick={onOpenBooking}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:shadow-emerald-200 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Installation</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="text-right">
                  <div className="text-xs font-semibold text-stone-900 truncate max-w-[140px]">
                    {currentUser.full_name}
                  </div>
                  <div className="flex justify-end">{getRoleBadge()}</div>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setCurrentTab('landing');
                  }}
                  title="Sign Out"
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {(!currentUser || currentRole === 'customer') && (
              <button
                onClick={onOpenBooking}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white"
              >
                Book
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {!currentUser && (
            <button
              onClick={() => {
                setCurrentTab('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-700"
            >
              Solar Estimator & Plans
            </button>
          )}

          {currentUser && currentRole === 'admin' && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-purple-900 bg-purple-50"
              >
                Admin Console
              </button>
              <button
                onClick={() => {
                  setCurrentTab('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-700"
              >
                Solar Estimator
              </button>
            </>
          )}

          {currentUser && currentRole === 'technician' && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('technician');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-amber-900 bg-amber-50"
              >
                Technician Portal
              </button>
              <button
                onClick={() => {
                  setCurrentTab('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-700"
              >
                Solar Estimator
              </button>
            </>
          )}

          {currentUser && currentRole === 'customer' && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('customer');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-emerald-900 bg-emerald-50"
              >
                Customer Portal
              </button>
              <button
                onClick={() => {
                  setCurrentTab('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-stone-700"
              >
                Solar Estimator
              </button>
            </>
          )}

          <div className="pt-3 border-t border-stone-200">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{currentUser.full_name}</p>
                  <p className="text-xs text-stone-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setCurrentTab('landing');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 bg-stone-900 text-white rounded-lg text-sm font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
