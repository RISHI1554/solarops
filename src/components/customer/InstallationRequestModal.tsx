import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Sun, Building, Zap } from 'lucide-react';

interface InstallationRequestModalProps {
  initialPackageId?: string;
  initialCapacityKw?: number;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
}

export const InstallationRequestModal: React.FC<InstallationRequestModalProps> = ({
  initialPackageId,
  initialCapacityKw,
  onClose,
  onSuccess,
}) => {
  const { packages, currentUser, createInstallationRequest } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [propertyAddress, setPropertyAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || 'Gurugram');
  const [state, setState] = useState(currentUser?.state || 'Haryana');
  const [pincode, setPincode] = useState(currentUser?.pincode || '122002');
  const [roofType, setRoofType] = useState<'RCC Flat' | 'Tin Shed' | 'Tiled Roof' | 'Industrial Shed' | 'Other'>('RCC Flat');
  const [electricityConnNo, setElectricityConnNo] = useState(currentUser?.electricity_conn_no || 'DHBVN-');
  const [discomProvider, setDiscomProvider] = useState('DHBVN (Dakshin Haryana Bijli Vitran Nigam)');
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(5.0);

  // Package State
  const defaultPkg = packages.find(p => p.id === initialPackageId) || packages.find(p => p.capacity_kw === 3) || packages[0];
  const [selectedPackageId, setSelectedPackageId] = useState<string>(defaultPkg?.id || '');
  const [capacityKw, setCapacityKw] = useState<number>(initialCapacityKw || defaultPkg?.capacity_kw || 3.0);
  const [notes, setNotes] = useState('');
  const [wantsElevatedStructure, setWantsElevatedStructure] = useState(true);

  // Form Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!propertyAddress.trim()) errs.propertyAddress = 'Property address is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!pincode.trim() || pincode.length < 6) errs.pincode = 'Valid 6-digit PIN code required';
    if (!electricityConnNo.trim() || electricityConnNo.length < 4) errs.electricityConnNo = 'Electricity consumer connection number is required';
    if (!discomProvider.trim()) errs.discomProvider = 'DISCOM provider is required';
    if (sanctionedLoadKw <= 0) errs.sanctionedLoadKw = 'Sanctioned load must be greater than 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectedPkg = packages.find(p => p.id === selectedPackageId);
  const activeCapacity = selectedPkg ? selectedPkg.capacity_kw : capacityKw;

  // Calculate Subsidy
  const calculatedSubsidy = activeCapacity <= 1 ? 30000 : activeCapacity <= 2 ? 60000 : 78000;
  const estimatedCost = selectedPkg ? selectedPkg.price_inr : activeCapacity * 62000;
  const netEstimatedCost = Math.max(0, estimatedCost - calculatedSubsidy);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fullAddress = `${propertyAddress}, ${city}, ${state} - ${pincode}`;
      const finalNotes = wantsElevatedStructure
        ? `${notes ? notes + ' | ' : ''}Customer requested elevated mounting structure.`
        : notes;

      const newReq = await createInstallationRequest({
        packageId: selectedPackageId,
        capacityKw: activeCapacity,
        propertyAddress: fullAddress,
        roofType,
        electricityConnNo,
        discomProvider,
        sanctionedLoadKw,
        notes: finalNotes,
      });

      setIsSubmitting(false);
      onSuccess(newReq.id);
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-stone-50 px-6 py-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Book Solar Installation</h2>
              <p className="text-xs text-stone-500">
                Step {step} of 3 · Turnkey EPC with PM Surya Ghar Subsidy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-4 pb-2 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-semibold ${step >= 1 ? 'text-emerald-700' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
              1
            </span>
            <span>Site & DISCOM</span>
          </div>
          <div className="flex-1 h-0.5 mx-3 bg-stone-200">
            <div className={`h-full bg-emerald-600 transition-all ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`} />
          </div>
          <div className={`flex items-center gap-1.5 font-semibold ${step >= 2 ? 'text-emerald-700' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
              2
            </span>
            <span>Package & Size</span>
          </div>
          <div className="flex-1 h-0.5 mx-3 bg-stone-200">
            <div className={`h-full bg-emerald-600 transition-all ${step < 3 ? 'w-0' : 'w-full'}`} />
          </div>
          <div className={`flex items-center gap-1.5 font-semibold ${step >= 3 ? 'text-emerald-700' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
              3
            </span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Installation Property Address *
                </label>
                <input
                  type="text"
                  placeholder="House/Plot No., Street, Colony, Landmark"
                  value={propertyAddress}
                  onChange={e => setPropertyAddress(e.target.value)}
                  className={`w-full text-xs px-3 py-2.5 rounded-xl border bg-white ${
                    errors.propertyAddress ? 'border-rose-500' : 'border-stone-300'
                  }`}
                />
                {errors.propertyAddress && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.propertyAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    className={`w-full text-xs px-3 py-2.5 rounded-xl border bg-white font-mono ${
                      errors.pincode ? 'border-rose-500' : 'border-stone-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Rooftop Surface Type *
                  </label>
                  <select
                    value={roofType}
                    onChange={e => setRoofType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800"
                  >
                    <option value="RCC Flat">RCC Flat Concrete Roof (Standard)</option>
                    <option value="Tin Shed">Tin / Metal Industrial Shed</option>
                    <option value="Tiled Roof">Mangalore / Clay Tiled Roof</option>
                    <option value="Industrial Shed">Industrial PEB Structure</option>
                    <option value="Other">Other / Elevated Terrace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sanctioned Load (kW) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={sanctionedLoadKw}
                    onChange={e => setSanctionedLoadKw(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Found on your monthly electricity bill
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Electricity Distribution Company (DISCOM) *
                </label>
                <select
                  value={discomProvider}
                  onChange={e => setDiscomProvider(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800"
                >
                  <option value="DHBVN (Dakshin Haryana Bijli Vitran Nigam)">DHBVN (Haryana)</option>
                  <option value="UHBVN (Uttar Haryana Bijli Vitran Nigam)">UHBVN (Haryana)</option>
                  <option value="BSES Rajdhani Power Limited (BRPL)">BSES Rajdhani (Delhi)</option>
                  <option value="BSES Yamuna Power Limited (BYPL)">BSES Yamuna (Delhi)</option>
                  <option value="Tata Power Delhi Distribution (TPDDL)">Tata Power-DDL (Delhi)</option>
                  <option value="UPPCL (Uttar Pradesh Power Corp)">UPPCL (Uttar Pradesh)</option>
                  <option value="BESCOM (Bangalore Electricity Supply)">BESCOM (Karnataka)</option>
                  <option value="MSEDCL (Mahavitaran)">MSEDCL (Maharashtra)</option>
                  <option value="Torrent Power">Torrent Power (Gujarat/UP)</option>
                  <option value="TANGEDCO (Tamil Nadu)">TANGEDCO (Tamil Nadu)</option>
                  <option value="Other State Electricity Board">Other State Board</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Electricity Consumer Connection Number (CA / Account No.) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DHBVN-784910284 or 10-digit CA number"
                  value={electricityConnNo}
                  onChange={e => setElectricityConnNo(e.target.value)}
                  className={`w-full text-xs px-3 py-2.5 rounded-xl border bg-white font-mono ${
                    errors.electricityConnNo ? 'border-rose-500' : 'border-stone-300'
                  }`}
                />
                {errors.electricityConnNo && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.electricityConnNo}</p>
                )}
                <p className="text-[11px] text-stone-400 mt-1">
                  Required for grid feasibility approval & PM Surya Ghar DBT link.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Choose Solar Package or Capacity
              </label>

              <div className="space-y-3">
                {packages.filter(p => p.is_active).map(pkg => {
                  const isSelected = selectedPackageId === pkg.id;
                  const pkgSubsidy = pkg.capacity_kw <= 1 ? 30000 : pkg.capacity_kw <= 2 ? 60000 : 78000;
                  const net = pkg.price_inr - pkgSubsidy;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setCapacityKw(pkg.capacity_kw);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-stone-900">{pkg.name}</h4>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              {pkg.capacity_kw} kW
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">{pkg.description}</p>
                          <div className="mt-2 text-xs text-stone-600 space-x-3">
                            <span>{pkg.panel_count} Panels</span>
                            <span>·</span>
                            <span>Roof: ~{pkg.roof_area_sqft} sq.ft</span>
                            <span>·</span>
                            <span>Gen: ~{pkg.monthly_gen_units} units/mo</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-extrabold text-stone-900 font-mono">
                            ₹{net.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Subsidy: -₹{pkgSubsidy.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-stone-400 line-through font-mono">
                            ₹{pkg.price_inr.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Elevated Structure Checkbox */}
              <div className="pt-3 border-t border-stone-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsElevatedStructure}
                    onChange={e => setWantsElevatedStructure(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-800">
                      Elevated Rooftop Mounting Structure (6 - 8 ft clearance)
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Keeps terrace space fully usable for leisure, clothes drying, and gardening.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Installation Summary & Subsidy Verification
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400">Selected System:</span>
                    <p className="font-semibold text-stone-900">
                      {selectedPkg?.name || `${activeCapacity} kW System`}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-400">Rooftop Type:</span>
                    <p className="font-semibold text-stone-900">{roofType}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">DISCOM:</span>
                    <p className="font-semibold text-stone-900">{discomProvider}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">Connection No:</span>
                    <p className="font-mono font-semibold text-stone-900">{electricityConnNo}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Gross Package Cost</span>
                    <span className="font-mono text-stone-800">₹{estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Central Subsidy (PM Surya Ghar DBT)</span>
                    <span className="font-mono font-bold">-₹{calculatedSubsidy.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 text-sm pt-1 border-t border-stone-200">
                    <span>Net Investment (or Financing Amount)</span>
                    <span className="font-mono text-emerald-700">₹{netEstimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Additional Notes or Site Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Best time for site visit, ladder access details, specific inverter location preference..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  By submitting, you initiate Stage 1 (Site Survey) with zero upfront commitment. Our solar engineer will contact you to confirm the date.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !validateStep1()) return;
                setStep((step + 1) as any);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-75"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Request...' : 'Confirm & Request Installation'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
