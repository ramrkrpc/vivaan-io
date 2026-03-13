import { useEffect, useState } from 'react'
import { dashboardOps } from '../db'
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  BanknotesIcon, ClockIcon,
} from '@heroicons/react/24/outline'

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900">₹ {value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const STATUS_COLORS = { paid: 'bg-green-100 text-green-700', partial: 'bg-yellow-100 text-yellow-700', unpaid: 'bg-red-100 text-red-700' }

export default function DashboardScreen({ onNavigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardOps.getStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{borderWidth:3}}/>
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  const { todaySales, monthSales, monthPurchases, totalReceivable, totalPayable, cashBalance, totalParties, totalItems, lowStock, recent, totalInvoices } = stats

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="px-6 py-3 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => onNavigate('sale-invoice-new')}
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all">
          + New Sale Invoice
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Today's Sales" value={todaySales}
            icon={<ArrowTrendingUpIcon className="w-5 h-5 text-teal-600"/>}
            color="bg-teal-50" sub="Direct sales today" />
          <StatCard label="This Month Sales" value={monthSales}
            icon={<ArrowTrendingUpIcon className="w-5 h-5 text-blue-600"/>}
            color="bg-blue-50" sub={`vs ₹${monthPurchases.toLocaleString('en-IN')} purchases`} />
          <StatCard label="Total Receivable" value={totalReceivable}
            icon={<ClockIcon className="w-5 h-5 text-orange-600"/>}
            color="bg-orange-50" sub="Outstanding from customers" />
          <StatCard label="Total Payable" value={totalPayable}
            icon={<ArrowTrendingDownIcon className="w-5 h-5 text-red-600"/>}
            color="bg-red-50" sub="Owed to suppliers" />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Cash balance */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BanknotesIcon className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-gray-700">Cash Balance</p>
            </div>
            <p className={`text-2xl font-bold ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹ {Math.abs(cashBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 mt-1">{cashBalance >= 0 ? 'Cash available' : 'Cash deficit'}</p>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Parties', value: totalParties, onClick: () => onNavigate('party-details'), color: 'text-blue-600' },
              { label: 'Items', value: totalItems, onClick: () => onNavigate('items'), color: 'text-teal-600' },
              { label: 'Invoices', value: totalInvoices, onClick: () => onNavigate('sale-list'), color: 'text-purple-600' },
              { label: 'Low Stock', value: lowStock.length, onClick: () => onNavigate('reports'), color: lowStock.length > 0 ? 'text-red-600' : 'text-green-600' },
            ].map(s => (
              <button key={s.label} onClick={s.onClick}
                className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: '+ New Sale Invoice', screen: 'sale-invoice-new', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
                { label: '+ New Purchase Invoice', screen: 'purchase-invoice-new', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { label: '+ Add Party', screen: 'party-details', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { label: '+ Record Payment', screen: 'payment-in', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.screen)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${a.color}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Invoices + Low Stock */}
        <div className="grid grid-cols-3 gap-4">
          {/* Recent Invoices */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Recent Invoices</p>
              <button onClick={() => onNavigate('sale-list')} className="text-xs text-blue-600 hover:underline">View all →</button>
            </div>
            {recent.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No invoices yet. <button onClick={() => onNavigate('sale-invoice-new')} className="text-blue-600 hover:underline">Create your first sale invoice</button></div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs">Invoice #</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs">Party</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs">Date</th>
                    <th className="text-right px-4 py-2 text-gray-500 font-medium text-xs">Amount</th>
                    <th className="text-center px-4 py-2 text-gray-500 font-medium text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(inv => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onNavigate(inv.type === 'sale' ? 'sale-list' : 'purchase-list')}>
                      <td className="px-4 py-2.5 font-mono text-xs text-blue-700">{inv.invoiceNo}</td>
                      <td className="px-4 py-2.5 text-gray-700">{inv.partyName || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{inv.date}</td>
                      <td className="px-4 py-2.5 text-right font-medium">₹{inv.total.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">⚠️ Low Stock</p>
              <button onClick={() => onNavigate('items')} className="text-xs text-blue-600 hover:underline">View all →</button>
            </div>
            {lowStock.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">✅ All items well stocked</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {lowStock.map(item => (
                  <li key={item.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-28">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.unit}</p>
                    </div>
                    <span className={`text-sm font-bold ${item.currentStock <= 0 ? 'text-red-600' : 'text-orange-500'}`}>
                      {item.currentStock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
