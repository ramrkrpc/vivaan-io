import { useEffect, useState } from 'react'
import { invoiceOps, partyOps, itemOps, paymentOps } from '../db'

const TABS = ['Overview', 'Sales', 'Purchases', 'Parties', 'Stock']

export default function ReportsScreen({ onNavigate }) {
  const [tab, setTab] = useState('Overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      invoiceOps.getAll(),
      partyOps.getAll(),
      itemOps.getAll(),
      paymentOps.getAll(),
    ]).then(([invoices, parties, items, payments]) => {
      setData({ invoices, parties, items, payments })
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { invoices, parties, items, payments } = data
  const sales = invoices.filter(i => i.type === 'sale')
  const purchases = invoices.filter(i => i.type === 'purchase')

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const isThisMonth = d => { const dt = new Date(d); return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear }

  const monthSalesTotal = sales.filter(i => isThisMonth(i.date)).reduce((s, i) => s + i.total, 0)
  const monthPurchaseTotal = purchases.filter(i => isThisMonth(i.date)).reduce((s, i) => s + i.total, 0)
  const grossProfit = monthSalesTotal - monthPurchaseTotal
  const totalReceivable = sales.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.balance ?? 0), 0)
  const totalPayable = purchases.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.balance ?? 0), 0)
  const cashIn = payments.filter(p => p.type === 'in').reduce((s, p) => s + p.amount, 0)
  const cashOut = payments.filter(p => p.type === 'out').reduce((s, p) => s + p.amount, 0)

  // Party-wise receivable
  const partyReceivable = parties
    .map(p => ({
      name: p.name,
      receivable: p.receivable ?? 0,
      payable: p.payable ?? 0,
    }))
    .filter(p => p.receivable > 0 || p.payable > 0)
    .sort((a, b) => (b.receivable + b.payable) - (a.receivable + a.payable))

  // Item-wise sales
  const itemSales = {}
  sales.forEach(inv => {
    ;(inv.items ?? []).forEach(li => {
      if (!itemSales[li.name]) itemSales[li.name] = { qty: 0, amount: 0 }
      itemSales[li.name].qty += Number(li.qty)
      itemSales[li.name].amount += (li.qty || 0) * (li.rate || 0)
    })
  })
  const itemSalesList = Object.entries(itemSales)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-base font-semibold text-gray-800">Reports</h1>
      </div>

      <div className="flex border-b border-gray-200 bg-white px-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-2.5 px-4 text-xs font-medium border-b-2 transition-colors ${tab === t ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-5">
        {tab === 'Overview' && (
          <div className="space-y-4 max-w-4xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">This Month Summary</p>
                {[
                  { label: 'Sales', value: monthSalesTotal, color: 'text-teal-600' },
                  { label: 'Purchases', value: monthPurchaseTotal, color: 'text-blue-600' },
                  { label: 'Gross Profit', value: grossProfit, color: grossProfit >= 0 ? 'text-green-600' : 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.label}</span>
                    <span className={`text-sm font-bold ${s.color}`}>
                      Rs {s.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Outstanding Balances</p>
                {[
                  { label: 'Total Receivable', value: totalReceivable, color: 'text-orange-600' },
                  { label: 'Total Payable', value: totalPayable, color: 'text-red-600' },
                  { label: 'Net Position', value: totalReceivable - totalPayable, color: (totalReceivable - totalPayable) >= 0 ? 'text-green-600' : 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{s.label}</span>
                    <span className={`text-sm font-bold ${s.color}`}>
                      Rs {Math.abs(s.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Cash Flow</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Cash Received', value: cashIn, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Cash Paid', value: cashOut, color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Net Cash', value: cashIn - cashOut, color: (cashIn - cashOut) >= 0 ? 'text-green-600' : 'text-red-600', bg: 'bg-gray-50' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-lg p-4`}>
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>Rs {Math.abs(s.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Sales' && (
          <div className="max-w-4xl space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Invoices', value: sales.length, fmt: v => v, color: 'text-gray-800' },
                { label: 'Total Revenue', value: sales.reduce((s, i) => s + i.total, 0), fmt: v => `Rs ${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-teal-600' },
                { label: 'Pending', value: sales.filter(i => i.status !== 'paid').length, fmt: v => v, color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.fmt(s.value)}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Item-wise Sales</p>
              </div>
              {itemSalesList.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No sales data</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-left">Item</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Qty Sold</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemSalesList.map((item, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{item.qty}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-teal-700">
                          Rs {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'Purchases' && (
          <div className="max-w-4xl space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Invoices', value: purchases.length, fmt: v => v, color: 'text-gray-800' },
                { label: 'Total Purchased', value: purchases.reduce((s, i) => s + i.total, 0), fmt: v => `Rs ${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'text-blue-600' },
                { label: 'Pending Payment', value: purchases.filter(i => i.status !== 'paid').length, fmt: v => v, color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.fmt(s.value)}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Recent Purchases</p>
              </div>
              {purchases.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No purchase data</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-left">Invoice #</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-left">Supplier</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-left">Date</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Amount</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.slice(0, 20).map(inv => (
                      <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-xs text-blue-700">{inv.invoiceNo}</td>
                        <td className="px-4 py-2.5 text-gray-700">{inv.partyName || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{inv.date}</td>
                        <td className="px-4 py-2.5 text-right font-medium">Rs {inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                            inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>{inv.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'Parties' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Party-wise Outstanding</p>
              </div>
              {partyReceivable.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No outstanding balances</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-left">Party</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Receivable</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Payable</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partyReceivable.map((p, i) => {
                      const net = p.receivable - p.payable
                      return (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                          <td className="px-4 py-2.5 text-right text-green-600 font-medium">
                            {p.receivable > 0 ? `Rs ${p.receivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right text-red-600 font-medium">
                            {p.payable > 0 ? `Rs ${p.payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className={`px-4 py-2.5 text-right font-bold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            Rs {Math.abs(net).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            <span className="text-xs font-normal ml-1">{net >= 0 ? '↑' : '↓'}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'Stock' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Stock Report</p>
              </div>
              {items.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No items found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-left">Item</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-left">Unit</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Opening</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Current Stock</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">Value (Sale)</th>
                      <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const isLow = item.currentStock <= (item.lowStockAlert ?? 5)
                      const isOut = item.currentStock <= 0
                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-medium text-gray-800">{item.name}</td>
                          <td className="px-4 py-2.5 text-gray-500">{item.unit}</td>
                          <td className="px-4 py-2.5 text-right text-gray-600">{item.openingStock ?? 0}</td>
                          <td className={`px-4 py-2.5 text-right font-bold ${isOut ? 'text-red-600' : isLow ? 'text-orange-500' : 'text-gray-800'}`}>
                            {item.currentStock}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600">
                            {item.salePrice > 0
                              ? `Rs ${(item.currentStock * item.salePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                              : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                              {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
