import React, { useState } from 'react';
import { Sun, Zap, IndianRupee, ArrowRight, ShieldCheck, TreePine, Award } from 'lucide-react';

interface SolarEstimatorProps {
  onSelectCapacity: (kw: number) => void;
}

export const SolarEstimator: React.FC<SolarEstimatorProps> = ({ onSelectCapacity }) => {
  const [monthlyBill, setMonthlyBill] = useState<number>(4500);

  // Solar calculations
  const averageTariffPerUnit = 7.5; // Average Indian residential tier tariff
  const monthlyUnits = Math.round(monthlyBill / averageTariffPerUnit);

  // Recommended kW (roughly 120 units per kW per month)
  let recommendedKw = Math.round((monthlyUnits / 120) * 10) / 10;
  if (recommendedKw < 1) recommendedKw = 1;
  if (recommendedKw > 15) recommendedKw = 15;

  // Round to nearest neat number for presentation (1, 2, 3, 4, 5, 6, 7, 8, 10, etc.)
  const normalizedKw = Math.round(recommendedKw);

  const roofAreaRequired = normalizedKw * 90; // sq ft
  const estimatedMonthlyGen = normalizedKw * 120; // kWh units
  const estimatedMonthlySavings = Math.min(monthlyBill, Math.round(estimatedMonthlyGen * averageTariffPerUnit));
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;
  const lifetime25YrSavings = estimatedAnnualSavings * 25;

  // PM Surya Ghar Central Financial Assistance (CFA) Scheme Subsidy:
  // 1 kW: ₹30,000
  // 2 kW: ₹60,000
  // 3 kW or above: ₹78,000 max for residential rooftop
  let subsidyAmount = 0;
  if (normalizedKw <= 1) {
    subsidyAmount = 30000;
  } else if (normalizedKw === 2) {
    subsidyAmount = 60000;
  } else {
    subsidyAmount = 78000;
  }

  // Benchmarked system gross cost in India (~₹60,000 per kW)
  const grossCost = normalizedKw * 62000;
  const netInvestment = Math.max(0, grossCost - subsidyAmount);
  const paybackYears = (netInvestment / Math.max(1, estimatedAnnualSavings)).toFixed(1);
  const treesOffset = Math.round(normalizedKw * 48); // Trees equivalent per year

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-8 md:p-10">
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
          <Sun className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive Solar Calculator & Subsidy Estimator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Calculate Your Rooftop Solar Potential & Savings
        </h2>
        <p className="text-sm text-stone-600 mt-2">
          Find the ideal solar capacity for your home based on your monthly electricity bill and check your eligible PM Surya Ghar central government subsidy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Current Monthly Electricity Bill
              </label>
              <span className="text-xl font-extrabold text-stone-900 font-mono">
                ₹{monthlyBill.toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="25000"
              step="250"
              value={monthlyBill}
              onChange={e => setMonthlyBill(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-stone-400 font-mono">
              <span>₹1,000/mo</span>
              <span>₹10,000/mo</span>
              <span>₹25,000/mo</span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span>Estimated consumption:</span>
              <span className="font-semibold text-stone-800 font-mono">
                ~{monthlyUnits} units / month
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Presets:</span>
            {[2000, 4500, 8000, 15000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setMonthlyBill(val)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  monthlyBill === val
                    ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                ₹{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>

          {/* Subsidy Highlight Badge */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
              <Award className="w-4 h-4 text-amber-700" />
              <span>PM Surya Ghar: Muft Bijli Yojana</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              You are eligible for <span className="font-bold underline decoration-amber-400">₹{subsidyAmount.toLocaleString('en-IN')} direct DBT subsidy</span> deposited directly into your bank account by the Ministry of New & Renewable Energy (MNRE).
            </p>
          </div>
        </div>

        {/* Right Column: Output Metrics Grid */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Recommended System
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                {normalizedKw} kW
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Rooftop Solar Plant
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Roof Area Needed
              </div>
              <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
                {roofAreaRequired} <span className="text-xs font-normal text-stone-500">sq.ft</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Shadow-free space
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Monthly Generation
              </div>
              <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
                {estimatedMonthlyGen} <span className="text-xs font-normal text-stone-500">kWh</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Clean electricity
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Annual Savings
              </div>
              <div className="text-xl font-black text-stone-900 mt-1 font-mono text-emerald-700">
                ₹{estimatedAnnualSavings.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Saved on power bills
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Payback Period
              </div>
              <div className="text-xl font-black text-stone-900 mt-1 font-mono">
                ~{paybackYears} <span className="text-xs font-normal text-stone-500">Years</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                25-Yr panel lifespan
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/60">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Green Impact
              </div>
              <div className="text-xl font-black text-emerald-900 mt-1 font-mono flex items-center gap-1">
                <TreePine className="w-5 h-5 text-emerald-600" />
                <span>{treesOffset}</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Trees planted equivalent
              </div>
            </div>
          </div>

          {/* Investment Breakdown Card */}
          <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div>
                <span className="text-xs text-stone-400 font-medium">Estimated Net Investment</span>
                <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5 font-mono">
                  ₹{netInvestment.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-0.5">
                <div className="text-stone-400">
                  Gross System Cost: <span className="line-through text-stone-500 font-mono">₹{grossCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-emerald-400 font-medium">
                  Central Subsidy: <span className="font-mono font-bold">-₹{subsidyAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-down financing & easy EMI options available from ₹{Math.round(netInvestment / 24).toLocaleString('en-IN')}/mo</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectCapacity(normalizedKw)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book {normalizedKw} kW Plant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
