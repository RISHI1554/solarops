import React from 'react';
import { SubsidyApplication } from '../../types';
import {
  Award,
  CheckCircle2,
  Clock,
  Building,
  FileCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface SubsidyTrackerProps {
  subsidy: SubsidyApplication;
}

export const SubsidyTracker: React.FC<SubsidyTrackerProps> = ({ subsidy }) => {
  const STAGES = [
    {
      key: 'submitted',
      label: 'Portal Registration',
      desc: 'Consumer registered on National Solar Portal',
    },
    {
      key: 'document_verified',
      label: 'Document Audit',
      desc: 'Aadhaar, DISCOM CA bill & bank account linked',
    },
    {
      key: 'technical_sanction',
      label: 'Grid Sanction',
      desc: 'DISCOM grid load feasibility approved',
    },
    {
      key: 'inspection_passed',
      label: 'Joint Inspection',
      desc: 'Net-meter commissioned & signed PCR uploaded',
    },
    {
      key: 'disbursed',
      label: 'DBT Disbursed',
      desc: 'Direct subsidy credited to bank account',
    },
  ];

  const getStageIndex = (status: SubsidyApplication['status']) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'document_verified':
        return 1;
      case 'technical_sanction':
        return 2;
      case 'inspection_passed':
        return 3;
      case 'disbursed':
        return 4;
      default:
        return 0;
    }
  };

  const currentIdx = getStageIndex(subsidy.status);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Benefit Transfer (DBT)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              {subsidy.scheme_name}
            </h3>
            <p className="text-xs text-emerald-200">
              National Portal Application No:{' '}
              <span className="font-mono font-bold text-white tracking-wide">
                {subsidy.application_number}
              </span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-5 py-4 rounded-2xl border border-white/15 text-left sm:text-right">
            <span className="text-xs text-emerald-200 block">Sanctioned Central Subsidy</span>
            <div className="text-3xl font-black font-mono mt-0.5">
              ₹{subsidy.sanctioned_amount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-300">Direct to Bank Account</span>
          </div>
        </div>
      </div>

      {/* 5-Step Pipeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Subsidy Approval & Disbursal Progression
        </h4>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-6 right-6 h-0.5 bg-stone-200 -translate-y-6" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STAGES.map((st, i) => {
              const isPast = i < currentIdx;
              const isCurrent = i === currentIdx;
              const isFuture = i > currentIdx;

              return (
                <div key={st.key} className="relative flex md:flex-col items-center md:items-center gap-3 md:text-center">
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-100'
                        : 'bg-stone-100 text-stone-400 border border-stone-200'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>

                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-stone-900">{st.label}</h5>
                    <p className="text-[11px] text-stone-500 leading-tight">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current status update card */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-700">Official Portal Status:</span>
            <span className="font-mono text-emerald-700 font-bold uppercase tracking-wider text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {subsidy.status.replace('_', ' ')}
            </span>
          </div>

          {subsidy.notes && (
            <p className="text-stone-600 leading-relaxed pt-1">
              {subsidy.notes}
            </p>
          )}

          {subsidy.bank_ref && (
            <div className="pt-2 border-t border-stone-200 font-mono text-[11px] text-stone-700">
              Bank UTR Reference: <span className="font-bold">{subsidy.bank_ref}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
