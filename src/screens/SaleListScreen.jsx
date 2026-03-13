import { useEffect, useState } from 'react'
import { PlusIcon, BanknotesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { invoiceOps } from '../db'
import { STATUS_COLORS, STATUS_LABELS, formatCurrency } from '../utils'
import RecordPaymentModal from '../components/RecordPaymentModal'

export default function SaleListScreen({ onNavigate }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [payInvoice, setPayInvoice] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = () => invoiceOps.getAll('sale').then(d => { setInvoices(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    return ((inv.invoiceNo || '').toLowerCase().includes(q) || (inv.partyName || '').toLowerCase().includes(q))
      && (filter === 'all' || inv.status === filter)
  })

  // Single-pass totals (was three separate reduce calls)
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
      <div className="px-6 py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Sale Invoices</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track all your sales and collections</p>
        </div>
        <button onClick={() => onNavigate('sale-invoice-new')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm">
          <PlusIcon className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🧾</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Sale Invoices Yet</h2>
            <p className="text-gray-500 text-sm mb-6">Create your first invoice to start tracking your sales.</p>
            <button onClick={() => onNavigate('sale-invoice-new')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto shadow-sm">
              <PlusIcon className="w-4 h-4" /> Create Sale Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Invoiced',      value: totals.total,   color: 'text-gray-800', sub: `${filtered.length} invoices` },
              { label: 'Amount Received',     value: totals.paid,    color: 'text-green-600', sub: 'Collected so far' },
              { label: 'Outstanding Balance', value: totals.balance, color: 'text-red-500',   sub: 'Yet to collect' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>₹{formatCurrency(s.value)}</p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search invoice #, party name…"
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

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['Invoice #', 'left'], ['Customer', 'left'], ['Date', 'left'], ['Due Date', 'left'], ['Total', 'right'], ['Received', 'right'], ['Balance', 'right'], ['Status', 'center'], ['', 'center']].map(([h, align]) => (
                    <th key={h} className={`px-4 py-3 text-xs text-gray-400 font-semibold text-${align}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-teal-600 font-semibold">{inv.invoiceNo}</td>
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
                          <BanknotesIcon className="w-3.5 h-3.5" /> Collect
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
          type="in"
          onClose={() => setPayInvoice(null)}
          onSave={() => { setPayInvoice(null); load() }}
        />
      )}
    </div>
  )
}
