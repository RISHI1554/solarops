import React from 'react';
import { InstallationRequest, InstallationStage } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Truck,
  Wrench,
  Zap,
  Building,
  Sparkles,
  Phone,
  Calendar,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface SevenStageTrackerProps {
  request: InstallationRequest;
  stages: InstallationStage[];
}

export const SevenStageTracker: React.FC<SevenStageTrackerProps> = ({ request, stages }) => {
  // Sort stages 1 to 7
  const sortedStages = [...stages].sort((a, b) => a.stage_number - b.stage_number);

  const STAGE_ICONS = [
    FileCheck2, // 1. Survey
    ShieldCheck, // 2. Approval
    Truck, // 3. Delivery
    Wrench, // 4. Mounting
    Zap, // 5. Wiring
    Building, // 6. Net-metering
    Sparkles, // 7. Commissioning
  ];

  const getStatusBadge = (status: InstallationStage['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> In Progress
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const completedCount = sortedStages.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Assigned Technician */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Summary Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Installation Status Tracker
              </div>
              <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                {request.package_name || `${request.capacity_kw} kW Rooftop Solar`}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-stone-900 font-mono">
                {progressPercent}%
              </span>
              <span className="text-xs text-stone-500 block">Overall Completion</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-stone-100">
            <div>
              <span className="text-stone-400">Request Ref:</span>
              <div className="font-mono font-semibold text-stone-800">{request.id}</div>
            </div>
            <div>
              <span className="text-stone-400">Current Phase:</span>
              <div className="font-semibold text-stone-900">
                Stage {request.current_stage} of 7
              </div>
            </div>
            <div>
              <span className="text-stone-400">Scheduled Date:</span>
              <div className="font-semibold text-stone-900">
                {request.scheduled_date || 'Site visit pending'}
              </div>
            </div>
            <div>
              <span className="text-stone-400">Est. Commissioning:</span>
              <div className="font-semibold text-stone-900">
                {request.estimated_completion_date || 'Within 25 Days'}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Technician Card */}
        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Assigned Field Engineer
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  {request.assigned_technician_name || 'Vikram Patel'}
                </h4>
                <p className="text-xs text-stone-500">Senior Solar Lead Technician</p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Certified MNRE Installer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 mt-4">
            <a
              href={`tel:${request.assigned_technician_phone || '+91 98112 34567'}`}
              className="w-full py-2 px-3 rounded-xl bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{request.assigned_technician_phone || '+91 98112 34567'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 7-Stage Detailed Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        <h4 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-6">
          7-Stage Turnkey Installation Milestone Log
        </h4>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200">
          {sortedStages.map((stage, idx) => {
            const Icon = STAGE_ICONS[stage.stage_number - 1] || CheckCircle2;
            const isCurrent = stage.stage_number === request.current_stage;
            const isCompleted = stage.status === 'completed';

            return (
              <div key={stage.id || stage.stage_number} className="relative flex items-start gap-4">
                {/* Node icon circle */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-amber-500 border-amber-500 text-stone-950 ring-4 ring-amber-100 shadow-xs'
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Stage Content Card */}
                <div
                  className={`flex-1 rounded-2xl p-4 sm:p-5 border transition-all ${
                    isCurrent
                      ? 'bg-amber-50/40 border-amber-200 shadow-xs ring-1 ring-amber-200/60'
                      : 'bg-stone-50/60 border-stone-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-400">
                          STAGE 0{stage.stage_number}
                        </span>
                        <h5 className="text-sm font-bold text-stone-900">{stage.stage_name}</h5>
                      </div>
                    </div>

                    <div>{getStatusBadge(stage.status)}</div>
                  </div>

                  {/* Technician notes */}
                  {stage.technician_notes ? (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 space-y-1">
                      <div className="font-semibold text-stone-500 text-[10px] uppercase tracking-wider">
                        Field Observation & Log
                      </div>
                      <p className="leading-relaxed">{stage.technician_notes}</p>
                      {stage.updated_at && (
                        <div className="text-[10px] text-stone-400 pt-1">
                          Updated: {new Date(stage.updated_at).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 mt-2 italic">
                      Scheduled after preceding milestone verification.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
