import { useEffect, useState } from 'react'
import { partyOps } from '../db'
import AddPartyModal from '../components/AddPartyModal'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function PartyDetailsScreen({ onNavigate }) {
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const load = () => partyOps.getAll().then(p => { setParties(p); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this party?')) return
    await partyOps.delete(id); load()
  }

  const filtered = parties.filter(p => {
    const q = search.toLowerCase()
    return (p.name.toLowerCase().includes(q) || (p.phone || '').includes(q) || (p.gstin || '').toLowerCase().includes(q))
      && (filter === 'all' || p.type === filter)
  })

  const totalReceivable = filtered.reduce((s, p) => s + (p.receivable || 0), 0)
  const totalPayable = filtered.reduce((s, p) => s + (p.payable || 0), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Customers & Suppliers</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage all your business contacts</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm">
          <PlusIcon className="w-4 h-4" /> Add Party
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : parties.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No parties yet</h2>
            <p className="text-gray-500 text-sm mb-6">Add your customers and suppliers to track invoices and payments easily.</p>
            <button onClick={() => { setEditing(null); setShowModal(true) }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto shadow-sm">
              <PlusIcon className="w-4 h-4" /> Add Your First Party
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Total Parties</p>
              <p className="text-2xl font-bold text-gray-800">{parties.length}</p>
              <p className="text-xs text-gray-400 mt-1">{parties.filter(p => p.type === 'customer').length} customers · {parties.filter(p => p.type === 'supplier').length} suppliers</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Customers Owe You</p>
              <p className="text-2xl font-bold text-green-600">₹{totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400 mt-1">Pending collections</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">You Owe Suppliers</p>
              <p className="text-2xl font-bold text-red-500">₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400 mt-1">Pending payments</p>
            </div>
          </div>

          {/* Search and filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search name, phone, GSTIN…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" />
            </div>
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {[['all', 'All'], ['customer', 'Customers'], ['supplier', 'Suppliers']].map(([val, label]) => (
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
                  {[['Name', 'left'], ['Type', 'left'], ['Phone', 'left'], ['GSTIN', 'left'], ['They Owe You', 'right'], ['You Owe Them', 'right'], ['', 'center']].map(([h, align]) => (
                    <th key={h} className={`px-4 py-3 text-xs text-gray-400 font-semibold text-${align}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {p.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                        p.type === 'customer' ? 'bg-blue-100 text-blue-700' :
                        p.type === 'supplier' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {p.type || 'both'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{p.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.gstin || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {(p.receivable || 0) > 0 ? `₹${p.receivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {(p.payable || 0) > 0 ? `₹${p.payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditing(p); setShowModal(true) }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
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
                <p className="text-gray-400 text-sm">No parties match your search</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <AddPartyModal
          initialData={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={() => { setShowModal(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}
