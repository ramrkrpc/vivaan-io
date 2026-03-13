import { useEffect, useState } from 'react'
import { dashboardOps } from '../db'
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  BanknotesIcon, ClockIcon, PlusIcon,
} from '@heroicons/react/24/outline'
import { STATUS_COLORS, STATUS_LABELS, formatCurrency } from '../utils'

function StatCard({ label, value, icon, bgColor, textColor, subLabel }) {
  return (
    <div className={`rounded-2xl p-4 md:p-5 flex flex-col gap-2 md:gap-3 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm font-medium opacity-80">{label}</span>
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-xl md:text-2xl font-bold tracking-tight ${textColor}`}>
          ₹{formatCurrency(value)}
        </p>
        {subLabel && (
          <p className={`text-[10px] md:text-xs mt-1 opacity-70 ${textColor}`}>{subLabel}</p>
        )}
      </div>
    </div>
  )
}

// Simple inline SVG bar chart
function BarChart({ data }) {
  const maxVal = Math.max(...data.flatMap(d => [d.sales, d.purchases]), 1)
  const BAR_W = 18
  const GAP   = 4
  const GROUP = BAR_W * 2 + GAP + 12  // two bars + gap + group spacing
  const H     = 80
  const W     = data.length * GROUP

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ maxHeight: 120 }}>
      {data.map((d, i) => {
        const x     = i * GROUP
        const sH    = Math.max(2, (d.sales     / maxVal) * H)
        const pH    = Math.max(2, (d.purchases / maxVal) * H)
        const sY    = H - sH
        const pY    = H - pH
        return (
          <g key={d.label}>
            {/* Sales bar */}
            <rect x={x} y={sY} width={BAR_W} height={sH} rx={3} fill="#0d9488" opacity="0.85" />
            {/* Purchases bar */}
            <rect x={x + BAR_W + GAP} y={pY} width={BAR_W} height={pH} rx={3} fill="#6366f1" opacity="0.6" />
            {/* Month label */}
            <text x={x + BAR_W} y={H + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function DashboardScreen({ onNavigate }) {
  const [stats, setStats]   = useState(null)
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

  const {
    todaySales, monthSales, monthPurchases,
    totalReceivable, totalPayable, cashBalance,
    totalParties, totalItems, lowStock, recent, totalInvoices,
    overdueInvoices, monthlyTrend,
  } = stats

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{today}</p>
        </div>
        <button onClick={() => onNavigate('sale-invoice-new')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-teal-200">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">New Sale Invoice</span>
          <span className="sm:hidden">New Sale</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 md:p-5 space-y-3 md:space-y-4">

        {/* Overdue alert banner */}
        {overdueInvoices?.length > 0 && (
          <button onClick={() => onNavigate('sale-list')}
            className="w-full flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-left hover:bg-red-100 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-700">
                  {overdueInvoices.length} Overdue Invoice{overdueInvoices.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-500">
                  Oldest due: {overdueInvoices[0].dueDate} · ₹{formatCurrency(overdueInvoices.reduce((s, i) => s + (i.balance ?? 0), 0))} outstanding
                </p>
              </div>
            </div>
            <span className="text-xs text-red-600 font-semibold shrink-0">View →</span>
          </button>
        )}

        {/* Money stats — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <StatCard
            label="Today's Sales"
            value={todaySales}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />}
            bgColor="bg-gradient-to-br from-teal-500 to-teal-600"
            textColor="text-white"
            subLabel="Cash coming in today"
          />
          <StatCard
            label="This Month Sales"
            value={monthSales}
            icon={<ArrowTrendingUpIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-white"
            subLabel={`₹${formatCurrency(monthPurchases)} in purchases`}
          />
          <StatCard
            label="Customers Owe You"
            value={totalReceivable}
            icon={<ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />}
            bgColor="bg-gradient-to-br from-amber-400 to-orange-500"
            textColor="text-white"
            subLabel="Collect from customers"
          />
          <StatCard
            label="You Owe Suppliers"
            value={totalPayable}
            icon={<ArrowTrendingDownIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />}
            bgColor="bg-gradient-to-br from-rose-500 to-red-600"
            textColor="text-white"
            subLabel="Pay to suppliers"
          />
        </div>

        {/* Second row — stacked on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">

          {/* Cash balance + counters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <BanknotesIcon className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Cash Balance</p>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{formatCurrency(Math.abs(cashBalance))}
            </p>
            <p className="text-xs text-gray-400 mt-1">{cashBalance >= 0 ? 'Cash available in hand' : 'Cash shortfall'}</p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
              {[
                { label: 'Parties',   value: totalParties,    screen: 'party-details', color: 'text-blue-600' },
                { label: 'Products',  value: totalItems,      screen: 'items',         color: 'text-teal-600' },
                { label: 'Invoices',  value: totalInvoices,   screen: 'sale-list',     color: 'text-purple-600' },
                { label: 'Low Stock', value: lowStock.length, screen: 'items',         color: lowStock.length > 0 ? 'text-red-600' : 'text-green-600' },
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
                { label: 'New Sale Invoice',        screen: 'sale-invoice-new',     color: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100' },
                { label: 'New Purchase Invoice',    screen: 'purchase-invoice-new', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100' },
                { label: 'Add Customer / Supplier', screen: 'party-details',        color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100' },
                { label: 'Record Payment Received', screen: 'payment-in',           color: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100' },
                { label: 'Add Expense',             screen: 'expense',              color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100' },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.screen)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold transition-all ${a.color}`}>
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
                <p className="text-gray-500 text-sm font-medium">All items well stocked</p>
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

        {/* Monthly Trend Chart */}
        {monthlyTrend && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">Sales vs Purchases — Last 6 Months</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" /> Sales</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" /> Purchases</span>
              </div>
            </div>
            <BarChart data={monthlyTrend} />
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
              {monthlyTrend.slice(-3).map(m => (
                <div key={m.label} className="text-center">
                  <p className="text-[10px] text-gray-400 mb-1">{m.label}</p>
                  <p className="text-xs font-bold text-teal-600">₹{formatCurrency(m.sales)}</p>
                  <p className="text-[10px] text-indigo-400">₹{formatCurrency(m.purchases)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
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
            <>
              {/* Desktop table */}
              <table className="hidden md:table w-full text-sm">
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
                      <td className="px-5 py-3 text-right font-bold text-gray-800">₹{formatCurrency(inv.total)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[inv.status] ?? inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-gray-50">
                {recent.map(inv => (
                  <button key={inv.id} onClick={() => onNavigate(inv.type === 'sale' ? 'sale-list' : 'purchase-list')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left">
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold
                      ${inv.type === 'sale' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                      {inv.type === 'sale' ? '↑' : '↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{inv.partyName || '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{inv.invoiceNo} · {inv.date}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-gray-800">₹{formatCurrency(inv.total)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[inv.status] ?? inv.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
