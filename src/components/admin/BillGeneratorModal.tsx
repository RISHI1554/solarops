import React, { useState } from 'react';
import { InstallationRequest } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Receipt, Calculator, CheckCircle2 } from 'lucide-react';

interface BillGeneratorModalProps {
  requests: InstallationRequest[];
  initialRequestId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BillGeneratorModal: React.FC<BillGeneratorModalProps> = ({
  requests,
  initialRequestId,
  onClose,
  onSuccess,
}) => {
  const { generateBill, packages } = useApp();

  const [selectedRequestId, setSelectedRequestId] = useState(
    initialRequestId || requests[0]?.id || ''
  );

  const selectedReq = requests.find(r => r.id === selectedRequestId);
  const matchedPkg = packages.find(p => p.id === selectedReq?.package_id);

  // Default values
  const defaultTotal = matchedPkg ? matchedPkg.price_inr : (selectedReq?.capacity_kw || 3) * 62000;
  const defaultCapacity = selectedReq?.capacity_kw || 3;
  const defaultSubsidy = defaultCapacity <= 1 ? 30000 : defaultCapacity <= 2 ? 60000 : 78000;

  const [totalAmount, setTotalAmount] = useState<number>(defaultTotal);
  const [subsidyAmount, setSubsidyAmount] = useState<number>(defaultSubsidy);
  const [emiTenureMonths, setEmiTenureMonths] = useState<number>(12);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculations
  const netPayable = Math.max(0, totalAmount - subsidyAmount);
  const monthlyEmi = Math.round(netPayable / emiTenureMonths);

  const handleRequestChange = (reqId: string) => {
    setSelectedRequestId(reqId);
    const req = requests.find(r => r.id === reqId);
    const pkg = packages.find(p => p.id === req?.package_id);
    const cap = req?.capacity_kw || 3;
    const tot = pkg ? pkg.price_inr : cap * 62000;
    const sub = cap <= 1 ? 30000 : cap <= 2 ? 60000 : 78000;
    setTotalAmount(tot);
    setSubsidyAmount(sub);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    setIsGenerating(true);

    await generateBill(
      selectedRequestId,
      Number(totalAmount),
      Number(subsidyAmount),
      Number(emiTenureMonths)
    );

    setIsGenerating(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Generate Customer Solar Bill</h3>
              <p className="text-xs text-stone-500">Configure central subsidy & flexible EMI schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Select Installation Request *
            </label>
            <select
              value={selectedRequestId}
              onChange={e => handleRequestChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
            >
              {requests.map(r => (
                <option key={r.id} value={r.id}>
                  {r.customer_name} ({r.id}) — {r.package_name || `${r.capacity_kw} kW`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Gross System Cost (INR) *
              </label>
              <input
                type="number"
                step="1000"
                required
                value={totalAmount}
                onChange={e => setTotalAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Central Subsidy (MNRE DBT) *
              </label>
              <input
                type="number"
                step="1000"
                required
                value={subsidyAmount}
                onChange={e => setSubsidyAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              EMI Repayment Tenure Duration *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { months: 1, label: 'Full Pay' },
                { months: 6, label: '6 Mos' },
                { months: 12, label: '12 Mos' },
                { months: 24, label: '24 Mos' },
              ].map(opt => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setEmiTenureMonths(opt.months)}
                  className={`py-2 px-1 rounded-xl text-center font-bold transition-colors ${
                    emiTenureMonths === opt.months
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Computed Preview Card */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>Gross Total:</span>
              <span className="font-mono text-stone-900">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Less Central Subsidy:</span>
              <span className="font-mono">-₹{subsidyAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
              <span>Net Payable by Customer:</span>
              <span className="font-mono text-emerald-800 text-sm">₹{netPayable.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-500 pt-1">
              <span>Monthly EMI Amount:</span>
              <span className="font-bold text-stone-900 font-mono">
                ₹{monthlyEmi.toLocaleString('en-IN')} / month ({emiTenureMonths} installments)
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Issue Bill & EMI Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
