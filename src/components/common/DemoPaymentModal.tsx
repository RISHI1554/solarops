import React, { useState } from 'react';
import { EmiSchedule, Bill, PaymentReceipt } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldAlert,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';

interface DemoPaymentModalProps {
  emi: EmiSchedule;
  bill: Bill;
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt) => void;
}

export const DemoPaymentModal: React.FC<DemoPaymentModalProps> = ({
  emi,
  bill,
  onClose,
  onSuccess,
}) => {
  const { processDemoPayment } = useApp();
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('demo.customer@okhdfcbank');
  const [selectedCard, setSelectedCard] = useState('visa');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMessage, setStepMessage] = useState('');

  const handleSimulatedPay = async () => {
    setIsProcessing(true);
    setStepMessage('Connecting to simulated banking gateway...');

    await new Promise(r => setTimeout(r, 600));
    setStepMessage('Simulating one-time PIN authorization...');

    await new Promise(r => setTimeout(r, 700));
    setStepMessage('Recording demo transaction in database...');

    try {
      const receipt = await processDemoPayment(emi.id, method);
      setIsProcessing(false);
      onSuccess(receipt);
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Disclaimer Banner */}
        <div className="bg-amber-500 text-stone-950 px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-stone-950" />
            <span>Demo payment — no real money will be charged</span>
          </div>
          <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-black/10">
            SIMULATION
          </span>
        </div>

        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Pay Solar EMI Installment
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Installment #{emi.installment_number} of {bill.emi_tenure_months} · Due on {emi.due_date}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Card */}
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-medium">Installment Payable</div>
            <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
              ₹{emi.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-500">Bill Ref</div>
            <div className="text-xs font-mono font-medium text-stone-700">{bill.id}</div>
          </div>
        </div>

        {/* Method Tabs */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMethod('upi')}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                method === 'upi'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('card')}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                method === 'card'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Demo Card</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('netbanking')}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                method === 'netbanking'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Net Banking</span>
            </button>
          </div>

          {/* Method Content */}
          {method === 'upi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                {/* Simulated QR Box */}
                <div className="w-28 h-28 bg-white border border-stone-300 rounded-lg p-2 flex flex-col items-center justify-center shadow-xs">
                  <div className="grid grid-cols-5 gap-1 w-full h-full p-1 opacity-90">
                    <div className="bg-stone-900 rounded-xs col-span-2 row-span-2" />
                    <div className="bg-stone-300 rounded-xs" />
                    <div className="bg-stone-900 rounded-xs col-span-2 row-span-2" />
                    <div className="bg-stone-900 rounded-xs" />
                    <div className="bg-stone-400 rounded-xs" />
                    <div className="bg-stone-900 rounded-xs col-span-2 row-span-2" />
                    <div className="bg-stone-900 rounded-xs" />
                    <div className="bg-stone-300 rounded-xs" />
                    <div className="bg-stone-900 rounded-xs col-span-2 row-span-2" />
                  </div>
                  <span className="text-[9px] text-stone-500 font-mono mt-1">TEST UPI QR</span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <p className="text-xs font-medium text-stone-700">
                    Scan with any UPI app (Simulated)
                  </p>
                  <p className="text-[11px] text-stone-500">
                    GPay, PhonePe, Paytm, or BHIM. Or simulate using test VPA below:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-md w-full font-mono text-stone-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Info className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Never enter your real UPI PIN anywhere in this demo.</span>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Select Test Card (Simulated Dummy Details)
                  </label>
                  <select
                    value={selectedCard}
                    onChange={e => setSelectedCard(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 font-medium"
                  >
                    <option value="visa">RuPay Platinum Test Card (•••• 4012)</option>
                    <option value="mastercard">SBI Solar EasyPay Test Card (•••• 5521)</option>
                    <option value="icici">ICICI Green Energy Test Card (•••• 8829)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      disabled
                      value="12/29 (Test Only)"
                      className="w-full text-xs px-2.5 py-1.5 bg-stone-100 border border-stone-200 rounded text-stone-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">CVV / CVC</label>
                    <input
                      type="text"
                      disabled
                      value="••• (Simulated)"
                      className="w-full text-xs px-2.5 py-1.5 bg-stone-100 border border-stone-200 rounded text-stone-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Notice: Real card details are neither requested nor accepted. Testing only.
              </p>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Select Demo Bank
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        selectedBank === bank
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-stone-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Simulated NetBanking login bypasses any external credentials.</span>
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={handleSimulatedPay}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{stepMessage || 'Processing simulated payment...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Simulated Payment of ₹{emi.amount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-stone-400 mt-2">
              Instant demo approval · Real-time EMI schedule update · Generates GST Tax Receipt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
