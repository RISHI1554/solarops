import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InstallationRequest, InstallationStage, StageStatus, Complaint, ComplaintStatus } from '../../types';
import {
  Wrench,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Save,
  X,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const TechnicianDashboard: React.FC = () => {
  const {
    currentUser,
    installations,
    stages,
    complaints,
    updateStageStatus,
    updateComplaint,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'jobs' | 'complaints'>('jobs');

  // Filter items assigned to technician or all if admin/demo testing
  const assignedJobs = installations.filter(
    i => !i.assigned_technician_id || i.assigned_technician_id === currentUser?.id || currentUser?.role === 'admin'
  );

  const assignedComplaints = complaints.filter(
    c => !c.assigned_technician_id || c.assigned_technician_id === currentUser?.id || currentUser?.role === 'admin'
  );

  // Stage update modal state
  const [selectedJobForStages, setSelectedJobForStages] = useState<InstallationRequest | null>(null);
  const [editingStageNumber, setEditingStageNumber] = useState<number>(4);
  const [stageStatus, setStageStatus] = useState<StageStatus>('in_progress');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Complaint resolution modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintStatus, setComplaintStatus] = useState<ComplaintStatus>('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState(false);

  const handleOpenStageEditor = (job: InstallationRequest, stageNum?: number) => {
    setSelectedJobForStages(job);
    const jobStages = stages[job.id] || [];
    const currentNum = stageNum || job.current_stage || 1;
    setEditingStageNumber(currentNum);
    const existingStage = jobStages.find(s => s.stage_number === currentNum);
    setStageStatus(existingStage?.status || 'in_progress');
    setTechnicianNotes(existingStage?.technician_notes || '');
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForStages) return;
    setIsUpdatingStage(true);

    await updateStageStatus(
      selectedJobForStages.id,
      editingStageNumber,
      stageStatus,
      technicianNotes
    );

    setIsUpdatingStage(false);
    setSelectedJobForStages(null);
  };

  const handleOpenComplaintEditor = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setComplaintStatus(complaint.status);
    setResolutionNotes(complaint.resolution_notes || '');
  };

  const handleSaveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsUpdatingComplaint(true);

    await updateComplaint(
      selectedComplaint.id,
      complaintStatus,
      resolutionNotes,
      currentUser?.id
    );

    setIsUpdatingComplaint(false);
    setSelectedComplaint(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
            <Wrench className="w-3.5 h-3.5 text-amber-700" />
            <span>Field Technician Operation Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Assigned Field Projects & Tickets
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Logged in as{' '}
            <span className="font-semibold text-stone-800">{currentUser?.full_name || 'Vikram Patel'}</span>{' '}
            (Senior Solar Lead Technician)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-400 block uppercase tracking-wider font-semibold">
              Assigned Jobs
            </span>
            <span className="text-xl font-black text-stone-900 font-mono">
              {assignedJobs.length}
            </span>
          </div>

          <div className="text-center px-4 py-2 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-400 block uppercase tracking-wider font-semibold">
              Open Tickets
            </span>
            <span className="text-xl font-black text-stone-900 font-mono">
              {assignedComplaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-6 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 pb-3.5 px-1 border-b-2 transition-colors ${
              activeTab === 'jobs'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Installation Jobs ({assignedJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 pb-3.5 px-1 border-b-2 transition-colors ${
              activeTab === 'complaints'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Service Complaints ({assignedComplaints.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Installation Jobs Board */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {assignedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-900">No Installation Jobs Assigned</p>
              <p className="text-xs text-stone-500 mt-1">All scheduled sites are completed or unassigned.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedJobs.map(job => {
                const jobStages = stages[job.id] || [];
                const currentStageObj = jobStages.find(s => s.stage_number === job.current_stage);

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-5"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 pb-4 border-b border-stone-100">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {job.id}
                          </span>
                          <h3 className="text-lg font-bold text-stone-900 mt-1">
                            {job.customer_name || 'Customer'}
                          </h3>
                          <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span>{job.customer_phone || '+91 98765 43210'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {job.capacity_kw} kW System
                          </span>
                          <span className="block text-[11px] text-stone-400 mt-1">
                            Roof: {job.roof_type}
                          </span>
                        </div>
                      </div>

                      {/* Site Details */}
                      <div className="py-3 space-y-2 text-xs">
                        <div className="flex items-start gap-2 text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>{job.property_address}</span>
                        </div>

                        <div className="flex items-center gap-2 text-stone-600">
                          <Zap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>DISCOM: {job.discom_provider} (Load: {job.sanctioned_load_kw} kW)</span>
                        </div>

                        <div className="flex items-center gap-2 text-stone-600">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Scheduled Date: <strong className="text-stone-800">{job.scheduled_date || 'Site inspection open'}</strong></span>
                        </div>
                      </div>

                      {/* Current 7-Stage Status Box */}
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-700">
                            Current: Stage {job.current_stage} of 7
                          </span>
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            {currentStageObj?.status || 'In Progress'}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-stone-900">
                          {currentStageObj?.stage_name || `Stage ${job.current_stage}`}
                        </p>
                        {currentStageObj?.technician_notes && (
                          <p className="text-[11px] text-stone-600 italic">
                            &ldquo;{currentStageObj.technician_notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-400">
                        {jobStages.filter(s => s.status === 'completed').length} of 7 Completed
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenStageEditor(job)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Update 7-Stage Progress</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assigned Service Complaints */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {assignedComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-900">No Service Complaints Assigned</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedComplaints.map(tck => (
                <div
                  key={tck.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                        {tck.ticket_number}
                      </span>
                      <span className="text-xs font-semibold text-stone-500 capitalize">
                        {tck.category.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900">{tck.subject}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{tck.description}</p>

                    <div className="text-xs text-stone-500 pt-1">
                      Customer: <strong className="text-stone-800">{tck.customer_name}</strong> ({tck.customer_phone})
                    </div>

                    {tck.resolution_notes && (
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                        <span className="text-[10px] font-semibold text-stone-500 uppercase block">Existing Resolution Note</span>
                        <p className="text-stone-700 mt-0.5">{tck.resolution_notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      tck.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Status: {tck.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenComplaintEditor(tck)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                    >
                      Resolve / Update Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stage Editor Modal */}
      {selectedJobForStages && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Update Stage for {selectedJobForStages.customer_name}
                </h3>
                <p className="text-xs text-stone-500 font-mono">Job: {selectedJobForStages.id}</p>
              </div>
              <button
                onClick={() => setSelectedJobForStages(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Stage to Update</label>
                <select
                  value={editingStageNumber}
                  onChange={e => {
                    const num = Number(e.target.value);
                    setEditingStageNumber(num);
                    const st = (stages[selectedJobForStages.id] || []).find(s => s.stage_number === num);
                    setStageStatus(st?.status || 'in_progress');
                    setTechnicianNotes(st?.technician_notes || '');
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                >
                  <option value={1}>Stage 1: Site Feasibility & Shadow Survey</option>
                  <option value={2}>Stage 2: DISCOM Grid Feasibility Approval</option>
                  <option value={3}>Stage 3: Material & Panel Delivery</option>
                  <option value={4}>Stage 4: Mounting Structure & Panel Fixing</option>
                  <option value={5}>Stage 5: Wiring, Inverter & Earthing Commissioning</option>
                  <option value={6}>Stage 6: Net-Metering Application & Inspection</option>
                  <option value={7}>Stage 7: Final Commissioning & Grid Synchronization</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Stage Status *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['pending', 'in_progress', 'completed', 'blocked'] as StageStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStageStatus(st)}
                      className={`py-2 px-2 rounded-xl text-center font-bold capitalize transition-colors ${
                        stageStatus === st
                          ? st === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : st === 'blocked'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Field Observations & Technical Notes *
                </label>
                <textarea
                  rows={4}
                  placeholder="Record structural measurements, panel serial tags, inverter WiFi pairing ID, tilt angle, or reasons for block..."
                  value={technicianNotes}
                  onChange={e => setTechnicianNotes(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedJobForStages(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStage}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all shadow-xs"
                >
                  {isUpdatingStage ? 'Saving...' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">Resolve Ticket</h3>
                <p className="text-xs text-stone-500 font-mono">{selectedComplaint.ticket_number}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveComplaint} className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl text-stone-700">
                <div className="font-semibold text-stone-900">{selectedComplaint.subject}</div>
                <p className="text-xs text-stone-500 mt-1">{selectedComplaint.description}</p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Status</label>
                <select
                  value={complaintStatus}
                  onChange={e => setComplaintStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                >
                  <option value="in_progress">In Progress (Investigating On-Site)</option>
                  <option value="resolved">Resolved (Issue Fixed & Verified)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Resolution Notes & Remedial Actions Taken *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the technical fix performed, parts replaced, or tests carried out..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingComplaint}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-all shadow-xs"
                >
                  {isUpdatingComplaint ? 'Updating...' : 'Update Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
