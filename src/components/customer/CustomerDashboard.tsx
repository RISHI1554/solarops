import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SevenStageTracker } from './SevenStageTracker';
import { BillingAndEmiSchedule } from './BillingAndEmiSchedule';
import { SubsidyTracker } from './SubsidyTracker';
import { ComplaintManager } from './ComplaintManager';
import { CustomerProfile } from './CustomerProfile';
import { PaymentReceipt } from '../../types';
import {
  Sun,
  Layers,
  CreditCard,
  Award,
  AlertCircle,
  User,
  PlusCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CustomerDashboardProps {
  onOpenBooking: () => void;
  onOpenReceipt: (receipt: PaymentReceipt) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenBooking,
  onOpenReceipt,
}) => {
  const { currentUser, installations, stages, bills, emis, subsidies, complaints } = useApp();

  const [activeTab, setActiveTab] = useState<'tracker' | 'billing' | 'subsidy' | 'complaints' | 'profile'>('tracker');

  // Customer's requests
  const customerRequests = installations.filter(i => i.customer_id === currentUser?.id || i.customer_email === currentUser?.email);
  // Default to first request or active one
  const [selectedRequestId, setSelectedRequestId] = useState<string>(customerRequests[0]?.id || '');

  const activeRequest = customerRequests.find(r => r.id === selectedRequestId) || customerRequests[0];
  const activeStages = activeRequest ? (stages[activeRequest.id] || []) : [];
  const activeBill = activeRequest ? bills.find(b => b.request_id === activeRequest.id) : undefined;
  const activeSubsidy = activeRequest ? subsidies.find(s => s.request_id === activeRequest.id) : undefined;
  const customerComplaints = complaints.filter(c => c.customer_id === currentUser?.id || c.request_id === activeRequest?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Customer Portal
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500">{currentUser?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Welcome back, {currentUser?.full_name || 'Valued Customer'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Monitor real-time rooftop solar progress, review EMI billing, track government subsidies, and report issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {customerRequests.length > 1 && (
            <select
              value={selectedRequestId}
              onChange={e => setSelectedRequestId(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium text-stone-800"
            >
              {customerRequests.map(r => (
                <option key={r.id} value={r.id}>
                  {r.package_name || `${r.capacity_kw} kW Plant`} ({r.id})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 pb-3.5 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Installation Tracker (7 Stages)</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 pb-3.5 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & EMI Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('subsidy')}
            className={`flex items-center gap-2 pb-3.5 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'subsidy'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>PM Surya Ghar Subsidy</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 pb-3.5 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Complaints & Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-3.5 px-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      {activeTab === 'tracker' && (
        activeRequest ? (
          <SevenStageTracker request={activeRequest} stages={activeStages} />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
            <Sun className="w-12 h-12 text-emerald-600 mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-stone-900">No Installation Requests Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Get started by requesting your rooftop solar plant with PM Surya Ghar subsidy qualification.
            </p>
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Start Installation Request
            </button>
          </div>
        )
      )}

      {activeTab === 'billing' && (
        activeBill ? (
          <BillingAndEmiSchedule bill={activeBill} emis={emis} onOpenReceipt={onOpenReceipt} />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
            <CreditCard className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-stone-900">No Billing Generated Yet</h3>
            <p className="text-xs text-stone-500 mt-1">
              Your solar bill and EMI schedule will appear here once the site survey and feasibility are approved.
            </p>
          </div>
        )
      )}

      {activeTab === 'subsidy' && (
        activeSubsidy ? (
          <SubsidyTracker subsidy={activeSubsidy} />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
            <Award className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-stone-900">No Subsidy Application Linked</h3>
            <p className="text-xs text-stone-500 mt-1">
              Subsidy applications are automatically registered when an installation request is initiated.
            </p>
          </div>
        )
      )}

      {activeTab === 'complaints' && (
        <ComplaintManager complaints={customerComplaints} requestId={activeRequest?.id} />
      )}

      {activeTab === 'profile' && <CustomerProfile />}
    </div>
  );
};
