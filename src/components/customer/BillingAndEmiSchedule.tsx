import React, { useState } from 'react';
import { Bill, EmiSchedule, PaymentReceipt } from '../../types';
import { useApp } from '../../context/AppContext';
import { DemoPaymentModal } from '../common/DemoPaymentModal';
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ShieldAlert,
  ArrowRight,
  Download,
} from 'lucide-react';

interface BillingAndEmiScheduleProps {
  bill: Bill;
  emis: EmiSchedule[];
  onOpenReceipt: (receipt: PaymentReceipt) => void;
}

export const BillingAndEmiSchedule: React.FC<BillingAndEmiScheduleProps> = ({
  bill,
  emis,
  onOpenReceipt,
}) => {
  const { payments, currentUser } = useApp();
  const [selectedEmiForPayment, setSelectedEmiForPayment] = useState<EmiSchedule | null>(null);

  // Filter EMIs belonging to this bill
  const billEmis = emis.filter(e => e.bill_id === bill.id);
  const totalPaid = billEmis
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPending = bill.net_payable - totalPaid;

  const handleEmiPaymentSuccess = (receipt: PaymentReceipt) => {
    setSelectedEmiForPayment(null);
    onOpenReceipt(receipt);
  };

  const handleViewReceiptForEmi = (emi: EmiSchedule) => {
    // Find matching payment or reconstruct receipt
    const pmt = payments.find(p => p.emi_id === emi.id);
    const receipt: PaymentReceipt = {
      receipt_id: emi.demo_receipt_id || `RCP-${emi.id}`,
      transaction_ref: pmt?.transaction_ref || `DEMO-REF-${emi.id}`,
      payment_date: emi.paid_at || new Date().toISOString(),
      customer_name: bill.customer_name || currentUser?.full_name || 'Customer',
      customer_email: currentUser?.email || 'customer@example.com',
      customer_phone: currentUser?.phone,
      address: currentUser?.address,
      electricity_conn_no: currentUser?.electricity_conn_no,
      bill_id: bill.id,
      installment_number: emi.installment_number,
      amount_paid: emi.amount,
      payment_mode: (pmt?.payment_mode as any) || 'upi',
      is_demo: true,
      package_name: bill.package_name,
      capacity_kw: bill.capacity_kw,
    };
    onOpenReceipt(receipt);
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total System Cost
          </span>
          <div className="text-2xl font-extrabold text-stone-900 mt-1 font-mono">
            ₹{bill.total_amount.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Rooftop EPC Gross Value</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            PM Surya Ghar Subsidy
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
            -₹{bill.subsidy_amount.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Central Financial Assistance</span>
        </div>

        <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
            Net Customer Payable
          </span>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            ₹{bill.net_payable.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            {bill.emi_tenure_months} Equal Monthly Installments
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Dues Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-extrabold text-stone-900 font-mono">
              ₹{totalPending > 0 ? totalPending.toLocaleString('en-IN') : '0'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                totalPending === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {totalPending === 0 ? 'Clear' : 'Pending'}
            </span>
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            ₹{totalPaid.toLocaleString('en-IN')} Paid to date
          </span>
        </div>
      </div>

      {/* Demo Simulation Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Simulated Sandbox Payments:</span> Clicking &ldquo;Pay Demo
          EMI&rdquo; allows you to test the complete UPI / Card / NetBanking payment loop,
          transaction receipt issuance, and instant balance clearing without any financial risk.
        </div>
      </div>

      {/* EMI Schedule Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900">Monthly EMI Repayment Schedule</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Tenure: {bill.emi_tenure_months} Months · Monthly Installment: ₹
              {bill.emi_monthly_amount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Account Ref:</span>
            <code className="bg-stone-100 px-2 py-1 rounded text-stone-700 font-mono text-[11px]">
              {bill.id}
            </code>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-5">Installment</th>
                <th className="py-3 px-5">Due Date</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Receipt / Paid Date</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {billEmis.map(emi => {
                const isOverdue =
                  emi.status === 'overdue' ||
                  (emi.status === 'pending' && new Date(emi.due_date) < new Date());

                return (
                  <tr key={emi.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-stone-900">
                      Installment #{emi.installment_number} of {bill.emi_tenure_months}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-stone-600">{emi.due_date}</td>

                    <td className="py-3.5 px-5 font-mono font-bold text-stone-900">
                      ₹{emi.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-5">
                      {emi.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Due
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-stone-500 text-[11px]">
                      {emi.paid_at ? (
                        <div className="space-y-0.5">
                          <span className="text-stone-800 font-mono font-medium">
                            {new Date(emi.paid_at).toLocaleDateString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-stone-400 uppercase">
                            via {emi.payment_method || 'UPI'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {emi.status === 'paid' ? (
                        <button
                          type="button"
                          onClick={() => handleViewReceiptForEmi(emi)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-700 bg-white hover:bg-stone-50 font-medium transition-all shadow-2xs"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedEmiForPayment(emi)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                            isOverdue
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Demo EMI</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedEmiForPayment && (
        <DemoPaymentModal
          emi={selectedEmiForPayment}
          bill={bill}
          onClose={() => setSelectedEmiForPayment(null)}
          onSuccess={handleEmiPaymentSuccess}
        />
      )}
    </div>
  );
};
