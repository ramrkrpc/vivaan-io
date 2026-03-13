import { useEffect, useState } from 'react'
import { XMarkIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { paymentOps } from '../db'
import { formatCurrency, STATUS_COLORS, STATUS_LABELS } from '../utils'

/**
 * Full invoice detail view — shows line items, totals, and payment history.
 * @param {object}   invoice  - the invoice object
 * @param {function} onClose
 * @param {function} onRecordPayment - called with invoice to open payment modal
 * @param {function} onDelete        - called with invoice.id to delete
 */
export default function InvoiceDetailModal({ invoice, onClose, onRecordPayment, onDelete }) {
  const [payments, setPayments] = useState([])
  const isSale = invoice.type === 'sale'

  useEffect(() => {
    paymentOps.getAll().then(all =>
      setPayments(all.filter(p => p.invoiceId === invoice.id))
    )
  }, [invoice.id])

  const handleDelete = () => {
    if (!confirm(`Delete invoice ${invoice.invoiceNo}? This cannot be undone.`)) return
    onDelete(invoice.id)
    onClose()
  }

  const items  = invoice.items ?? []
  const hasTax = items.some(li => Number(li.gst) > 0)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900 font-mono">{invoice.invoiceNo}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[invoice.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[invoice.status] ?? invoice.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isSale ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'}`}>
                {isSale ? 'Sale' : 'Purchase'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {invoice.partyName || '—'} · {invoice.date}
              {invoice.dueDate && ` · Due: ${invoice.dueDate}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0 ml-2">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">

          {/* Line Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>

            {/* Desktop table */}
            <div className="hidden sm:block border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2.5 text-xs text-gray-400 font-semibold text-left">#</th>
                    <th className="px-3 py-2.5 text-xs text-gray-400 font-semibold text-left">Item</th>
                    <th className="px-3 py-2.5 text-xs text-gray-400 font-semibold text-right">Qty</th>
                    <th className="px-3 py-2.5 text-xs text-gray-400 font-semibold text-left">Unit</th>
                    <th className="px-3 py-2.5 text-xs text-gray-400 font-semibold text-right">Rate</th>
                    {hasTax && <th className="px-3 py-2.5 text-xs text-gray-400 font-semibold text-right">GST</th>}
                    <th className="px-3 py-2.5 text-xs text-gray-400 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((li, i) => {
                    const lineAmt = (li.qty || 0) * (li.rate || 0)
                    const taxAmt  = (lineAmt * Number(li.gst || 0)) / 100
                    return (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-800">{li.name}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600">{li.qty}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs">{li.unit || 'Nos'}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600">₹{formatCurrency(li.rate)}</td>
                        {hasTax && (
                          <td className="px-3 py-2.5 text-right text-xs text-gray-400">
                            {Number(li.gst) > 0 ? `${li.gst}% = ₹${formatCurrency(taxAmt)}` : '—'}
                          </td>
                        )}
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">₹{formatCurrency(lineAmt + taxAmt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked */}
            <div className="sm:hidden space-y-2">
              {items.map((li, i) => {
                const lineAmt = (li.qty || 0) * (li.rate || 0)
                const taxAmt  = (lineAmt * Number(li.gst || 0)) / 100
                return (
                  <div key={i} className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-gray-800">{li.name}</p>
                      <p className="text-sm font-bold text-gray-800 shrink-0 ml-2">₹{formatCurrency(lineAmt + taxAmt)}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {li.qty} {li.unit} × ₹{formatCurrency(li.rate)}
                      {Number(li.gst) > 0 && ` + ${li.gst}% GST`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{formatCurrency(invoice.subtotal ?? 0)}</span>
            </div>
            {(invoice.totalTax ?? 0) > 0 && (
              invoice.sameState ? (
                <>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>CGST</span><span>₹{formatCurrency((invoice.totalTax ?? 0) / 2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>SGST</span><span>₹{formatCurrency((invoice.totalTax ?? 0) / 2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>IGST</span><span>₹{formatCurrency(invoice.totalTax ?? 0)}</span>
                </div>
              )
            )}
            {(invoice.discount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600 text-xs">
                <span>Discount</span><span>- ₹{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2">
              <span>Total</span><span>₹{formatCurrency(invoice.total)}</span>
            </div>
            {(invoice.paid ?? 0) > 0 && (
              <div className="flex justify-between text-green-600 font-semibold text-sm">
                <span>Paid</span><span>₹{formatCurrency(invoice.paid)}</span>
              </div>
            )}
            {(invoice.balance ?? 0) > 0 && (
              <div className="flex justify-between text-red-600 font-bold text-sm">
                <span>Balance Due</span><span>₹{formatCurrency(invoice.balance)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">{invoice.notes}</p>
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment History</p>
              <div className="space-y-1.5">
                {payments.map(pay => (
                  <div key={pay.id} className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{pay.date}</p>
                      <p className="text-xs text-gray-400 capitalize">{pay.mode}{pay.notes && ` · ${pay.notes}`}</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">₹{formatCurrency(pay.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={handleDelete}
            className="px-4 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
            Delete
          </button>
          <div className="flex-1" />
          <button onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium">
            Close
          </button>
          {invoice.status !== 'paid' && (
            <button onClick={() => { onRecordPayment(invoice); onClose() }}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
              <BanknotesIcon className="w-4 h-4" />
              {isSale ? 'Collect' : 'Pay'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
