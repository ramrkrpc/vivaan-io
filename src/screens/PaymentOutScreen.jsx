import { useEffect, useState } from 'react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { partyOps, invoiceOps, paymentOps } from '../db'
import { PAYMENT_MODES, formatCurrency, todayDate } from '../utils'

export default function PaymentOutScreen({ onNavigate }) {
  const [parties, setParties]   = useState([])
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({
    partyId: '', invoiceId: '', amount: '', mode: 'cash', date: todayDate(), notes: '',
  })

  const load = async () => {
    const [p, i, pay] = await Promise.all([partyOps.getAll(), invoiceOps.getAll('purchase'), paymentOps.getAll('out')])
    setParties(p)
    setInvoices(i.filter(x => x.status !== 'paid'))
    setPayments(pay)
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const partyInvoices = form.partyId ? invoices.filter(i => i.partyId === Number(form.partyId)) : []

  const handleSave = async () => {
    const amt = Number(form.amount)
    if (!amt || amt <= 0) { alert('Enter a valid amount'); return }
    if (!form.partyId) { alert('Select a supplier'); return }
    setSaving(true)
    try {
      const p = parties.find(x => x.id === Number(form.partyId))
      await paymentOps.add({
        type: 'out',
        partyId:   Number(form.partyId),
        partyName: p?.name || '',
        invoiceId: form.invoiceId ? Number(form.invoiceId) : null,
        invoiceNo: form.invoiceId ? invoices.find(i => i.id === Number(form.invoiceId))?.invoiceNo : null,
        amount: amt,
        mode:  form.mode,
        date:  form.date,
        notes: form.notes,
      })
      setForm({ partyId: '', invoiceId: '', amount: '', mode: 'cash', date: todayDate(), notes: '' })
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
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-900">Payments Made</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Record payments sent to suppliers</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Record Payment</span>
          <span className="sm:hidden">Record</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 md:p-5 space-y-3 md:space-y-4">

        {/* Payment form — bottom sheet on mobile, inline card on desktop */}
        {showForm && (
          <>
            {/* Mobile backdrop */}
            <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
            {/* Form */}
            <div className="fixed bottom-0 inset-x-0 rounded-t-2xl bg-white shadow-2xl z-50 max-h-[90vh] overflow-y-auto
                            md:static md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:max-h-none md:max-w-2xl">
              {/* Handle (mobile only) */}
              <div className="md:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Record Payment Made to Supplier</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Supplier *</label>
                    <select value={form.partyId} onChange={e => { setF('partyId', e.target.value); setF('invoiceId', '') }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                      <option value="">— Select Supplier —</option>
                      {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Against Invoice (Optional)</label>
                    <select value={form.invoiceId} onChange={e => {
                      const inv = invoices.find(i => i.id === Number(e.target.value))
                      setF('invoiceId', e.target.value)
                      if (inv) setF('amount', String(inv.balance ?? ''))
                    }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                      <option value="">— No specific invoice —</option>
                      {partyInvoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNo} (₹{formatCurrency(i.balance ?? 0)})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount *</label>
                    <input type="number" value={form.amount} onChange={e => setF('amount', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Mode</label>
                    <select value={form.mode} onChange={e => setF('mode', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                      {PAYMENT_MODES.map(m => (
                        <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                    <input type="date" value={form.date} onChange={e => setF('date', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                    <input value={form.notes} onChange={e => setF('notes', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" placeholder="e.g. Paid via NEFT" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 sm:flex-none border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 font-medium">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
                    {saving ? 'Saving…' : 'Record Payment'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment history */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Payment History</p>
          </div>
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-gray-400 text-sm">No payments recorded yet</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="hidden md:table w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[['Date','left'],['Supplier','left'],['Invoice','left'],['Amount','right'],['Mode','left'],['Notes','left']].map(([h, align]) => (
                      <th key={h} className={`px-5 py-3 text-xs text-gray-400 font-semibold text-${align}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400 text-xs">{pay.date}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{pay.partyName || '—'}</td>
                      <td className="px-5 py-3 font-mono text-xs text-blue-600 font-semibold">{pay.invoiceNo || '—'}</td>
                      <td className="px-5 py-3 text-right font-bold text-red-500">₹{formatCurrency(pay.amount)}</td>
                      <td className="px-5 py-3">
                        <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{pay.mode}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{pay.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-gray-50">
                {payments.map(pay => (
                  <div key={pay.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-red-500 font-bold text-sm">↑</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{pay.partyName || '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {pay.date}
                        {pay.invoiceNo && <span className="font-mono"> · {pay.invoiceNo}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-red-500">₹{formatCurrency(pay.amount)}</p>
                      <span className="capitalize text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{pay.mode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
