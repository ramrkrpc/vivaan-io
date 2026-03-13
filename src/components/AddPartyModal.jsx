import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { partyOps } from '../db'

const TABS = ['Basic Info', 'GST & Address', 'Credit & Balance']

export default function AddPartyModal({ initialData, onClose, onSave }) {
  const editing = !!initialData
  const [tab, setTab] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    type: initialData?.type ?? 'customer',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    gstin: initialData?.gstin ?? '',
    pan: initialData?.pan ?? '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    state: initialData?.state ?? '',
    pincode: initialData?.pincode ?? '',
    creditLimit: initialData?.creditLimit ?? '',
    creditDays: initialData?.creditDays ?? '',
    openingBalance: initialData?.openingBalance ?? '',
    openingBalanceType: initialData?.openingBalanceType ?? 'receivable',
    notes: initialData?.notes ?? '',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (andNew = false) => {
    if (!form.name.trim()) { alert('Party name is required'); return }
    setSaving(true)
    try {
      const data = {
        ...form,
        creditLimit: form.creditLimit ? Number(form.creditLimit) : 0,
        creditDays: form.creditDays ? Number(form.creditDays) : 0,
        openingBalance: form.openingBalance
          ? (form.openingBalanceType === 'receivable' ? Number(form.openingBalance) : -Number(form.openingBalance))
          : 0,
      }
      if (editing) {
        await partyOps.update({ ...initialData, ...data })
      } else {
        await partyOps.add(data)
      }
      if (andNew) {
        setForm({ name: '', type: 'customer', phone: '', email: '', gstin: '', pan: '', address: '', city: '', state: '', pincode: '', creditLimit: '', creditDays: '', openingBalance: '', openingBalanceType: 'receivable', notes: '' })
        setTab(0)
      } else {
        onSave()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">{editing ? 'Edit Party' : 'Add Party'}</h2>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-800" /></button>
        </div>

        <div className="flex border-b border-gray-200 px-6">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${tab === i ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          {tab === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Party Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="Enter party name" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Party Type</label>
                <div className="flex gap-2">
                  {['customer', 'supplier', 'both'].map(t => (
                    <button key={t} onClick={() => set('type', t)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${form.type === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                    placeholder="Mobile number" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                    placeholder="Email address" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
                  placeholder="Any notes about this party" />
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">GSTIN</label>
                  <input value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-teal-400"
                    placeholder="22AAAAA0000A1Z5" maxLength={15} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">PAN</label>
                  <input value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-teal-400"
                    placeholder="AAAAA0000A" maxLength={10} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
                  placeholder="Street address" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="City" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">State</label>
                  <input value={form.state} onChange={e => set('state', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="State" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pincode</label>
                  <input value={form.pincode} onChange={e => set('pincode', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="Pincode" />
                </div>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Credit Limit (Rs)</label>
                  <input type="number" value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Credit Days</label>
                  <input type="number" value={form.creditDays} onChange={e => set('creditDays', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" placeholder="0" />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600 mb-3">Opening Balance</p>
                <div className="flex gap-2 mb-3">
                  {['receivable', 'payable'].map(t => (
                    <button key={t} onClick={() => set('openingBalanceType', t)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize border ${form.openingBalanceType === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                      {t === 'receivable' ? 'To Receive (Dr)' : 'To Pay (Cr)'}
                    </button>
                  ))}
                </div>
                <input type="number" value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="0.00" />
                <p className="text-xs text-gray-400 mt-1">
                  {form.openingBalanceType === 'receivable' ? 'Party owes you this amount' : 'You owe this amount to party'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
          <div className="flex gap-2">
            {!editing && (
              <button onClick={() => handleSave(true)} disabled={saving}
                className="border border-teal-600 text-teal-700 px-5 py-2 rounded-lg text-sm hover:bg-teal-50 disabled:opacity-50">
                Save & New
              </button>
            )}
            <button onClick={() => handleSave(false)} disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
