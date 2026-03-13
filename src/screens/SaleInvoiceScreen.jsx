import { useEffect, useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { partyOps, itemOps, invoiceOps } from '../db'

const GST_RATES = [0, 5, 12, 18, 28]
const todayStr = () => new Date().toISOString().split('T')[0]

function LineItem({ line, index, allItems, onChange, onRemove }) {
  const amount = (line.qty || 0) * (line.rate || 0)
  const gstRate = Number(line.gst || 0)
  const taxAmt = (amount * gstRate) / 100
  const total = amount + taxAmt

  return (
    <tr className="border-b border-gray-100">
      <td className="px-3 py-2 text-xs text-gray-400">{index + 1}</td>
      <td className="px-3 py-2">
        <select value={line.itemId || ''} onChange={e => {
          const it = allItems.find(i => i.id === Number(e.target.value))
          if (it) onChange({ ...line, itemId: it.id, name: it.name, rate: it.salePrice, unit: it.unit, gst: String(it.gst) })
          else onChange({ ...line, itemId: '', name: '' })
        }} className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-teal-400 bg-white">
          <option value="">Select item</option>
          {allItems.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
        </select>
        {!line.itemId && (
          <input value={line.name || ''} onChange={e => onChange({ ...line, name: e.target.value })}
            className="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-teal-400"
            placeholder="Or type item name" />
        )}
      </td>
      <td className="px-3 py-2">
        <input type="number" value={line.qty || ''} onChange={e => onChange({ ...line, qty: Number(e.target.value) })}
          className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:border-teal-400" placeholder="1" />
      </td>
      <td className="px-3 py-2 text-xs text-gray-500">{line.unit || 'Nos'}</td>
      <td className="px-3 py-2">
        <input type="number" value={line.rate || ''} onChange={e => onChange({ ...line, rate: Number(e.target.value) })}
          className="w-24 border border-gray-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:border-teal-400" placeholder="0.00" />
      </td>
      <td className="px-3 py-2">
        <select value={String(line.gst || '18')} onChange={e => onChange({ ...line, gst: e.target.value })}
          className="w-16 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-teal-400 bg-white">
          {GST_RATES.map(g => <option key={g} value={g}>{g}%</option>)}
        </select>
      </td>
      <td className="px-3 py-2 text-xs text-right text-gray-600">
        {taxAmt > 0 ? taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-right font-medium text-gray-800">
        {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-3 py-2 text-center">
        <button onClick={onRemove} className="text-gray-300 hover:text-red-500">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}

export default function SaleInvoiceScreen({ onNavigate, invoiceType = 'sale' }) {
  const [parties, setParties] = useState([])
  const [allItems, setAllItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [lines, setLines] = useState([{ itemId: '', name: '', qty: 1, rate: '', unit: 'Nos', gst: '18' }])
  const [form, setForm] = useState({
    partyId: '',
    partyName: '',
    date: todayStr(),
    dueDate: '',
    notes: '',
    discount: '',
    payNow: '',
    payMode: 'cash',
    sameState: true,
  })

  const isale = invoiceType === 'sale'

  useEffect(() => {
    Promise.all([partyOps.getAll(), itemOps.getAll()]).then(([p, i]) => {
      setParties(p)
      setAllItems(i)
    })
  }, [])

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const updateLine = (i, val) => setLines(ls => ls.map((l, idx) => idx === i ? val : l))
  const removeLine = (i) => setLines(ls => ls.filter((_, idx) => idx !== i))
  const addLine = () => setLines(ls => [...ls, { itemId: '', name: '', qty: 1, rate: '', unit: 'Nos', gst: '18' }])

  const subtotal = lines.reduce((s, l) => s + (l.qty || 0) * (l.rate || 0), 0)
  const totalTax = lines.reduce((s, l) => {
    const amt = (l.qty || 0) * (l.rate || 0)
    return s + (amt * Number(l.gst || 0)) / 100
  }, 0)
  const discount = Number(form.discount || 0)
  const total = subtotal + totalTax - discount
  const payNow = Number(form.payNow || 0)
  const balance = total - payNow

  const handleSave = async () => {
    if (!form.partyId && !form.partyName.trim()) { alert('Please select or enter a party'); return }
    const validLines = lines.filter(l => l.name || l.itemId)
    if (validLines.length === 0) { alert('Add at least one item'); return }

    setSaving(true)
    try {
      await invoiceOps.add({
        type: invoiceType,
        partyId: form.partyId ? Number(form.partyId) : null,
        partyName: form.partyName,
        date: form.date,
        dueDate: form.dueDate,
        notes: form.notes,
        items: validLines.map(l => ({
          itemId: l.itemId || null,
          name: l.name || allItems.find(i => i.id === l.itemId)?.name || '',
          qty: Number(l.qty || 1),
          rate: Number(l.rate || 0),
          unit: l.unit || 'Nos',
          gst: l.gst || '0',
          amount: (l.qty || 0) * (l.rate || 0),
        })),
        subtotal,
        totalTax,
        discount,
        total,
        payNow: payNow > 0 ? payNow : 0,
        payMode: form.payMode,
        sameState: form.sameState,
      })
      onNavigate(isale ? 'sale-list' : 'purchase-list')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate(isale ? 'sale-list' : 'purchase-list')}
            className="text-gray-400 hover:text-gray-700 text-sm">← Back</button>
          <h1 className="text-base font-semibold text-gray-800">{isale ? 'New Sale Invoice' : 'New Purchase Invoice'}</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-5">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{isale ? 'Customer' : 'Supplier'} *</label>
                <select value={form.partyId} onChange={e => {
                  const p = parties.find(x => x.id === Number(e.target.value))
                  setF('partyId', e.target.value)
                  setF('partyName', p?.name || '')
                }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                  <option value="">-- Select {isale ? 'Customer' : 'Supplier'} --</option>
                  {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {!form.partyId && (
                  <input value={form.partyName} onChange={e => setF('partyName', e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400"
                    placeholder="Or type party name" />
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Invoice Date</label>
                <input type="date" value={form.date} onChange={e => setF('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Items</p>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={form.sameState} onChange={e => setF('sameState', e.target.checked)} className="rounded" />
                Same State (CGST + SGST)
              </label>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-left w-8">#</th>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-left">Item</th>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-right">Qty</th>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-left">Unit</th>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-right">Rate (Rs)</th>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-center">GST</th>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-right">Tax</th>
                  <th className="px-3 py-2 text-xs text-gray-500 font-medium text-right">Total</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <LineItem key={i} line={line} index={i} allItems={allItems}
                    onChange={val => updateLine(i, val)}
                    onRemove={() => removeLine(i)} />
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100">
              <button onClick={addLine}
                className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium">
                <PlusIcon className="w-4 h-4" /> Add Row
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes / Terms</label>
                <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
                  placeholder="Payment terms, notes..." />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Discount (Rs)</label>
                <input type="number" value={form.discount} onChange={e => setF('discount', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  placeholder="0.00" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {form.sameState ? (
                  <>
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>CGST</span>
                      <span>Rs {(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>SGST</span>
                      <span>Rs {(totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>IGST</span>
                    <span>Rs {totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Discount</span>
                    <span>- Rs {discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-200 pt-2 mt-1">
                  <span>Total</span>
                  <span>Rs {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs font-medium text-gray-600">Payment Received Now</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={form.payNow} onChange={e => setF('payNow', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                    placeholder="0.00" />
                  <select value={form.payMode} onChange={e => setF('payMode', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-400">
                    {['cash', 'bank', 'upi', 'cheque', 'card'].map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className={`flex justify-between text-sm font-semibold pt-1 ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <span>Balance Due</span>
                  <span>Rs {Math.max(0, balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
