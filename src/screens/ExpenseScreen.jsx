import { useEffect, useState } from 'react'
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { expenseOps, EXPENSE_CATEGORIES } from '../db'
import { formatCurrency, PAYMENT_MODES, todayDate } from '../utils'

const BLANK = { date: '', category: '', amount: '', mode: 'cash', partyName: '', notes: '' }

function ExpenseModal({ initialData, onClose, onSave }) {
  const editing = !!initialData
  const [saving, setSaving] = useState(false)
  const [form, setForm]     = useState(
    editing ? { ...initialData, amount: String(initialData.amount) } : { ...BLANK, date: todayDate() }
  )
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) { alert('Enter a valid amount'); return }
    if (!form.category) { alert('Select a category'); return }
    if (!form.date) { alert('Select a date'); return }
    setSaving(true)
    try {
      const data = { ...form, amount: Number(form.amount) }
      if (editing) await expenseOps.update({ ...initialData, ...data })
      else         await expenseOps.add(data)
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-[520px] flex flex-col">
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400">
                <option value="">— Select Category —</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Mode</label>
              <select value={form.mode} onChange={e => set('mode', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400">
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Paid To (Vendor / Party)</label>
              <input value={form.partyName} onChange={e => set('partyName', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                placeholder="e.g. Electricity Board, LIC Office" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                placeholder="Optional description" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
            {saving ? 'Saving…' : editing ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ExpenseScreen() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [filter, setFilter]     = useState('all')

  const load = () => expenseOps.getAll().then(d => { setExpenses(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    await expenseOps.delete(id); load()
  }
  const openAdd  = () => { setEditing(null); setShowModal(true) }
  const openEdit = (e) => { setEditing(e); setShowModal(true) }

  // Filtered by category
  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter)

  // Summary: total this month + by category
  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const thisMonth  = expenses.filter(e => e.date >= monthStart)
  const totalMonth = thisMonth.reduce((s, e) => s + e.amount, 0)
  const totalAll   = expenses.reduce((s, e) => s + e.amount, 0)

  // Category breakdown for this month
  const catTotals = thisMonth.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Unique categories present in expenses for filter
  const usedCategories = [...new Set(expenses.map(e => e.category))].sort()

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-900">Expenses</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Track your business expenditure</p>
        </div>
        <button onClick={openAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🧮</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No expenses recorded</h2>
            <p className="text-gray-500 text-sm mb-6">Track rent, salaries, utilities and other business costs.</p>
            <button onClick={openAdd}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto shadow-sm">
              <PlusIcon className="w-4 h-4" /> Add First Expense
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-3 md:p-5 space-y-3 md:space-y-4">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1 leading-tight">This Month</p>
              <p className="text-lg md:text-2xl font-bold text-orange-500">₹{formatCurrency(totalMonth)}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1 hidden sm:block">{thisMonth.length} entries</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1 leading-tight">All Time</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800">₹{formatCurrency(totalAll)}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1 hidden sm:block">{expenses.length} entries</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1 leading-tight">Top Category</p>
              <p className="text-sm md:text-base font-bold text-gray-800 truncate">{topCats[0]?.[0] ?? '—'}</p>
              {topCats[0] && <p className="text-[10px] md:text-xs text-orange-500 mt-1 font-semibold">₹{formatCurrency(topCats[0][1])}</p>}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
              All
            </button>
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === cat ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['Date','left'],['Category','left'],['Paid To','left'],['Amount','right'],['Mode','left'],['Notes','left'],['','center']].map(([h, align]) => (
                    <th key={h} className={`px-4 py-3 text-xs text-gray-400 font-semibold text-${align}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{exp.date}</td>
                    <td className="px-4 py-3">
                      <span className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">{exp.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{exp.partyName || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600">₹{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{exp.mode}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{exp.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(exp)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(exp.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm">No expenses in this category</p>
              </div>
            )}
          </div>

          {/* Mobile card list */}
          <div className="md:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm">No expenses in this category</p>
              </div>
            ) : filtered.map(exp => (
              <div key={exp.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-500 font-bold text-sm">₹</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-orange-50 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{exp.category}</span>
                    {exp.partyName && <span className="text-xs text-gray-500 truncate">{exp.partyName}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{exp.date}{exp.notes && ` · ${exp.notes}`}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-orange-600">₹{formatCurrency(exp.amount)}</p>
                  <span className="capitalize text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{exp.mode}</span>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => openEdit(exp)}
                    className="p-2 text-gray-400 active:text-blue-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(exp.id)}
                    className="p-2 text-gray-400 active:text-red-500 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {showModal && (
        <ExpenseModal
          initialData={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={() => { setShowModal(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}
