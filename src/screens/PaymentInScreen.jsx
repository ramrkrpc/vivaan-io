import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { partyOps, invoiceOps, paymentOps } from '../db'

export default function PaymentInScreen({ onNavigate }) {
  const [parties, setParties] = useState([])
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    partyId: '',
    partyName: '',
    invoiceId: '',
    amount: '',
    mode: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const load = async () => {
    const [p, i, pay] = await Promise.all([partyOps.getAll(), invoiceOps.getAll('sale'), paymentOps.getAll('in')])
    setParties(p)
    setInvoices(i.filter(x => x.status !== 'paid'))
    setPayments(pay)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const partyInvoices = form.partyId
    ? invoices.filter(i => i.partyId === Number(form.partyId))
    : []

  const handleSave = async () => {
    const amt = Number(form.amount)
    if (!amt || amt <= 0) { alert('Enter a valid amount'); return }
    if (!form.partyId && !form.partyName.trim()) { alert('Select a party'); return }
    setSaving(true)
    try {
      const p = parties.find(x => x.id === Number(form.partyId))
      await paymentOps.add({
        type: 'in',
        partyId: form.partyId ? Number(form.partyId) : null,
        partyName: p?.name || form.partyName,
        invoiceId: form.invoiceId ? Number(form.invoiceId) : null,
        invoiceNo: form.invoiceId ? invoices.find(i => i.id === Number(form.invoiceId))?.invoiceNo : null,
        amount: amt,
        mode: form.mode,
        date: form.date,
        notes: form.notes,
      })
      setForm({ partyId: '', partyName: '', invoiceId: '', amount: '', mode: 'cash', date: new Date().toISOString().split('T')[0], notes: '' })
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">Payment In</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Add Payment
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-5">
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 max-w-2xl">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Record Payment Received</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Customer *</label>
                <select value={form.partyId} onChange={e => { setF('partyId', e.target.value); setF('invoiceId', '') }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                  <option value="">-- Select Customer --</option>
                  {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Against Invoice (optional)</label>
                <select value={form.invoiceId} onChange={e => {
                  const inv = invoices.find(i => i.id === Number(e.target.value))
                  setF('invoiceId', e.target.value)
                  if (inv) setF('amount', String(inv.balance ?? ''))
                }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                  <option value="">-- No specific invoice --</option>
                  {partyInvoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNo} (Rs {(i.balance ?? 0).toLocaleString('en-IN')})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount *</label>
                <input type="number" value={form.amount} onChange={e => setF('amount', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Payment Mode</label>
                <select value={form.mode} onChange={e => setF('mode', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                  {['cash', 'bank', 'upi', 'cheque', 'card'].map(m => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setF('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <input value={form.notes} onChange={e => setF('notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Payment History</p>
          </div>
          {payments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No payments recorded yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Party', 'Invoice', 'Amount', 'Mode', 'Notes'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-xs text-gray-500 font-medium ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(pay => (
                  <tr key={pay.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{pay.date}</td>
                    <td className="px-4 py-2.5 text-gray-700">{pay.partyName || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{pay.invoiceNo || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-green-700">
                      Rs {pay.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 capitalize text-gray-600 text-xs">{pay.mode}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{pay.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
