import { useEffect, useState } from 'react'
import { PlusIcon, BanknotesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { invoiceOps, paymentOps } from '../db'

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
}

const STATUS_LABELS = { paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid' }

function RecordPaymentModal({ invoice, onClose, onSave }) {
  const [amount, setAmount] = useState(String(invoice.balance ?? ''))
  const [mode, setMode] = useState('cash')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) { alert('Enter a valid amount'); return }
    setSaving(true)
    try {
      await paymentOps.add({
        type: 'out',
        partyId: invoice.partyId,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-96 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Record Payment Made</h2>
            <p className="text-xs text-gray-400 mt-0.5">To {invoice.partyName || 'supplier'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm">
            <div className="flex justify-between text-gray-600 mb-1">
              <span>Invoice</span>
              <span className="font-mono text-red-700 font-semibold">{invoice.invoiceNo}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800">
              <span>Balance Due</span>
              <span className="text-red-600">₹{(invoice.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount Paid *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder="0.00" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                {['cash', 'bank', 'upi', 'cheque', 'card'].map(m => (
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
              placeholder="e.g. Paid via NEFT" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
            {saving ? 'Saving…' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseListScreen({ onNavigate }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [payInvoice, setPayInvoice] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = () => invoiceOps.getAll('purchase').then(d => { setInvoices(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = (inv.invoiceNo || '').toLowerCase().includes(q) || (inv.partyName || '').toLowerCase().includes(q)
    const matchStatus = filter === 'all' || inv.status === filter
    return matchSearch && matchStatus
  })

  const totals = {
    total: filtered.reduce((s, i) => s + i.total, 0),
    paid: filtered.reduce((s, i) => s + (i.paid ?? 0), 0),
    balance: filtered.reduce((s, i) => s + (i.balance ?? 0), 0),
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      <div className="px-6 py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Purchase Invoices</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track bills from your suppliers</p>
        </div>
        <button onClick={() => onNavigate('purchase-invoice-new')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm">
          <PlusIcon className="w-4 h-4" /> New Purchase
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Purchase Invoices</h2>
            <p className="text-gray-500 text-sm mb-6">Record your first purchase to track what you owe suppliers.</p>
            <button onClick={() => onNavigate('purchase-invoice-new')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto shadow-sm">
              <PlusIcon className="w-4 h-4" /> Add Purchase Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Purchased', value: totals.total, color: 'text-gray-800', sub: `${filtered.length} invoices` },
              { label: 'Amount Paid', value: totals.paid, color: 'text-green-600', sub: 'Paid to suppliers' },
              { label: 'Amount Payable', value: totals.balance, color: 'text-red-500', sub: 'Yet to pay' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>
                  ₹{s.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search invoice #, supplier…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" />
            </div>
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {[['all', 'All'], ['unpaid', 'Unpaid'], ['partial', 'Partial'], ['paid', 'Paid']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === val ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['Invoice #', 'left'], ['Supplier', 'left'], ['Date', 'left'], ['Due Date', 'left'], ['Total', 'right'], ['Paid', 'right'], ['Balance', 'right'], ['Status', 'center'], ['', 'center']].map(([h, align]) => (
                    <th key={h} className={`px-4 py-3 text-xs text-gray-400 font-semibold text-${align}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{inv.invoiceNo}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{inv.partyName || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{inv.date}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{inv.dueDate || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      ₹{inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">
                      {(inv.paid ?? 0) > 0 ? `₹${inv.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-red-500 font-semibold">
                      {(inv.balance ?? 0) > 0 ? `₹${inv.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[inv.status] ?? inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {inv.status !== 'paid' && (
                        <button onClick={() => setPayInvoice(inv)}
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-semibold bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors">
                          <BanknotesIcon className="w-3.5 h-3.5" /> Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm">No invoices match your search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {payInvoice && (
        <RecordPaymentModal
          invoice={payInvoice}
          onClose={() => setPayInvoice(null)}
          onSave={() => { setPayInvoice(null); load() }}
        />
      )}
    </div>
  )
}
