import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { itemOps } from '../db'
import { formatCurrency } from '../utils'

const UNITS = ['Nos', 'Kg', 'Litre', 'Meter', 'Box', 'Pack', 'Dozen', 'Set', 'Piece', 'Quintal', 'Ton']
const GST_RATES = ['0', '5', '12', '18', '28']

function ItemModal({ initialData, onClose, onSave }) {
  const editing = !!initialData
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    salePrice: initialData?.salePrice ?? '',
    purchasePrice: initialData?.purchasePrice ?? '',
    unit: initialData?.unit ?? 'Nos',
    gst: initialData?.gst ?? '18',
    hsn: initialData?.hsn ?? '',
    category: initialData?.category ?? '',
    openingStock: initialData?.openingStock ?? '',
    lowStockAlert: initialData?.lowStockAlert ?? '5',
    description: initialData?.description ?? '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Item name required'); return }
    setSaving(true)
    try {
      const data = {
        ...form,
        salePrice: form.salePrice ? Number(form.salePrice) : 0,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : 0,
        openingStock: form.openingStock ? Number(form.openingStock) : 0,
        lowStockAlert: form.lowStockAlert ? Number(form.lowStockAlert) : 5,
      }
      if (editing) await itemOps.update({ ...initialData, ...data })
      else await itemOps.add(data)
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{editing ? 'Update product details' : 'Add a new product or service'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder="e.g. Office Chair, Web Design Service" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sale Price (₹)</label>
              <input type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Purchase Price (₹)</label>
              <input type="number" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">GST Rate</label>
              <select value={form.gst} onChange={e => set('gst', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                {GST_RATES.map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Opening Stock</label>
              <input type="number" value={form.openingStock} onChange={e => set('openingStock', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">HSN Code</label>
              <input value={form.hsn} onChange={e => set('hsn', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="HSN Code" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="e.g. Electronics" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Low Stock Alert</label>
              <input type="number" value={form.lowStockAlert} onChange={e => set('lowStockAlert', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="5" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 resize-none"
              placeholder="Optional product description" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
            {saving ? 'Saving…' : editing ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItemsScreen() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const load = () => itemOps.getAll().then(d => { setItems(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    await itemOps.delete(id); load()
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.hsn || '').includes(search) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  // Single-pass stock counts (replaces two separate .filter() calls)
  const stockCounts = items.reduce(
    (acc, i) => {
      if (i.currentStock <= 0) acc.outOfStock++
      else if (i.currentStock <= (i.lowStockAlert ?? 5)) acc.lowStock++
      return acc
    },
    { lowStock: 0, outOfStock: 0 }
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
          <h1 className="text-lg font-bold text-gray-900">My Products</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your inventory and pricing</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm">
          <PlusIcon className="w-4 h-4" /> Add Product
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No products yet</h2>
            <p className="text-gray-500 text-sm mb-6">Add your products and services to create invoices in seconds.</p>
            <button onClick={() => { setEditing(null); setShowModal(true) }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto shadow-sm">
              <PlusIcon className="w-4 h-4" /> Add Your First Product
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Products', value: items.length, color: 'text-gray-800', sub: 'in your catalogue' },
              { label: 'Low Stock Items', value: stockCounts.lowStock, color: 'text-orange-500', sub: 'need restocking' },
              { label: 'Out of Stock', value: stockCounts.outOfStock, color: 'text-red-600', sub: 'unavailable now' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search name, HSN, category…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['Product Name', 'left'], ['HSN', 'left'], ['Sale Price', 'right'], ['Purchase Price', 'right'], ['Unit', 'left'], ['GST', 'left'], ['Stock', 'right'], ['', 'center']].map(([h, align]) => (
                    <th key={h} className={`px-4 py-3 text-xs text-gray-400 font-semibold text-${align}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      {item.category && <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{item.hsn || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {item.salePrice > 0 ? `₹${formatCurrency(item.salePrice)}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {item.purchasePrice > 0 ? `₹${formatCurrency(item.purchasePrice)}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.unit}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{item.gst}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold text-sm ${item.currentStock <= 0 ? 'text-red-600' : item.currentStock <= (item.lowStockAlert ?? 5) ? 'text-orange-500' : 'text-gray-700'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditing(item); setShowModal(true) }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)}
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
                <p className="text-gray-400 text-sm">No products match your search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <ItemModal
          initialData={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={() => { setShowModal(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}
