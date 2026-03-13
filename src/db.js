import { openDB } from 'idb'

const DB_NAME    = 'vivaan-db'
const DB_VERSION = 2          // bumped to 2 to add expenses store

let _db = null

const getDB = async () => {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion) {
      // ── V1 stores (idempotent contains-checks for safety) ────────────────
      if (!database.objectStoreNames.contains('parties')) {
        const s = database.createObjectStore('parties', { keyPath: 'id', autoIncrement: true })
        s.createIndex('byName', 'name')
        s.createIndex('byType', 'type')
      }
      if (!database.objectStoreNames.contains('items')) {
        const s = database.createObjectStore('items', { keyPath: 'id', autoIncrement: true })
        s.createIndex('byName', 'name')
      }
      if (!database.objectStoreNames.contains('invoices')) {
        const s = database.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true })
        s.createIndex('byType',   'type')
        s.createIndex('byParty',  'partyId')
        s.createIndex('byDate',   'date')
        s.createIndex('byStatus', 'status')
      }
      if (!database.objectStoreNames.contains('payments')) {
        const s = database.createObjectStore('payments', { keyPath: 'id', autoIncrement: true })
        s.createIndex('byInvoice', 'invoiceId')
        s.createIndex('byParty',   'partyId')
        s.createIndex('byType',    'type')
      }
      if (!database.objectStoreNames.contains('counters')) {
        database.createObjectStore('counters', { keyPath: 'key' })
      }
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' })
      }
      // ── V2 stores ─────────────────────────────────────────────────────────
      if (!database.objectStoreNames.contains('expenses')) {
        const s = database.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true })
        s.createIndex('byDate',     'date')
        s.createIndex('byCategory', 'category')
      }
    }
  })
  return _db
}

async function nextCounter(key) {
  const d = await getDB()
  const tx = d.transaction('counters', 'readwrite')
  const store = tx.objectStore('counters')
  const rec = await store.get(key)
  const next = (rec?.value ?? 0) + 1
  await store.put({ key, value: next })
  await tx.done
  return next
}

// ─── PARTIES ────────────────────────────────────────────────────────────────

export const partyOps = {
  async getAll() {
    const d = await getDB()
    const [all, invs, pays] = await Promise.all([
      d.getAll('parties'),
      d.getAll('invoices'),
      d.getAll('payments'),
    ])
    return all.map(p => {
      const saleTotal     = invs.filter(i => i.type === 'sale'     && i.partyId === p.id).reduce((s, i) => s + i.total, 0)
      const purchaseTotal = invs.filter(i => i.type === 'purchase' && i.partyId === p.id).reduce((s, i) => s + i.total, 0)
      const payIn         = pays.filter(py => py.type === 'in'  && py.partyId === p.id).reduce((s, py) => s + py.amount, 0)
      const payOut        = pays.filter(py => py.type === 'out' && py.partyId === p.id).reduce((s, py) => s + py.amount, 0)
      const receivable    = saleTotal     - payIn  + (p.openingBalance > 0 ? p.openingBalance : 0)
      const payable       = purchaseTotal - payOut + (p.openingBalance < 0 ? Math.abs(p.openingBalance) : 0)
      return { ...p, receivable, payable }
    })
  },
  async get(id)     { const d = await getDB(); return d.get('parties', id) },
  async add(p)      { const d = await getDB(); return d.add('parties', { ...p, createdAt: Date.now() }) },
  async update(p)   { const d = await getDB(); return d.put('parties', p) },
  async delete(id)  { const d = await getDB(); return d.delete('parties', id) },
}

// ─── ITEMS ───────────────────────────────────────────────────────────────────

export const itemOps = {
  async getAll() {
    const d = await getDB()
    const [all, invs] = await Promise.all([d.getAll('items'), d.getAll('invoices')])
    return all.map(item => {
      const sold     = invs.filter(i => i.type === 'sale')    .flatMap(i => i.items ?? [])
                           .filter(li => li.itemId === item.id).reduce((s, li) => s + Number(li.qty), 0)
      const purchased = invs.filter(i => i.type === 'purchase').flatMap(i => i.items ?? [])
                            .filter(li => li.itemId === item.id).reduce((s, li) => s + Number(li.qty), 0)
      return { ...item, currentStock: (item.openingStock ?? 0) + purchased - sold }
    })
  },
  async get(id)    { const d = await getDB(); return d.get('items', id) },
  async add(item)  { const d = await getDB(); return d.add('items', { ...item, createdAt: Date.now() }) },
  async update(item) { const d = await getDB(); return d.put('items', item) },
  async delete(id) { const d = await getDB(); return d.delete('items', id) },
}

// ─── INVOICES ────────────────────────────────────────────────────────────────

async function recalcPaid(id) {
  const d = await getDB()
  const inv = await d.get('invoices', id)
  if (!inv) return
  const pays   = await d.getAll('payments')
  const paid   = pays.filter(p => p.invoiceId === id).reduce((s, p) => s + p.amount, 0)
  const balance = inv.total - paid
  const status  = balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
  return d.put('invoices', { ...inv, paid, balance, status })
}

export const invoiceOps = {
  async getAll(type) {
    const d = await getDB()
    const all = await d.getAll('invoices')
    return (type ? all.filter(i => i.type === type) : all)
      .sort((a, b) => b.createdAt - a.createdAt)
  },
  async get(id) { const d = await getDB(); return d.get('invoices', id) },
  async add(inv) {
    const d = await getDB()
    // Read invoice prefix from settings (falls back to default)
    const bizSettings  = await d.get('settings', 'business')
    const savedPrefix  = bizSettings?.value?.invoicePrefix?.trim()
    const defaultPrefix = inv.type === 'sale' ? 'VIV-S' : 'VIV-P'
    const prefix  = savedPrefix ? `${savedPrefix}-${inv.type === 'sale' ? 'S' : 'P'}` : defaultPrefix
    const n       = await nextCounter(`invoice_${inv.type}`)
    const invoiceNo = `${prefix}-${String(n).padStart(4, '0')}`
    const data    = {
      ...inv, invoiceNo,
      paid:    inv.payNow ?? 0,
      balance: inv.total - (inv.payNow ?? 0),
      status:  'unpaid',
      createdAt: Date.now(),
    }
    const id = await d.add('invoices', data)
    if ((inv.payNow ?? 0) > 0) {
      await d.add('payments', {
        type:      inv.type === 'sale' ? 'in' : 'out',
        partyId:   inv.partyId, partyName: inv.partyName,
        invoiceId: id, invoiceNo,
        amount:    inv.payNow, mode: inv.payMode ?? 'cash',
        date:      inv.date, notes: 'Payment at time of invoice',
        createdAt: Date.now()
      })
      await recalcPaid(id)
    }
    return id
  },
  async update(inv) { const d = await getDB(); return d.put('invoices', inv) },
  async delete(id)  { const d = await getDB(); return d.delete('invoices', id) },
  recalcPaid,
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export const paymentOps = {
  async getAll(type) {
    const d = await getDB()
    const all = await d.getAll('payments')
    return (type ? all.filter(p => p.type === type) : all)
      .sort((a, b) => b.createdAt - a.createdAt)
  },
  async getByParty(partyId) {
    const d = await getDB()
    return (await d.getAll('payments')).filter(p => p.partyId === partyId)
  },
  async add(pay) {
    const d = await getDB()
    const id = await d.add('payments', { ...pay, createdAt: Date.now() })
    if (pay.invoiceId) await recalcPaid(pay.invoiceId)
    return id
  },
}

// ─── EXPENSES ────────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  'Rent', 'Salary & Wages', 'Utilities', 'Travel & Conveyance',
  'Marketing & Advertising', 'Office Supplies', 'Repair & Maintenance',
  'Professional Fees', 'Bank Charges', 'Miscellaneous',
]

export const expenseOps = {
  async getAll() {
    const d = await getDB()
    return (await d.getAll('expenses')).sort((a, b) => b.createdAt - a.createdAt)
  },
  async add(exp)    { const d = await getDB(); return d.add('expenses', { ...exp, createdAt: Date.now() }) },
  async update(exp) { const d = await getDB(); return d.put('expenses', exp) },
  async delete(id)  { const d = await getDB(); return d.delete('expenses', id) },
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const settingsOps = {
  async get(key)         { const d = await getDB(); const r = await d.get('settings', key); return r?.value },
  async set(key, value)  { const d = await getDB(); return d.put('settings', { key, value }) },
  async getAll() {
    const d = await getDB()
    const all = await d.getAll('settings')
    return Object.fromEntries(all.map(r => [r.key, r.value]))
  }
}

// ─── BACKUP / RESTORE ────────────────────────────────────────────────────────

export const backupOps = {
  async exportAll() {
    const d = await getDB()
    const [parties, items, invoices, payments, expenses, settings] = await Promise.all([
      d.getAll('parties'), d.getAll('items'), d.getAll('invoices'),
      d.getAll('payments'), d.getAll('expenses'), d.getAll('settings'),
    ])
    return { version: 2, exportedAt: new Date().toISOString(), parties, items, invoices, payments, expenses, settings }
  },
  async importAll(data) {
    const d = await getDB()
    const stores = ['parties', 'items', 'invoices', 'payments', 'expenses', 'settings']
    for (const store of stores) {
      if (!data[store]) continue
      const tx = d.transaction(store, 'readwrite')
      await tx.objectStore(store).clear()
      for (const rec of data[store]) await tx.objectStore(store).put(rec)
      await tx.done
    }
    // Reset in-memory DB handle so next call re-opens
    _db = null
  }
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export const dashboardOps = {
  async getStats() {
    const d = await getDB()
    const [allInv, allPay, allParties, allItems] = await Promise.all([
      d.getAll('invoices'), d.getAll('payments'), d.getAll('parties'), d.getAll('items')
    ])
    const now        = new Date()
    const today      = now.toISOString().split('T')[0]
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const sales     = allInv.filter(i => i.type === 'sale')
    const purchases = allInv.filter(i => i.type === 'purchase')

    const todaySales       = sales.filter(i => i.date === today)     .reduce((s, i) => s + i.total, 0)
    const monthSales       = sales.filter(i => i.date >= monthStart) .reduce((s, i) => s + i.total, 0)
    const monthPurchases   = purchases.filter(i => i.date >= monthStart).reduce((s, i) => s + i.total, 0)
    const totalReceivable  = sales.filter(i => i.status !== 'paid')     .reduce((s, i) => s + (i.balance ?? i.total), 0)
    const totalPayable     = purchases.filter(i => i.status !== 'paid') .reduce((s, i) => s + (i.balance ?? i.total), 0)

    const cashIn      = allPay.filter(p => p.type === 'in') .reduce((s, p) => s + p.amount, 0)
    const cashOut     = allPay.filter(p => p.type === 'out').reduce((s, p) => s + p.amount, 0)
    const cashBalance = cashIn - cashOut

    // Overdue invoices (due date passed, not paid)
    const overdueInvoices = allInv.filter(i =>
      i.status !== 'paid' && i.dueDate && i.dueDate < today
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate))

    // Stock per item
    const stockMap = {}
    allItems.forEach(item => { stockMap[item.id] = item.openingStock ?? 0 })
    allInv.forEach(inv => {
      ;(inv.items ?? []).forEach(li => {
        if (stockMap[li.itemId] === undefined) stockMap[li.itemId] = 0
        if (inv.type === 'purchase') stockMap[li.itemId] += Number(li.qty)
        else                         stockMap[li.itemId] -= Number(li.qty)
      })
    })
    const lowStock = allItems
      .map(i => ({ ...i, currentStock: stockMap[i.id] ?? 0 }))
      .filter(i => i.currentStock <= (i.lowStockAlert ?? 5))

    const recent = [...allInv].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)

    // Monthly sales trend — last 6 months
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const dt    = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const start = dt.toISOString().split('T')[0]
      const end   = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).toISOString().split('T')[0]
      return {
        label:     dt.toLocaleDateString('en-IN', { month: 'short' }),
        sales:     sales.filter(iv => iv.date >= start && iv.date <= end).reduce((s, iv) => s + iv.total, 0),
        purchases: purchases.filter(iv => iv.date >= start && iv.date <= end).reduce((s, iv) => s + iv.total, 0),
      }
    })

    return {
      todaySales, monthSales, monthPurchases,
      totalReceivable, totalPayable, cashBalance,
      totalParties: allParties.length, totalItems: allItems.length,
      lowStock, recent, totalInvoices: allInv.length,
      overdueInvoices, monthlyTrend,
    }
  }
}
