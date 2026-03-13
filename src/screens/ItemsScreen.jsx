import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { itemOps } from '../db'

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">{editing ? 'Edit Item' : 'Add Item'}</h2>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Item Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="Enter item name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sale Price (Rs)</label>
              <input type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Purchase Price (Rs)</label>
              <input type="number" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Unit</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">GST %</label>
              <select value={form.gst} onChange={e => set('gst', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                {GST_RATES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Opening Stock</label>
              <input type="number" value={form.openingStock} onChange={e => set('openingStock', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">HSN Code</label>
              <input value={form.hsn} onChange={e => set('hsn', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="HSN Code" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="Category" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Low Stock Alert</label>
              <input type="number" value={form.lowStockAlert} onChange={e => set('lowStockAlert', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                placeholder="5" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
              placeholder="Item description" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Update' : 'Save'}
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

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">Items</h1>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Item List</h2>
            <p className="text-gray-500 text-sm mb-6">Add your products and services to create invoices quickly.</p>
            <button onClick={() => { setEditing(null); setShowModal(true) }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 mx-auto">
              <PlusIcon className="w-4 h-4" /> Add Your First Item
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gray-50 p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Total Items', value: items.length, fmt: v => v, color: 'text-gray-800' },
              { label: 'Low Stock', value: items.filter(i => i.currentStock <= (i.lowStockAlert ?? 5)).length, fmt: v => v, color: 'text-red-600' },
              { label: 'Out of Stock', value: items.filter(i => i.currentStock <= 0).length, fmt: v => v, color: 'text-red-700' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.fmt(s.value)}</p>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <input type="text" placeholder="Search name, HSN, category..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400 w-72" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Item Name', 'HSN', 'Sale Price', 'Purchase Price', 'Unit', 'GST%', 'Stock', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-gray-500 font-medium text-xs ${['Sale Price', 'Purchase Price', 'Stock'].includes(h) ? 'text-right' : h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{item.hsn || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-700">
                      {item.salePrice > 0 ? `Rs ${Number(item.salePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      {item.purchasePrice > 0 ? `Rs ${Number(item.purchasePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{item.unit}</td>
                    <td className="px-4 py-2.5 text-gray-600">{item.gst}%</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-medium ${item.currentStock <= 0 ? 'text-red-600' : item.currentStock <= (item.lowStockAlert ?? 5) ? 'text-orange-500' : 'text-gray-700'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setEditing(item); setShowModal(true) }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No items found</p>}
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
