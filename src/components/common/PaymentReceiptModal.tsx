import React from 'react';
import { PaymentReceipt } from '../../types';
import { Printer, X, CheckCircle, ShieldCheck, Sun, Download } from 'lucide-react';

interface PaymentReceiptModalProps {
  receipt: PaymentReceipt;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Printable Area */}
        <div id="printable-receipt" className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-stone-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Sun className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-900">SolarOps Energy Systems</h1>
                <p className="text-xs text-stone-500">
                  Residential & Commercial Rooftop Solar EPC Solutions
                </p>
                <p className="text-[11px] text-stone-400 font-mono">
                  GSTIN: 07AAACS1234F1Z5 · CIN: U40106DL2024PTC198421
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                Payment Receipt
              </span>
              <div className="mt-2 text-xs text-stone-500">
                Receipt No: <span className="font-mono font-semibold text-stone-800">{receipt.receipt_id}</span>
              </div>
              <div className="text-xs text-stone-500">
                Date: {new Date(receipt.payment_date).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Demo Stamp Notice */}
          <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Simulated Demo Transaction Record · No Real Funds Transferred</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              TRANSACTION VERIFIED
            </span>
          </div>

          {/* Billing & Customer Details */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Billed To (Customer)
              </div>
              <div className="font-bold text-stone-900 text-sm">{receipt.customer_name}</div>
              <div className="text-stone-600">{receipt.address || 'Address on record'}</div>
              <div className="text-stone-600">{receipt.customer_email}</div>
              {receipt.customer_phone && <div className="text-stone-600">{receipt.customer_phone}</div>}
              {receipt.electricity_conn_no && (
                <div className="text-stone-500 font-mono mt-1">
                  Electricity Consumer No: <span className="text-stone-800 font-medium">{receipt.electricity_conn_no}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-right">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Transaction Details
              </div>
              <div className="text-stone-700">
                Txn Ref: <span className="font-mono font-semibold text-stone-900">{receipt.transaction_ref}</span>
              </div>
              <div className="text-stone-700">
                Payment Channel: <span className="font-semibold uppercase text-stone-900">{receipt.payment_mode}</span>
              </div>
              <div className="text-stone-700">
                Bill Account: <span className="font-mono text-stone-900">{receipt.bill_id}</span>
              </div>
              <div className="text-stone-700">
                System: <span className="text-stone-900 font-medium">{receipt.package_name || 'Rooftop Solar Plant'}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4">Tenure / Installment</th>
                  <th className="py-2.5 px-4 text-right">Taxable</th>
                  <th className="py-2.5 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-stone-900">
                    Solar Rooftop System Installation EMI Installment
                    <div className="text-[11px] text-stone-500">
                      Standard Net-Metered Solar Photovoltaic Grid-Tied System
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    Installment #{receipt.installment_number}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-stone-600">
                    ₹{Math.round(receipt.amount_paid / 1.12).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                    ₹{receipt.amount_paid.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-stone-50 border-t border-stone-200 font-semibold">
                <tr>
                  <td colSpan={3} className="py-2.5 px-4 text-right text-stone-700">
                    Total Amount Paid (INR)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-extrabold text-sm text-emerald-700">
                    ₹{receipt.amount_paid.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer note & Stamp */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-[11px] text-stone-400">
            <div>
              <p>This is a computer-generated simulated receipt for SolarOps demonstrations.</p>
              <p>Support: solar.support@example.com · Toll Free: 1800-SOLAR-01</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-stone-400">Auth Signature: [SYSTEM GENERATED]</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-stone-50 px-8 py-4 border-t border-stone-200 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Close Receipt
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
