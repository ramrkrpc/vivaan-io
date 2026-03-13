import { useEffect, useState } from 'react'
import { dashboardOps } from '../db'
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  BanknotesIcon, ClockIcon, PlusIcon,
} from '@heroicons/react/24/outline'

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700'
}

function StatCard({ label, value, icon, bgColor, textColor, subLabel, subValue, subColor }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold tracking-tight ${textColor}`}>
          ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {subLabel && (
          <p className={`text-xs mt-1 opacity-70 ${subColor || textColor}`}>{subLabel}</p>
        )}
      </div>
    </div>
  )
}

export default function DashboardScreen({ onNavigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardOps.getStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading your dashboard…</p>
      </div>
    </div>
  )

  const { todaySales, monthSales, monthPurchases, totalReceivable, totalPayable, cashBalance, totalParties, totalItems, lowStock, recent, totalInvoices } = stats

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">{today}</p>
        </div>
        <button onClick={() => onNavigate('sale-invoice-new')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-teal-200">
          <PlusIcon className="w-4 h-4" /> New Sale Invoice
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-4">

        {/* Money stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="Today's Sales"
            value={todaySales}
            icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />}
            bgColor="bg-gradient-to-br from-teal-500 to-teal-600"
            textColor="text-white"
            subLabel="Cash coming in today"
          />
          <StatCard
            label="This Month Sales"
            value={monthSales}
            icon={<ArrowTrendingUpIcon className="w-5 h-5 text-white" />}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-white"
            subLabel={`₹${monthPurchases.toLocaleString('en-IN')} in purchases`}
          />
          <StatCard
            label="Customers Owe You"
            value={totalReceivable}
            icon={<ClockIcon className="w-5 h-5 text-white" />}
            bgColor="bg-gradient-to-br from-amber-400 to-orange-500"
            textColor="text-white"
            subLabel="Collect from customers"
          />
          <StatCard
            label="You Owe Suppliers"
            value={totalPayable}
            icon={<ArrowTrendingDownIcon className="w-5 h-5 text-white" />}
            bgColor="bg-gradient-to-br from-rose-500 to-red-600"
            textColor="text-white"
            subLabel="Pay to suppliers"
          />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-3 gap-3">

          {/* Cash balance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <BanknotesIcon className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Cash Balance</p>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(cashBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 mt-1">{cashBalance >= 0 ? 'Cash available in hand' : 'Cash shortfall'}</p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
              {[
                { label: 'Customers', value: totalParties, screen: 'party-details', color: 'text-blue-600' },
                { label: 'Products', value: totalItems, screen: 'items', color: 'text-teal-600' },
                { label: 'Invoices', value: totalInvoices, screen: 'sale-list', color: 'text-purple-600' },
                { label: 'Low Stock', value: lowStock.length, screen: 'items', color: lowStock.length > 0 ? 'text-red-600' : 'text-green-600' },
              ].map(s => (
                <button key={s.label} onClick={() => onNavigate(s.screen)}
                  className="text-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-gray-400">{s.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'New Sale Invoice', screen: 'sale-invoice-new', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100' },
                { label: 'New Purchase Invoice', screen: 'purchase-invoice-new', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100' },
                { label: 'Add Customer / Supplier', screen: 'party-details', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100' },
                { label: 'Record Payment Received', screen: 'payment-in', color: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100' },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.screen)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${a.color}`}>
                  + {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Low Stock Alert</p>
              <button onClick={() => onNavigate('items')} className="text-xs text-teal-600 hover:underline font-medium">View all →</button>
            </div>
            {lowStock.length === 0 ? (
              <div className="mt-6 text-center">
                <p className="text-3xl mb-1">✅</p>
                <p className="text-gray-500 text-sm font-medium">All items are well stocked</p>
                <p className="text-gray-400 text-xs mt-1">No action needed right now</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {lowStock.slice(0, 5).map(item => (
                  <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.unit}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ml-2 ${item.currentStock <= 0 ? 'text-red-600' : 'text-orange-500'}`}>
                      {item.currentStock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Recent Invoices</p>
            <button onClick={() => onNavigate('sale-list')} className="text-xs text-teal-600 hover:underline font-medium">See all →</button>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-2xl mb-2">📄</p>
              <p className="text-gray-500 text-sm font-medium">No invoices yet</p>
              <button onClick={() => onNavigate('sale-invoice-new')}
                className="mt-3 text-sm text-teal-600 hover:underline font-semibold">
                Create your first sale invoice →
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['Invoice #', 'left'], ['Customer / Supplier', 'left'], ['Date', 'left'], ['Amount', 'right'], ['Status', 'center']].map(([h, align]) => (
                    <th key={h} className={`px-5 py-3 text-xs text-gray-400 font-semibold text-${align}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onNavigate(inv.type === 'sale' ? 'sale-list' : 'purchase-list')}>
                    <td className="px-5 py-3 font-mono text-xs text-blue-600 font-semibold">{inv.invoiceNo}</td>
                    <td className="px-5 py-3 text-gray-800 font-medium">{inv.partyName || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{inv.date}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-800">₹{inv.total.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {inv.status === 'paid' ? 'Paid' : inv.status === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
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
