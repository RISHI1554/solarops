import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PackageManagerModal } from './PackageManagerModal';
import { BillGeneratorModal } from './BillGeneratorModal';
import {
  SolarPackage,
  InstallationRequest,
  InstallationStatus,
  StageStatus,
  SubsidyStatus,
  ComplaintStatus,
  Bill,
  EmiSchedule,
  UserProfile,
  PaymentReceipt,
  Complaint,
  SubsidyApplication,
} from '../../types';
import {
  Shield,
  Users,
  Layers,
  Wrench,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  Edit2,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  Zap,
  DollarSign,
  ChevronRight,
  Filter,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Receipt,
  Info,
  Check,
  Building,
  UserPlus,
  Search,
  ExternalLink,
  Save,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenReceipt?: (receipt: PaymentReceipt) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenReceipt }) => {
  const {
    profiles,
    installations,
    stages,
    packages,
    bills,
    emis,
    payments,
    subsidies,
    complaints,
    updateInstallationStatus,
    updateStageStatus,
    updateSubsidyStatus,
    updateComplaint,
    deleteOrDeactivatePackage,
    createPackage,
    exportToCsv,
    adminEmailConfig,
    signUpWithEmail,
    processDemoPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'installations' | 'billing' | 'packages' | 'technicians' | 'subsidies' | 'complaints'
  >('overview');

  // Modals state
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<SolarPackage | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedRequestForBill, setSelectedRequestForBill] = useState<string | undefined>(undefined);

  // Detail & Action Modals (Make everything clickable)
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationRequest | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedSubsidy, setSelectedSubsidy] = useState<SubsidyApplication | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<UserProfile | null>(null);
  const [isCustomersModalOpen, setIsCustomersModalOpen] = useState(false);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [isAddTechModalOpen, setIsAddTechModalOpen] = useState(false);
  const [monthDataModal, setMonthDataModal] = useState<{
    month: string;
    count: number;
    capacity: number;
    revenue: string;
    subsidies: string;
    highlights: string[];
  } | null>(null);
  const [isTurnaroundModalOpen, setIsTurnaroundModalOpen] = useState(false);

  // New Technician form state
  const [techName, setTechName] = useState('');
  const [techEmail, setTechEmail] = useState('');
  const [techPhone, setTechPhone] = useState('');

  // Search & Filters
  const [installFilter, setInstallFilter] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Calculations for summary cards
  const totalCustomers = profiles.filter(p => p.role === 'customer').length || 1;
  const totalInstallations = installations.length;
  const inProgressInstallations = installations.filter(
    i => i.status === 'in_progress' || i.status === 'scheduled'
  ).length;

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalNetBilled = bills.reduce((sum, b) => sum + b.net_payable, 0);
  const totalPendingDues = Math.max(0, totalNetBilled - totalRevenue);
  const openComplaintsCount = complaints.filter(
    c => c.status !== 'resolved' && c.status !== 'closed'
  ).length;

  const overdueEmisCount = emis.filter(
    e => e.status === 'overdue' || (e.status === 'pending' && new Date(e.due_date) < new Date())
  ).length;

  const technicians = profiles.filter(p => p.role === 'technician');

  const filteredInstallations = installations.filter(i => {
    if (installFilter === 'all') return true;
    return i.status === installFilter;
  });

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName || !techEmail) return;

    await signUpWithEmail({
      email: techEmail,
      full_name: techName,
      phone: techPhone || '+91 98000 00000',
      role: 'technician',
    });

    setTechName('');
    setTechEmail('');
    setTechPhone('');
    setIsAddTechModalOpen(false);
  };

  const handleSimulateEmiPayment = async (emi: EmiSchedule) => {
    const receipt = await processDemoPayment(emi.id, 'upi');
    if (onOpenReceipt) onOpenReceipt(receipt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              <Shield className="w-3.5 h-3.5" /> Operations HQ
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500 font-mono">
              Admin: {adminEmailConfig}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
            SolarOps Master Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Click any metric card, chart bar, or table row for full management controls and detailed drill-downs.
          </p>
        </div>

        {/* Quick CSV Export Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToCsv('installations')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Download CSV report of all solar installations"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installations CSV</span>
          </button>
          <button
            onClick={() => exportToCsv('payments')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Download CSV report of all payment transactions"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Payments CSV</span>
          </button>
          <button
            onClick={() => exportToCsv('overdue_emis')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Download CSV report of overdue EMI schedules"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>Overdue CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Summary Metric Cards (ALL FULLY CLICKABLE) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Customers Card -> Opens Customers Directory Modal */}
        <button
          type="button"
          onClick={() => setIsCustomersModalOpen(true)}
          className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs text-left hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Customers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 mt-2 font-mono group-hover:text-emerald-700">
            {totalCustomers}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5 mt-0.5">
            <span>View directory</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </button>

        {/* Requests Card -> Jumps to Installations tab */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('installations');
            setInstallFilter('all');
          }}
          className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs text-left hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-blue-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Requests</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 mt-2 font-mono group-hover:text-blue-700">
            {totalInstallations}
          </div>
          <span className="text-[10px] text-blue-700 font-medium flex items-center gap-0.5 mt-0.5">
            <span>View pipeline</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </button>

        {/* Active Jobs Card -> Jumps to Installations tab filtered to in_progress */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('installations');
            setInstallFilter('in_progress');
          }}
          className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs text-left hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-amber-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Active Jobs</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2 font-mono">
            {inProgressInstallations}
          </div>
          <span className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5 mt-0.5">
            <span>In execution</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </button>

        {/* Revenue Card -> Opens Payments Ledger Modal */}
        <button
          type="button"
          onClick={() => setIsPaymentsModalOpen(true)}
          className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs text-left hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 mt-2 font-mono">
            ₹{totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(0)}k` : totalRevenue}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5 mt-0.5">
            <span>Payment ledger</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </button>

        {/* Pending Dues Card -> Jumps to Billing tab */}
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs text-left hover:border-rose-500 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-rose-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Pending Dues</span>
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-stone-900 mt-2 font-mono group-hover:text-rose-700">
            ₹{totalPendingDues >= 1000 ? `${(totalPendingDues / 1000).toFixed(0)}k` : totalPendingDues}
          </div>
          <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5 mt-0.5">
            <span>{overdueEmisCount} Overdue EMIs</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </button>

        {/* Complaints Card -> Jumps to Complaints tab */}
        <button
          type="button"
          onClick={() => setActiveTab('complaints')}
          className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs text-left hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-purple-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Complaints</span>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900 mt-2 font-mono">
            {openComplaintsCount}
          </div>
          <span className="text-[10px] text-purple-700 font-medium flex items-center gap-0.5 mt-0.5">
            <span>Support desk</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-3 sm:space-x-6 overflow-x-auto text-xs sm:text-sm font-semibold pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Analytics & Overview
          </button>

          <button
            onClick={() => setActiveTab('installations')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'installations'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Installation Requests ({installations.length})
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'billing'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Billing & EMIs ({bills.length})
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'packages'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Solar Packages ({packages.length})
          </button>

          <button
            onClick={() => setActiveTab('subsidies')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'subsidies'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Subsidy Desk ({subsidies.length})
          </button>

          <button
            onClick={() => setActiveTab('technicians')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'technicians'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Technicians ({technicians.length})
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'complaints'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Complaints ({complaints.length})
          </button>
        </nav>
      </div>

      {/* Tab 1: Overview & Visual Analytics */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Monthly Installations Visualizer (ALL BARS CLICKABLE) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Monthly Installation Trajectory</h3>
                <p className="text-xs text-stone-500">
                  Click any month bar below to inspect that month&apos;s installation breakdown
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                +42% Growth MoM
              </span>
            </div>

            {/* Clickable Chart Bars */}
            <div className="h-48 pt-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-2">
              {[
                {
                  month: 'Jun',
                  count: 4,
                  height: '35%',
                  capacity: 12,
                  revenue: '₹2,40,000',
                  subsidies: '₹1,90,000',
                  highlights: ['4 Residential Plants commissioned', 'Avg setup time 19 days', 'DHBVN area'],
                },
                {
                  month: 'Jul',
                  count: 7,
                  height: '55%',
                  capacity: 22,
                  revenue: '₹4,10,000',
                  subsidies: '₹3,40,000',
                  highlights: ['Monsoon rainproof seal testing passed', '7 bifacial systems energized'],
                },
                {
                  month: 'Aug',
                  count: 9,
                  height: '70%',
                  capacity: 29,
                  revenue: '₹5,80,000',
                  subsidies: '₹4,68,000',
                  highlights: ['9 DISCOM net meters installed', 'Delhi BSES area rollout'],
                },
                {
                  month: 'Sep',
                  count: 12,
                  height: '85%',
                  capacity: 38,
                  revenue: '₹7,90,000',
                  subsidies: '₹6,24,000',
                  highlights: ['PM Surya Ghar DBT sanction rate at 100%', '12 independent homes online'],
                },
                {
                  month: 'Oct',
                  count: 15,
                  height: '95%',
                  capacity: 48,
                  revenue: '₹9,20,000',
                  subsidies: '₹7,80,000',
                  highlights: ['Peak commissioning month', 'Highest customer satisfaction rating (4.9/5)'],
                },
                {
                  month: 'Nov',
                  count: 11,
                  height: '75%',
                  current: true,
                  capacity: 35,
                  revenue: '₹7,10,000',
                  subsidies: '₹5,46,000',
                  highlights: ['Active underway projects', 'Winter solar generation optimization active'],
                },
              ].map(bar => (
                <button
                  key={bar.month}
                  type="button"
                  onClick={() => setMonthDataModal(bar)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                  title={`Click to view ${bar.month} metrics`}
                >
                  <span className="text-[10px] font-mono font-bold text-stone-700 group-hover:text-emerald-700 group-hover:scale-110 transition-transform">
                    {bar.count}
                  </span>
                  <div
                    style={{ height: bar.height }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all group-hover:brightness-95 group-hover:shadow-md ${
                      bar.current
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-500'
                        : 'bg-stone-200 group-hover:bg-stone-300'
                    }`}
                  />
                  <span className="text-xs font-semibold text-stone-500 group-hover:text-stone-900 underline decoration-dashed decoration-stone-300">
                    {bar.month}
                  </span>
                </button>
              ))}
            </div>

            {/* Clickable stat links */}
            <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-1 gap-2">
              <button
                type="button"
                onClick={() => setIsTurnaroundModalOpen(true)}
                className="hover:text-emerald-700 font-medium underline decoration-stone-300 flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Avg turnaround: 21 days from survey to grid sync (Click for SLA)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('installations');
                  setInstallFilter('all');
                }}
                className="hover:text-emerald-700 font-medium underline decoration-stone-300 flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total capacity energized: 142 kW (View installations)</span>
              </button>
            </div>
          </div>

          {/* Chart 2: Revenue vs Pending Dues Split (CLICKABLE SECTIONS) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Financial Realization vs Dues</h3>
              <p className="text-xs text-stone-500">
                Click any bar or metric below to open ledger or billing schedules
              </p>
            </div>

            <div className="space-y-4">
              {/* Clickable Revenue Bar */}
              <button
                type="button"
                onClick={() => setIsPaymentsModalOpen(true)}
                className="w-full text-left p-2 -mx-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600 font-medium group-hover:text-emerald-700 flex items-center gap-1">
                    <span>Revenue Collected</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full group-hover:bg-emerald-500 transition-colors"
                    style={{
                      width: `${Math.min(100, Math.round((totalRevenue / Math.max(1, totalNetBilled)) * 100))}%`,
                    }}
                  />
                </div>
              </button>

              {/* Clickable Dues Bar */}
              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className="w-full text-left p-2 -mx-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600 font-medium group-hover:text-rose-700 flex items-center gap-1">
                    <span>Outstanding Dues</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </span>
                  <span className="font-mono font-bold text-rose-700">
                    ₹{totalPendingDues.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full group-hover:bg-rose-600 transition-colors"
                    style={{
                      width: `${Math.min(100, Math.round((totalPendingDues / Math.max(1, totalNetBilled)) * 100))}%`,
                    }}
                  />
                </div>
              </button>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('billing')}
                  className="w-full flex justify-between items-center text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  <span className="underline decoration-stone-300">Total Net Billed:</span>
                  <span className="font-mono font-bold text-stone-900">
                    ₹{totalNetBilled.toLocaleString('en-IN')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('subsidies')}
                  className="w-full flex justify-between items-center text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  <span className="underline decoration-emerald-200">Govt. Subsidies Claimed:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{subsidies.reduce((s, sub) => s + sub.sanctioned_amount, 0).toLocaleString('en-IN')}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRequestForBill(installations[0]?.id);
                  setIsBillModalOpen(true);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Issue New Customer Bill</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaymentsModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                title="View Payments Ledger"
              >
                <Receipt className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Installation Requests Management (EVERY ROW CLICKABLE) */}
      {activeTab === 'installations' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Installation Pipeline</h3>
              <p className="text-xs text-stone-500">
                Click any row to open the complete 7-stage project control drawer & site audit
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={installFilter}
                onChange={e => setInstallFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-800 font-medium cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                type="button"
                onClick={() => setIsCustomersModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customer Directory</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Request Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">System Size</th>
                  <th className="py-3 px-4">DISCOM & Conn</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Assigned Engineer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInstallations.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedInstallation(req)}
                    className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 group-hover:text-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <span>{req.id}</span>
                        <Eye className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{req.customer_name}</div>
                      <div className="text-[11px] text-stone-500">{req.customer_phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">{req.capacity_kw} kW</div>
                      <div className="text-[11px] text-stone-500">{req.roof_type}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-stone-800">{req.electricity_conn_no}</div>
                      <div className="text-stone-500 text-[10px]">{req.discom_provider}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800">Stage {req.current_stage} of 7</span>
                    </td>

                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={req.assigned_technician_id || ''}
                        onChange={e =>
                          updateInstallationStatus(req.id, { assignedTechnicianId: e.target.value })
                        }
                        className="text-xs px-2 py-1 rounded border border-stone-300 bg-white cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.full_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={req.status}
                        onChange={e =>
                          updateInstallationStatus(req.id, { status: e.target.value as any })
                        }
                        className="text-xs px-2 py-1 rounded border border-stone-300 bg-white font-medium capitalize cursor-pointer"
                      >
                        <option value="pending_review">Pending Review</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInstallation(req)}
                          className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequestForBill(req.id);
                            setIsBillModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                        >
                          Bill / EMI
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & EMIs (EVERY CARD CLICKABLE) */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Billing & Receivables</h3>
              <p className="text-xs text-stone-500">
                Click any customer bill to inspect all 12 monthly installments, status, and invoices
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaymentsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>View All Payments ({payments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRequestForBill(installations[0]?.id);
                  setIsBillModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Customer Bill</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bills.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedBill(b)}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-500">{b.id}</span>
                    <h4 className="text-base font-bold text-stone-900 mt-0.5 group-hover:text-emerald-700 flex items-center gap-1.5">
                      <span>{b.customer_name}</span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600" />
                    </h4>
                    <span className="text-xs text-stone-500">{b.package_name}</span>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      b.status === 'fully_paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-2xl text-xs">
                  <div>
                    <span className="text-stone-400">Gross:</span>
                    <div className="font-mono font-semibold text-stone-800">
                      ₹{b.total_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <span className="text-emerald-700">Subsidy:</span>
                    <div className="font-mono font-semibold text-emerald-800">
                      -₹{b.subsidy_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Net Payable:</span>
                    <div className="font-mono font-bold text-stone-900">
                      ₹{b.net_payable.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span>Tenure: {b.emi_tenure_months} months</span>
                  <span className="font-mono font-bold text-stone-900">
                    ₹{b.emi_monthly_amount.toLocaleString('en-IN')} / mo
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold underline">
                    View Installments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Solar Packages (EVERY CARD CLICKABLE) */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Solar Package Catalog</h3>
              <p className="text-xs text-stone-500">
                Click any solar package to edit its technical specifications, capacity, or pricing
              </p>
            </div>

            <button
              onClick={() => {
                setPackageToEdit(null);
                setIsPackageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => {
                  setPackageToEdit(pkg);
                  setIsPackageModalOpen(true);
                }}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {pkg.capacity_kw} kW Plant
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        pkg.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {pkg.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 mt-2 group-hover:text-emerald-700">
                    {pkg.name}
                  </h4>
                  <div className="text-xl font-black font-mono text-stone-900 mt-1">
                    ₹{pkg.price_inr.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-stone-500 mt-2 line-clamp-2">{pkg.description}</p>

                  <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-600 space-y-1">
                    <div>Modules: {pkg.panel_count}x {pkg.panel_type}</div>
                    <div>Inverter: {pkg.inverter_type}</div>
                    <div>Roof space: {pkg.roof_area_sqft} sq.ft</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setPackageToEdit(pkg);
                      setIsPackageModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs text-stone-700 hover:text-stone-900 font-semibold cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Specs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteOrDeactivatePackage(pkg.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                  >
                    {pkg.is_active ? 'Deactivate' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Subsidy Desk (EVERY ROW CLICKABLE) */}
      {activeTab === 'subsidies' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-200">
            <h3 className="text-base font-bold text-stone-900">PM Surya Ghar Subsidy Pipeline</h3>
            <p className="text-xs text-stone-500">
              Click any application row to inspect document status, update bank UTR reference, or adjust notes
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">App Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Sanctioned Amount</th>
                  <th className="py-3 px-4">Portal Status</th>
                  <th className="py-3 px-4">Bank Ref (UTR)</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subsidies.map(sub => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubsidy(sub)}
                    className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 group-hover:text-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <span>{sub.application_number}</span>
                        <Eye className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{sub.customer_name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ₹{sub.sanctioned_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800 capitalize">
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">
                      {sub.bank_ref || 'Pending disbursal'}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <select
                        value={sub.status}
                        onChange={e => updateSubsidyStatus(sub.id, e.target.value as SubsidyStatus)}
                        className="text-xs px-2 py-1 rounded border border-stone-300 bg-white cursor-pointer"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="document_verified">Document Verified</option>
                        <option value="technical_sanction">Technical Sanction</option>
                        <option value="inspection_passed">Inspection Passed</option>
                        <option value="disbursed">Disbursed (DBT)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Technicians (EVERY CARD CLICKABLE + ADD BUTTON) */}
      {activeTab === 'technicians' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Certified Solar Field Technicians</h3>
              <p className="text-xs text-stone-500">
                Click any technician profile to view all assigned rooftop sites, contact logs, or assign new jobs
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddTechModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Technician</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicians.map(t => {
              const activeTechJobs = installations.filter(i => i.assigned_technician_id === t.id);

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTechnician(t)}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-stone-900 group-hover:text-amber-800 flex items-center gap-1.5">
                        <span>{t.full_name}</span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
                      </h4>
                      <p className="text-xs text-stone-500">{t.email}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{t.phone}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Technician
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex justify-between items-center">
                    <span>Active Sites in Execution:</span>
                    <span className="font-mono font-bold text-stone-900">
                      {activeTechJobs.length} Sites (Click to view)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 7: Complaints Desk (EVERY ROW CLICKABLE) */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-200">
            <h3 className="text-base font-bold text-stone-900">Customer Support & Fault Tickets</h3>
            <p className="text-xs text-stone-500">
              Click any complaint row to view full customer issue log, assign technicians, or write resolution notes
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {complaints.map(tck => (
                  <tr
                    key={tck.id}
                    onClick={() => setSelectedComplaint(tck)}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 group-hover:text-purple-700">
                      <div className="flex items-center gap-1.5">
                        <span>{tck.ticket_number}</span>
                        <Eye className="w-3.5 h-3.5 text-stone-400 group-hover:text-purple-600" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{tck.customer_name}</td>
                    <td className="py-3.5 px-4 capitalize text-stone-700">{tck.category.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-stone-800 font-medium">{tck.subject}</td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={tck.assigned_technician_id || ''}
                        onChange={e => updateComplaint(tck.id, tck.status, undefined, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-stone-300 bg-white cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>{t.full_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={tck.status}
                        onChange={e => updateComplaint(tck.id, e.target.value as ComplaintStatus)}
                        className="text-xs px-2 py-1 rounded border border-stone-300 bg-white capitalize cursor-pointer"
                      >
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLICKABLE DRILL-DOWN MODALS */}
      {/* ========================================================================= */}

      {/* 1. Customers Directory Modal */}
      {isCustomersModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Registered Customers Directory</h3>
                  <p className="text-xs text-stone-500">All customer accounts with site addresses & electricity numbers</p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomersModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or email..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {profiles
                .filter(p => p.role === 'customer')
                .filter(p =>
                  customerSearch
                    ? p.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      p.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      (p.phone && p.phone.includes(customerSearch))
                    : true
                )
                .map(cust => {
                  const custInstallations = installations.filter(i => i.customer_id === cust.id || i.customer_email === cust.email);

                  return (
                    <div
                      key={cust.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-stone-900">{cust.full_name}</h4>
                          <div className="text-xs text-stone-500 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-stone-400" />
                              {cust.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" />
                              {cust.phone || 'Phone pending'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-semibold">
                          {custInstallations.length} Sites
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 flex items-start gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>{cust.address || 'Address pending in profile'}</span>
                      </div>

                      {cust.electricity_conn_no && (
                        <div className="text-[11px] font-mono text-stone-500">
                          DISCOM CA: <span className="text-stone-800 font-semibold">{cust.electricity_conn_no}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCustomersModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Payments & Transactions Ledger Modal */}
      {isPaymentsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Payment Transactions Ledger</h3>
                  <p className="text-xs text-stone-500">
                    Total Collected: ₹{totalRevenue.toLocaleString('en-IN')} ({payments.length} simulated receipts)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentsModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Txn Reference</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Payment Channel</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50/60">
                      <td className="py-3 px-3 font-mono font-bold text-stone-800">{p.transaction_ref}</td>
                      <td className="py-3 px-3 font-semibold text-stone-900">{p.customer_name}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono uppercase font-bold text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                          {p.payment_mode}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-stone-500 text-[11px]">
                        {new Date(p.created_at).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenReceipt) {
                              onOpenReceipt({
                                receipt_id: `RCP-${p.id}`,
                                transaction_ref: p.transaction_ref,
                                payment_date: p.created_at,
                                customer_name: p.customer_name || 'Customer',
                                customer_email: 'customer@example.com',
                                bill_id: p.bill_id,
                                installment_number: p.installment_number || 1,
                                amount_paid: p.amount,
                                payment_mode: p.payment_mode,
                                is_demo: true,
                              });
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                        >
                          Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => exportToCsv('payments')}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger to CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPaymentsModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Monthly Breakdown Modal */}
      {monthDataModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-stone-900">
                  {monthDataModal.month} 2026 Performance
                </h3>
              </div>
              <button
                onClick={() => setMonthDataModal(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block">Installations</span>
                <span className="text-xl font-black text-stone-900 font-mono mt-0.5 block">
                  {monthDataModal.count} Sites
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block">Capacity Energized</span>
                <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">
                  {monthDataModal.capacity} kW
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block">Gross Realization</span>
                <span className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">
                  {monthDataModal.revenue}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block">Subsidies Claimed</span>
                <span className="text-sm font-bold text-emerald-700 font-mono mt-0.5 block">
                  {monthDataModal.subsidies}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs space-y-1.5 text-emerald-900">
              <span className="font-bold block">Key Monthly Highlights:</span>
              {monthDataModal.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setMonthDataModal(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Turnaround & SLA Metrics Modal */}
      {isTurnaroundModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-stone-900">
                  Turnkey Execution SLA Benchmark
                </h3>
              </div>
              <button
                onClick={() => setIsTurnaroundModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { stage: 'Stage 1: Site Survey & Shadow Audit', sla: '2 Days', actual: '1.4 Days' },
                { stage: 'Stage 2: DISCOM Feasibility Approval', sla: '5 Days', actual: '4.2 Days' },
                { stage: 'Stage 3: Material & Module Dispatch', sla: '3 Days', actual: '2.8 Days' },
                { stage: 'Stage 4: Elevated Mounting & Clamping', sla: '2 Days', actual: '1.9 Days' },
                { stage: 'Stage 5: Wiring, Inverter & Earthing', sla: '2 Days', actual: '2.0 Days' },
                { stage: 'Stage 6: Net-Meter Replacement', sla: '5 Days', actual: '6.1 Days' },
                { stage: 'Stage 7: Commissioning & App Sync', sla: '2 Days', actual: '1.6 Days' },
              ].map(s => (
                <div key={s.stage} className="flex justify-between items-center p-2.5 bg-stone-50 rounded-xl">
                  <span className="font-medium text-stone-800">{s.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">Target: {s.sla}</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {s.actual}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-stone-500 text-[11px] leading-relaxed">
              Standard 21-day turnkey timeline aligns with Ministry of New and Renewable Energy (MNRE) guidelines for residential rooftop solar grid installations.
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTurnaroundModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold"
              >
                Close SLA Metrics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Installation Detail & 7-Stage Management Modal */}
      {selectedInstallation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[85vh] flex flex-col text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedInstallation.id}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">
                  {selectedInstallation.customer_name} &bull; {selectedInstallation.capacity_kw} kW Plant
                </h3>
              </div>
              <button
                onClick={() => setSelectedInstallation(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {/* Site Details Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold uppercase text-[11px] text-stone-500">Site & DISCOM Profile</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-400">Address:</span>
                    <p className="font-semibold text-stone-800">{selectedInstallation.property_address}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Roof Surface:</span>
                    <p className="font-semibold text-stone-800">{selectedInstallation.roof_type}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">DISCOM:</span>
                    <p className="font-semibold text-stone-800">{selectedInstallation.discom_provider}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Consumer Account No:</span>
                    <p className="font-mono font-semibold text-stone-800">
                      {selectedInstallation.electricity_conn_no}
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-Stage Interactive Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase text-[11px] text-stone-500">
                    7-Stage Project Progress Control
                  </h4>
                  <span className="text-emerald-700 font-semibold font-mono">
                    Current Stage: {selectedInstallation.current_stage} of 7
                  </span>
                </div>

                {(stages[selectedInstallation.id] || []).map(st => (
                  <div
                    key={st.stage_number}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-500">0{st.stage_number}</span>
                        <span className="font-bold text-stone-900">{st.stage_name}</span>
                      </div>
                      {st.technician_notes && (
                        <p className="text-[11px] text-stone-600 mt-1 italic">
                          &ldquo;{st.technician_notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={st.status}
                        onChange={e =>
                          updateStageStatus(
                            selectedInstallation.id,
                            st.stage_number,
                            e.target.value as StageStatus
                          )
                        }
                        className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 bg-white font-medium capitalize cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedRequestForBill(selectedInstallation.id);
                  setSelectedInstallation(null);
                  setIsBillModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Issue Bill for this Request</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInstallation(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Bill Detail & All EMI Installments Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[85vh] flex flex-col text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="font-mono text-xs font-bold text-stone-500">{selectedBill.id}</span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">
                  Contract Installment Ledger &bull; {selectedBill.customer_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 rounded-2xl">
              <div>
                <span className="text-stone-400">Gross Value:</span>
                <div className="font-mono font-bold text-stone-800">
                  ₹{selectedBill.total_amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-emerald-700">Central Subsidy:</span>
                <div className="font-mono font-bold text-emerald-800">
                  -₹{selectedBill.subsidy_amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-stone-900 font-bold">Net Customer Payable:</span>
                <div className="font-mono font-bold text-stone-900">
                  ₹{selectedBill.net_payable.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 border border-stone-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">EMI #</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {emis
                    .filter(e => e.bill_id === selectedBill.id)
                    .map(emi => (
                      <tr key={emi.id} className="hover:bg-stone-50/60">
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          #{emi.installment_number} of {selectedBill.emi_tenure_months}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-600">{emi.due_date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                          ₹{emi.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              emi.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {emi.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {emi.status === 'paid' ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenReceipt) {
                                  onOpenReceipt({
                                    receipt_id: emi.demo_receipt_id || `RCP-${emi.id}`,
                                    transaction_ref: `DEMO-${emi.id}`,
                                    payment_date: emi.paid_at || new Date().toISOString(),
                                    customer_name: selectedBill.customer_name || 'Customer',
                                    customer_email: 'customer@example.com',
                                    bill_id: selectedBill.id,
                                    installment_number: emi.installment_number,
                                    amount_paid: emi.amount,
                                    payment_mode: emi.payment_method || 'upi',
                                    is_demo: true,
                                  });
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                            >
                              Receipt
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSimulateEmiPayment(emi)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Subsidy Edit Modal */}
      {selectedSubsidy && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Inspect Subsidy: {selectedSubsidy.application_number}
                </h3>
                <p className="text-xs text-stone-500">PM Surya Ghar Central Financial Assistance</p>
              </div>
              <button
                onClick={() => setSelectedSubsidy(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Portal Approval Stage</label>
                <select
                  value={selectedSubsidy.status}
                  onChange={e => updateSubsidyStatus(selectedSubsidy.id, e.target.value as SubsidyStatus)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                >
                  <option value="submitted">1. Application Registered on Portal</option>
                  <option value="document_verified">2. Consumer Documents Verified</option>
                  <option value="technical_sanction">3. DISCOM Grid Feasibility Sanctioned</option>
                  <option value="inspection_passed">4. Joint Net-Meter Inspection Passed</option>
                  <option value="disbursed">5. Disbursed directly to Bank (DBT)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Bank UTR / Disbursal Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-SBI-20261028-99420"
                  value={selectedSubsidy.bank_ref || ''}
                  onChange={e =>
                    updateSubsidyStatus(selectedSubsidy.id, selectedSubsidy.status, undefined, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Inspector / DISCOM Notes</label>
                <textarea
                  rows={3}
                  value={selectedSubsidy.notes || ''}
                  onChange={e =>
                    updateSubsidyStatus(selectedSubsidy.id, selectedSubsidy.status, e.target.value)
                  }
                  className="w-full p-3 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubsidy(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Technician Profile & Assignment Modal */}
      {selectedTechnician && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">{selectedTechnician.full_name}</h3>
                <p className="text-xs text-stone-500">{selectedTechnician.email} &bull; {selectedTechnician.phone}</p>
              </div>
              <button
                onClick={() => setSelectedTechnician(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold uppercase text-[11px] text-stone-500">
                Assigned Rooftop Sites (
                {installations.filter(i => i.assigned_technician_id === selectedTechnician.id).length} Active)
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {installations
                  .filter(i => i.assigned_technician_id === selectedTechnician.id)
                  .map(site => (
                    <div
                      key={site.id}
                      onClick={() => {
                        setSelectedTechnician(null);
                        setSelectedInstallation(site);
                      }}
                      className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-stone-900">{site.customer_name}</div>
                        <div className="text-[11px] text-stone-500">{site.property_address}</div>
                      </div>
                      <span className="font-semibold text-emerald-700">Stage {site.current_stage}/7</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTechnician(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Add New Technician Modal */}
      {isAddTechModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Add Field Technician</h3>
              <button
                onClick={() => setIsAddTechModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Technician Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={techName}
                  onChange={e => setTechName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="suresh.tech@solarops.com"
                  value={techEmail}
                  onChange={e => setTechEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98112 00000"
                  value={techPhone}
                  onChange={e => setTechPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTechModalOpen(false)}
                  className="px-4 py-2 text-stone-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Register Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Complaint Detail & Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  {selectedComplaint.ticket_number}
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">{selectedComplaint.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400">Customer Description:</span>
              <p className="text-stone-800 leading-relaxed">{selectedComplaint.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assign Lead Technician</label>
                <select
                  value={selectedComplaint.assigned_technician_id || ''}
                  onChange={e =>
                    updateComplaint(selectedComplaint.id, selectedComplaint.status, undefined, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                >
                  <option value="">Unassigned</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Ticket Status</label>
                <select
                  value={selectedComplaint.status}
                  onChange={e =>
                    updateComplaint(selectedComplaint.id, e.target.value as ComplaintStatus)
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white capitalize"
                >
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Resolution & Remediations</label>
                <textarea
                  rows={3}
                  value={selectedComplaint.resolution_notes || ''}
                  onChange={e =>
                    updateComplaint(selectedComplaint.id, selectedComplaint.status, e.target.value)
                  }
                  placeholder="Notes on replacement components, wiring checks, or meter synchronization..."
                  className="w-full p-3 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold"
              >
                Save Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Manager Modal */}
      {isPackageModalOpen && (
        <PackageManagerModal
          packageToEdit={packageToEdit}
          onClose={() => setIsPackageModalOpen(false)}
        />
      )}

      {/* Bill Generator Modal */}
      {isBillModalOpen && (
        <BillGeneratorModal
          requests={installations}
          initialRequestId={selectedRequestForBill}
          onClose={() => setIsBillModalOpen(false)}
          onSuccess={() => setActiveTab('billing')}
        />
      )}
    </div>
  );
};
