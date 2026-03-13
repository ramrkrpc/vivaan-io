import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  CubeIcon, DocumentChartBarIcon, Cog6ToothIcon, StarIcon,
  BanknotesIcon, CloudArrowUpIcon, ChartBarIcon, CurrencyRupeeIcon,
  ReceiptRefundIcon, ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

const MORE_SECTIONS = [
  {
    section: 'INVENTORY & MONEY',
    items: [
      { id: 'items',        label: 'My Products',     icon: CubeIcon,                  desc: 'Manage your inventory' },
      { id: 'cash-account', label: 'Cash Account',    icon: BanknotesIcon,             desc: 'Track cash transactions' },
      { id: 'bank-account', label: 'Bank Account',    icon: BanknotesIcon,             desc: 'Manage bank accounts' },
    ],
  },
  {
    section: 'PAYMENTS',
    items: [
      { id: 'payment-in',   label: 'Payment Received', icon: CurrencyRupeeIcon,        desc: 'Received from customers' },
      { id: 'payment-out',  label: 'Payments Made',    icon: ReceiptRefundIcon,        desc: 'Paid to suppliers' },
      { id: 'expense',      label: 'Expenses',         icon: ClipboardDocumentListIcon, desc: 'Track business expenses' },
    ],
  },
  {
    section: 'REPORTS & GROW',
    items: [
      { id: 'reports',      label: 'Reports',          icon: DocumentChartBarIcon,      desc: 'Business reports & insights' },
      { id: 'online-store', label: 'Online Store',     icon: ChartBarIcon,              desc: 'Sell online' },
      { id: 'backup',       label: 'Sync & Backup',    icon: CloudArrowUpIcon,          desc: 'Backup your data' },
    ],
  },
  {
    section: 'SETTINGS',
    items: [
      { id: 'settings',     label: 'Settings',         icon: Cog6ToothIcon,             desc: 'App preferences' },
      { id: 'plans',        label: 'Plans & Pricing',  icon: StarIcon,                  desc: 'Upgrade to Pro' },
    ],
  },
]

export default function MobileMoreDrawer({ onClose, onNavigate }) {
  const go = (id) => { onNavigate(id); onClose() }

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[82vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <p className="font-bold text-gray-900 text-base">More</p>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 pb-8">
          {MORE_SECTIONS.map(({ section, items }) => (
            <div key={section} className="mb-4">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase px-2 mb-1">
                {section}
              </p>
              <div className="space-y-0.5">
                {items.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
