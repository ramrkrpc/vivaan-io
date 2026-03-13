import { useEffect, useState } from 'react'
import { PlusIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { invoiceOps, paymentOps } from '../db'

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  unpaid: 'bg-red-100 text-red-700',
}

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-96 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-gray-600 mb-1">
              <span>Invoice</span><span className="font-mono text-blue-700">{invoice.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-1">
              <span>Supplier</span><span>{invoice.partyName || '—'}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Balance Due</span>
              <span className="text-red-600">Rs {(invoice.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Payment Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                {['cash', 'bank', 'upi', 'cheque', 'card'].map(m => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="Optional notes" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Record Payment'}
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">Purchase Invoices</h1>
        <button onClick={() => onNavigate('purchase-invoice-new')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> New Purchase
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Purchase Invoices</h2>
            <p className="text-gray-500 text-sm mb-6">Record your first purchase invoice.</p>
            <button onClick={() => onNavigate('purchase-invoice-new')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 mx-auto">
              <PlusIcon className="w-4 h-4" /> Add Purchase Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gray-50 p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Total Purchased', value: totals.total, color: 'text-gray-800' },
              { label: 'Amount Paid', value: totals.paid, color: 'text-green-600' },
              { label: 'Payable', value: totals.balance, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>
                  Rs {s.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <input type="text" placeholder="Search invoice #, supplier..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400 w-64" />
            <div className="flex gap-1">
              {['all', 'unpaid', 'partial', 'paid'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === f ? 'bg-teal-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Invoice #', 'Supplier', 'Date', 'Due Date', 'Total', 'Paid', 'Balance', 'Status', 'Action'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-gray-500 font-medium text-xs ${['Total', 'Paid', 'Balance'].includes(h) ? 'text-right' : h === 'Action' || h === 'Status' ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-700 font-medium">{inv.invoiceNo}</td>
                    <td className="px-4 py-2.5 text-gray-700">{inv.partyName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{inv.date}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{inv.dueDate || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                      Rs {inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right text-green-600">
                      {(inv.paid ?? 0) > 0 ? `Rs ${inv.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-red-600 font-medium">
                      {(inv.balance ?? 0) > 0 ? `Rs ${inv.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {inv.status !== 'paid' && (
                        <button onClick={() => setPayInvoice(inv)}
                          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium mx-auto">
                          <BanknotesIcon className="w-3.5 h-3.5" /> Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No invoices found</p>}
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
