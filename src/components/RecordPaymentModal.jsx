import { useState } from 'react'
import { paymentOps } from '../db'
import { PAYMENT_MODES, formatCurrency, todayDate } from '../utils'

/**
 * Shared payment recording modal.
 * @param {object} invoice  - invoice being paid
 * @param {'in'|'out'} type - 'in' = money received from customer, 'out' = money paid to supplier
 * @param {function} onClose
 * @param {function} onSave
 */
export default function RecordPaymentModal({ invoice, type, onClose, onSave }) {
  const isInbound = type === 'in'
  const [amount, setAmount] = useState(String(invoice.balance ?? ''))
  const [mode, setMode]     = useState('cash')
  const [date, setDate]     = useState(todayDate())
  const [notes, setNotes]   = useState('')
  const [saving, setSaving] = useState(false)

  const accent = isInbound
    ? { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700' }
    : { bg: 'bg-red-50',  border: 'border-red-100',  text: 'text-red-700'  }

  const handleSave = async () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) { alert('Enter a valid amount'); return }
    setSaving(true)
    try {
      await paymentOps.add({
        type,
        partyId:   invoice.partyId,
        partyName: invoice.partyName,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        amount: amt,
        mode,
        date,
        notes,
      })
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-96 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isInbound ? 'Record Payment Received' : 'Record Payment Made'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isInbound ? `From ${invoice.partyName || 'customer'}` : `To ${invoice.partyName || 'supplier'}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Invoice summary */}
          <div className={`${accent.bg} ${accent.border} border rounded-xl p-3 text-sm`}>
            <div className="flex justify-between text-gray-600 mb-1">
              <span>Invoice</span>
              <span className={`font-mono ${accent.text} font-semibold`}>{invoice.invoiceNo}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800">
              <span>Balance Due</span>
              <span className="text-red-600">₹{formatCurrency(invoice.balance ?? 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {isInbound ? 'Amount Received' : 'Amount Paid'} *
            </label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder="0.00" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (Optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder={isInbound ? 'e.g. Paid via GPay' : 'e.g. Paid via NEFT'} />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
            {saving ? 'Saving…' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}
