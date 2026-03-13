import { useEffect, useState } from 'react'
import { partyOps } from '../db'
import AddPartyModal from '../components/AddPartyModal'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../utils'

export default function PartyDetailsScreen({ onNavigate }) {
  const [parties, setParties]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')

  const load = () => partyOps.getAll().then(p => { setParties(p); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this party?')) return
    await partyOps.delete(id); load()
  }

  const openAdd  = ()  => { setEditing(null); setShowModal(true) }
  const openEdit = (p) => { setEditing(p);    setShowModal(true) }

  const filtered = parties.filter(p => {
    const q = search.toLowerCase()
    return (p.name.toLowerCase().includes(q) || (p.phone || '').includes(q) || (p.gstin || '').toLowerCase().includes(q))
      && (filter === 'all' || p.type === filter)
  })

  // Single-pass totals
  const totals = filtered.reduce(
    (acc, p) => ({ receivable: acc.receivable + (p.receivable || 0), payable: acc.payable + (p.payable || 0) }),
    { receivable: 0, payable: 0 }
  )

  const typeColors = {
    customer: 'bg-blue-100 text-blue-700',
    supplier: 'bg-purple-100 text-purple-700',
    both:     'bg-gray-100 text-gray-700',
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-900">Customers & Suppliers</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Manage all your business contacts</p>
        </div>
        <button onClick={openAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Add Party</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : parties.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No parties yet</h2>
            <p className="text-gray-500 text-sm mb-6">Add your customers and suppliers to track invoices and payments easily.</p>
            <button onClick={openAdd}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto shadow-sm">
              <PlusIcon className="w-4 h-4" /> Add Your First Party
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-3 md:p-5 space-y-3 md:space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1">Total Parties</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800">{parties.length}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1 hidden sm:block">
                {parties.filter(p => p.type === 'customer').length}c · {parties.filter(p => p.type === 'supplier').length}s
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1">Owe You</p>
              <p className="text-lg md:text-2xl font-bold text-green-600">₹{formatCurrency(totals.receivable)}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1 hidden sm:block">Pending collections</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1">You Owe</p>
              <p className="text-lg md:text-2xl font-bold text-red-500">₹{formatCurrency(totals.payable)}</p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1 hidden sm:block">Pending payments</p>
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search name, phone, GSTIN…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100" />
            </div>
            <div className="flex gap-0.5 md:gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
              {[['all','All'],['customer','Cust.'],['supplier','Supp.']].map(([val, label]) => (
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
                  {[['Name','left'],['Type','left'],['Phone','left'],['GSTIN','left'],['They Owe You','right'],['You Owe Them','right'],['','center']].map(([h, align]) => (
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
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${typeColors[p.type] ?? typeColors.both}`}>
                        {p.type || 'both'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{p.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.gstin || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {(p.receivable || 0) > 0 ? `₹${formatCurrency(p.receivable)}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {(p.payable || 0) > 0 ? `₹${formatCurrency(p.payable)}` : <span className="text-gray-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)}
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

          {/* Mobile card list */}
          <div className="md:hidden bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm">No parties match your search</p>
              </div>
            ) : filtered.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {p.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize shrink-0 ${typeColors[p.type] ?? typeColors.both}`}>
                      {p.type || 'both'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{p.phone || p.email || '—'}</p>
                </div>
                <div className="shrink-0 text-right mr-1">
                  {(p.receivable || 0) > 0 && (
                    <p className="text-xs font-semibold text-green-600">↑ ₹{formatCurrency(p.receivable)}</p>
                  )}
                  {(p.payable || 0) > 0 && (
                    <p className="text-xs font-semibold text-red-500">↓ ₹{formatCurrency(p.payable)}</p>
                  )}
                  {!p.receivable && !p.payable && (
                    <p className="text-xs text-gray-300">—</p>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => openEdit(p)}
                    className="p-2 text-gray-400 active:text-blue-600 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
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
        <AddPartyModal
          initialData={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={() => { setShowModal(false); setEditing(null); load() }}
        />
      )}
    </div>
  )
}
