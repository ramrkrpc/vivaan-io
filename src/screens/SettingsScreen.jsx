import { useEffect, useState } from 'react'
import { settingsOps } from '../db'

export default function SettingsScreen() {
  const [form, setForm] = useState({
    businessName: '', ownerName: '', phone: '', email: '',
    gstin: '', address: '', city: '', state: '', pincode: '',
    currency: 'INR', financialYear: 'April-March', invoicePrefix: 'VIV',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    settingsOps.getAll().then(s => {
      if (s.business) setForm(f => ({ ...f, ...s.business }))
    })
  }, [])

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsOps.set('business', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-lg font-bold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Configure your business profile</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 md:px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 md:p-5">
        <div className="max-w-2xl space-y-3 md:space-y-4">

          {/* Business Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Business Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                { label: 'Business Name',   key: 'businessName',   placeholder: 'Your Business Name' },
                { label: 'Owner Name',      key: 'ownerName',      placeholder: 'Owner / Proprietor' },
                { label: 'Phone',           key: 'phone',          placeholder: '+91 XXXXX XXXXX' },
                { label: 'Email',           key: 'email',          placeholder: 'contact@yourbusiness.com' },
                { label: 'GSTIN',           key: 'gstin',          placeholder: '22AAAAA0000A1Z5' },
                { label: 'Invoice Prefix',  key: 'invoicePrefix',  placeholder: 'VIV' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setF(f.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                    placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Address</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Street Address</label>
                <textarea value={form.address} onChange={e => setF('address', e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none"
                  placeholder="Street address" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: 'City', key: 'city' }, { label: 'State', key: 'state' }, { label: 'Pincode', key: 'pincode' }].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input value={form[f.key]} onChange={e => setF(f.key, e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                      placeholder={f.label} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Preferences</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Currency</label>
                <select value={form.currency} onChange={e => setF('currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Financial Year</label>
                <select value={form.financialYear} onChange={e => setF('financialYear', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-teal-400">
                  <option>April-March</option>
                  <option>January-December</option>
                </select>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
            <p className="text-sm font-semibold text-gray-700 mb-1">About Vivaan.io</p>
            <p className="text-xs text-gray-400 mb-3">MVP Accounting Software · Powered by IndexedDB</p>
            <div className="flex gap-2 flex-wrap">
              {[['v1.0.0-mvp','teal'],['React 18','blue'],['Vite','purple'],['IndexedDB','orange']].map(([label, color]) => (
                <span key={label} className={`bg-${color}-50 text-${color}-700 text-xs px-2 py-1 rounded-lg font-medium`}>{label}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
