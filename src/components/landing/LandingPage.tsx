import React from 'react';
import { useApp } from '../../context/AppContext';
import { SolarEstimator } from './SolarEstimator';
import {
  Sun,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Truck,
  Wrench,
  Gauge,
  Sparkles,
  Award,
  ChevronRight,
  TrendingDown,
  Building,
} from 'lucide-react';

interface LandingPageProps {
  onOpenBookingWithPackage?: (packageId?: string, capacityKw?: number) => void;
  onNavigateToCustomer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenBookingWithPackage,
  onNavigateToCustomer,
}) => {
  const { packages } = useApp();

  const handleSelectCapacity = (kw: number) => {
    // Find closest package or pass capacity
    const matched = packages.find(p => p.capacity_kw === kw);
    if (onOpenBookingWithPackage) {
      onOpenBookingWithPackage(matched?.id, kw);
    }
  };

  const STAGES_LIST = [
    {
      num: '01',
      title: 'Site Survey & Audit',
      desc: 'Expert drone & 3D shadow analysis to map maximum sunlight irradiation on your rooftop.',
      icon: Gauge,
    },
    {
      num: '02',
      title: 'DISCOM Approval',
      desc: 'Complete submission and grid feasibility clearance handled with your state electricity board.',
      icon: FileCheck2,
    },
    {
      num: '03',
      title: 'Material Delivery',
      desc: 'Dispatch of Tier-1 bifacial panels, hybrid smart inverters, and hot-dip galvanized structures.',
      icon: Truck,
    },
    {
      num: '04',
      title: 'Structure Mounting',
      desc: 'Precision elevated frames anchored with chemical fasteners to withstand 150 km/h wind loads.',
      icon: Wrench,
    },
    {
      num: '05',
      title: 'Wiring & Inverter',
      desc: 'UV-resistant DC/AC cabling, SPD surge arrestors, and 3-tier copper bonded chemical earthing.',
      icon: Zap,
    },
    {
      num: '06',
      title: 'Net-Metering Inspection',
      desc: 'Joint DISCOM inspection & replacement of old meter with bi-directional smart net-meter.',
      icon: Building,
    },
    {
      num: '07',
      title: 'Final Commissioning',
      desc: 'Grid sync, anti-islanding safety validation, and smartphone app monitoring activation.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>PM Surya Ghar: Muft Bijli Yojana Empanelled Installer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
              Generate Your Own Power. <br className="hidden sm:inline" />
              <span className="text-emerald-600">Zero Electricity Bills.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
              End-to-end solar engineering with 7-stage progress tracking, instant central government subsidies up to ₹78,000, and flexible EMI financing.
            </p>
          </div>

          {/* Embedded Solar Estimator */}
          <SolarEstimator onSelectCapacity={handleSelectCapacity} />
        </div>
      </section>

      {/* Solar Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Curated Residential Solutions
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
              Popular Solar Packages
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Pre-engineered systems equipped with TopCon Bifacial modules and 25-year performance warranty.
            </p>
          </div>

          <button
            onClick={onNavigateToCustomer}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Track existing installation</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.filter(p => p.is_active).map(pkg => {
            const isFeatured = pkg.capacity_kw === 3;
            const subsidy = pkg.capacity_kw <= 1 ? 30000 : pkg.capacity_kw <= 2 ? 60000 : 78000;
            const netPrice = pkg.price_inr - subsidy;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl bg-white border p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 ${
                  isFeatured
                    ? 'border-emerald-600 shadow-xl shadow-emerald-50 ring-1 ring-emerald-600'
                    : 'border-stone-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {pkg.capacity_kw} kW System
                    </span>
                    <span className="text-xs text-stone-400">
                      {pkg.warranty_years} Yrs Warranty
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mt-3">{pkg.name}</h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed line-clamp-3">
                    {pkg.description}
                  </p>

                  {/* Pricing Block */}
                  <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-stone-500">Gross Price</span>
                      <span className="text-xs text-stone-500 line-through font-mono">
                        ₹{pkg.price_inr.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-emerald-700 font-medium">
                      <span>Central Subsidy (MNRE)</span>
                      <span className="font-mono font-bold">-₹{subsidy.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-stone-800">Effective Net Cost</span>
                      <span className="text-xl font-extrabold text-stone-900 font-mono">
                        ₹{netPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="mt-5 space-y-2 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{pkg.panel_count}x {pkg.panel_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{pkg.inverter_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Roof space: ~{pkg.roof_area_sqft} sq.ft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Expected yield: ~{pkg.monthly_gen_units} units / month</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenBookingWithPackage) {
                        onOpenBookingWithPackage(pkg.id, pkg.capacity_kw);
                      }
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFeatured
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <span>Request Installation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7-Stage Process Section */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Transparent Execution
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
              Our 7-Stage Turnkey Installation Workflow
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              From the initial rooftop shadow survey to bi-directional net-meter synchronization, track every milestone live through the customer portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES_LIST.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.num}
                  className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-stone-400 mb-3">
                      <span className="font-mono text-sm font-bold text-emerald-600">
                        STAGE {stage.num}
                      </span>
                      <Icon className="w-5 h-5 text-stone-400" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900">{stage.title}</h3>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Real-time technician updates</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PM Surya Ghar Subsidy Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl overflow-hidden relative">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Central Government Financial Assistance</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              PM Surya Ghar: Muft Bijli Yojana
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Under the initiative announced by the Hon'ble Prime Minister, residential consumers receive direct bank transfer subsidies to generate up to 300 units of free electricity every month.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15">
                <div className="text-xs text-emerald-200">1 kW System</div>
                <div className="text-xl font-bold font-mono mt-1">₹30,000</div>
                <div className="text-[11px] text-emerald-200/70 mt-0.5">Direct DBT Subsidy</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15">
                <div className="text-xs text-emerald-200">2 kW System</div>
                <div className="text-xl font-bold font-mono mt-1">₹60,000</div>
                <div className="text-[11px] text-emerald-200/70 mt-0.5">Direct DBT Subsidy</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/15">
                <div className="text-xs text-emerald-200">3 kW or Higher</div>
                <div className="text-xl font-bold font-mono mt-1">₹78,000</div>
                <div className="text-[11px] text-emerald-200/70 mt-0.5">Maximum Central Cap</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No middleman or physical paperwork
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Direct DISCOM net-meter inspection
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Credited within 30 days of commissioning
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
