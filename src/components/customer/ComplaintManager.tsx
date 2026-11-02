import React, { useState } from 'react';
import { Complaint, ComplaintCategory, ComplaintPriority } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Wrench,
  X,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

interface ComplaintManagerProps {
  complaints: Complaint[];
  requestId?: string;
}

export const ComplaintManager: React.FC<ComplaintManagerProps> = ({ complaints, requestId }) => {
  const { createComplaint } = useApp();
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [category, setCategory] = useState<ComplaintCategory>('inverter_issue');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both subject and description.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await createComplaint({
        requestId,
        category,
        priority,
        subject,
        description,
      });
      setIsSubmitting(false);
      setIsCreating(false);
      setSubject('');
      setDescription('');
    } catch (err) {
      setIsSubmitting(false);
      setError('Failed to submit complaint. Try again.');
    }
  };

  const getPriorityBadge = (p: ComplaintPriority) => {
    switch (p) {
      case 'critical':
        return <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">Critical</span>;
      case 'high':
        return <span className="text-[10px] uppercase font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">High</span>;
      case 'medium':
        return <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[10px] uppercase font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">Low</span>;
    }
  };

  const getStatusBadge = (s: Complaint['status']) => {
    switch (s) {
      case 'resolved':
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" /> Investigating
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
            <Wrench className="w-3 h-3" /> Tech Assigned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900">Support & Service Complaints</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Report inverter faults, generation discrepancies, net-metering delays, or physical damages.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Raise New Service Ticket</span>
        </button>
      </div>

      {/* Create Ticket Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h4 className="text-base font-bold text-stone-900">Raise Service Ticket</h4>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Issue Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl"
                  >
                    <option value="inverter_issue">Inverter Error / Red Light</option>
                    <option value="generation_drop">Power Generation Drop</option>
                    <option value="metering_delay">DISCOM Net-Meter Delay</option>
                    <option value="panel_damage">Physical Panel Damage</option>
                    <option value="wiring_issue">Wiring / Earthing Trip</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl"
                  >
                    <option value="low">Low (General Query)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Production Down)</option>
                    <option value="critical">Critical (Safety / Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  placeholder="e.g. Inverter error code E031 on display"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe what occurred, any strange noises, error codes, weather conditions..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-xs"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {complaints.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-stone-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-bold text-stone-900">Zero Active Complaints</p>
          <p className="text-xs text-stone-500 mt-1">Your rooftop solar system is operating normally.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(tck => (
            <div
              key={tck.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                    {tck.ticket_number}
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-500">
                    Raised {new Date(tck.created_at).toLocaleDateString('en-IN')}
                  </span>
                  {getPriorityBadge(tck.priority)}
                </div>

                <div>{getStatusBadge(tck.status)}</div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-stone-900">{tck.subject}</h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{tck.description}</p>
              </div>

              {/* Technician resolution notes */}
              {tck.resolution_notes && (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-stone-700 font-semibold text-[11px] uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Technician Notes ({tck.assigned_technician_name || 'Field Engineer'})</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{tck.resolution_notes}</p>
                  {tck.resolved_at && (
                    <div className="text-[10px] text-emerald-700 font-medium pt-1">
                      Resolved on {new Date(tck.resolved_at).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
