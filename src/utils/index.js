// ─── Currency formatting ───────────────────────────────────────────────────
export const formatCurrency = (num, opts = {}) =>
  (num ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  })

export const formatInr = (num) => `₹${formatCurrency(num)}`

// ─── Invoice status ────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  paid:    'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid:  'bg-red-100   text-red-700',
}

export const STATUS_LABELS = {
  paid:    'Paid',
  partial: 'Partial',
  unpaid:  'Unpaid',
}

// ─── Payment modes ─────────────────────────────────────────────────────────
export const PAYMENT_MODES = ['cash', 'bank', 'upi', 'cheque', 'card']

// ─── Date helpers ──────────────────────────────────────────────────────────
export const todayDate = () => new Date().toISOString().split('T')[0]
