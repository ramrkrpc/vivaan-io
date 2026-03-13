import { useEffect, useState } from 'react'
import { partyOps } from '../db'
import AddPartyModal from '../components/AddPartyModal'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">Party Details</h1>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Add Party
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : parties.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">{"👥"}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Party Details</h2>
            <p className="text-gray-500 text-sm mb-6">Add customers and suppliers to track payments easily.</p>
            <button onClick={() => { setEditing(null); setShowModal(true) }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 mx-auto">
              <PlusIcon className="w-4 h-4" /> Add Your First Party
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gray-50 p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Total Parties', value: parties.length, fmt: v => v, color: 'text-gray-800' },
              { label: 'Total Receivable', value: filtered.reduce((s, p) => s + (p.receivable || 0), 0), fmt: v => `Rs ${v.toLocaleString('en-IN', {minimumFractionDigits:2})}`, color: 'text-green-600' },
              { label: 'Total Payable', value: filtered.reduce((s, p) => s + (p.payable || 0), 0), fmt: v => `Rs ${v.toLocaleString('en-IN', {minimumFractionDigits:2})}`, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.fmt(s.value)}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <input type="text" placeholder="Search name, phone, GSTIN..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400 w-72" />
            <div className="flex gap-1">
              {['all', 'customer', 'supplier'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === f ? 'bg-teal-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Party Name', 'Type', 'Phone', 'GSTIN', 'Receivable', 'Payable', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-gray-500 font-medium text-xs ${['Receivable','Payable'].includes(h) ? 'text-right' : h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${p.type === 'customer' ? 'bg-blue-100 text-blue-700' : p.type === 'supplier' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.type || 'both'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{p.phone || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{p.gstin || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-green-700">
                      {(p.receivable || 0) > 0 ? `Rs ${p.receivable.toLocaleString('en-IN', {minimumFractionDigits:2})}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-red-600">
                      {(p.payable || 0) > 0 ? `Rs ${p.payable.toLocaleString('en-IN', {minimumFractionDigits:2})}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setEditing(p); setShowModal(true) }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No parties found</p>}
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