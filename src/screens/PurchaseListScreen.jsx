import { useEffect, useState } from 'react'
import { PlusIcon, BanknotesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { invoiceOps } from '../db'
import { STATUS_COLORS, STATUS_LABELS, formatCurrency } from '../utils'
import RecordPaymentModal from '../components/RecordPaymentModal'

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
    return ((inv.invoiceNo || '').toLowerCase().includes(q) || (inv.partyName || '').toLowerCase().includes(q))
      && (filter === 'all' || inv.status === filter)
  })

  // Single-pass totals
  const totals = filtered.reduce(
    (acc, i) => ({ total: acc.total + i.total, paid: acc.paid + (i.paid ?? 0), balance: acc.balance + (i.balance ?? 0) }),
    { total: 0, paid: 0, balance: 0 }
  )

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-900">Purchase Invoices</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Track bills from your suppliers</p>
        </div>
        <button onClick={() => onNavigate('purchase-invoice-new')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">New Purchase</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
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
        <div className="flex-1 overflow-auto p-3 md:p-5 space-y-3 md:space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { label: 'Total Purchased', value: totals.total,   color: 'text-gray-800',  sub: `${filtered.length} invoices` },
              { label: 'Amount Paid',     value: totals.paid,    color: 'text-green-600', sub: 'Paid to suppliers' },
              { label: 'Amount Payable',  value: totals.balance, color: 'text-red-500',   sub: 'Yet to pay' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
                <p className="text-[10px] md:text-xs text-gray-400 mb-1 leading-tight">{s.label}</p>
                <p className={`text-lg md:text-2xl font-bold ${s.color}`}>₹{formatCurrency(s.value)}</p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-1 hidden sm:block">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search invoice, supplier…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" />
            </div>
            <div className="flex gap-0.5 md:gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
              {[['all', 'All'], ['unpaid', 'Unpaid'], ['partial', 'Part'], ['paid', 'Paid']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === val ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['Invoice #','left'],['Supplier','left'],['Date','left'],['Due Date','left'],['Total','right'],['Paid','right'],['Balance','right'],['Status','center'],['','center']].map(([h, align]) => (
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
                    <td className="px-4 py-3 text-right font-bold text-gray-800">₹{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">
                      {(inv.paid ?? 0) > 0 ? `₹${formatCurrency(inv.paid)}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-red-500 font-semibold">
                      {(inv.balance ?? 0) > 0 ? `₹${formatCurrency(inv.balance)}` : <span className="text-gray-300 font-normal">—</span>}
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

          {/* Mobile card list */}
          <div className="md:hidden bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm">No invoices match your search</p>
              </div>
            ) : filtered.map(inv => (
              <div key={inv.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">{inv.partyName || '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{inv.invoiceNo} · {inv.date}</p>
                  </div>
                  <div className="shrink-0 ml-3 text-right">
                    <p className="font-bold text-gray-800 text-sm">₹{formatCurrency(inv.total)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs">
                    {(inv.paid ?? 0) > 0 && (
                      <span className="text-green-600">✓ ₹{formatCurrency(inv.paid)} paid</span>
                    )}
                    {(inv.balance ?? 0) > 0 && (
                      <span className="text-red-500">₹{formatCurrency(inv.balance)} due</span>
                    )}
                  </div>
                  {inv.status !== 'paid' && (
                    <button onClick={() => setPayInvoice(inv)}
                      className="inline-flex items-center gap-1 text-xs text-teal-600 font-semibold bg-teal-50 active:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors min-h-[36px]">
                      <BanknotesIcon className="w-3.5 h-3.5" /> Pay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {payInvoice && (
        <RecordPaymentModal
          invoice={payInvoice}
          type="out"
          onClose={() => setPayInvoice(null)}
          onSave={() => { setPayInvoice(null); load() }}
        />
      )}
    </div>
  )
}
