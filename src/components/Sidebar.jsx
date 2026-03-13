import { useState } from 'react'
import {
  HomeIcon, UsersIcon, CubeIcon, ShoppingCartIcon,
  TruckIcon, ChartBarIcon, BanknotesIcon, DocumentChartBarIcon,
  CloudArrowUpIcon, Cog6ToothIcon,
  StarIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon,
  PlusIcon, ChevronRightIcon
} from '@heroicons/react/24/outline'

const NAV_SECTIONS = [
  {
    section: null,
    items: [
      { id: 'home', label: 'Dashboard', icon: HomeIcon },
    ]
  },
  {
    section: 'TRANSACTIONS',
    items: [
      {
        id: 'parties', label: 'Customers & Suppliers', icon: UsersIcon, expandable: true,
        children: [
          { id: 'party-details', label: 'All Parties', hasAdd: true },
          { id: 'whatsapp-connect', label: 'WhatsApp Connect' },
        ]
      },
      { id: 'items', label: 'My Products', icon: CubeIcon, hasAdd: true },
      {
        id: 'sale', label: 'Sales', icon: ShoppingCartIcon, expandable: true,
        children: [
          { id: 'sale-list', label: 'Sale Invoices' },
          { id: 'payment-in', label: 'Payment Received' },
          { id: 'sale-return', label: 'Sale Returns' },
          { id: 'estimate', label: 'Estimates / Quotations' },
          { id: 'sale-order', label: 'Sale Orders' },
          { id: 'delivery-challan', label: 'Delivery Challan' },
          { id: 'pos-billing', label: 'POS Billing' },
        ]
      },
      {
        id: 'purchase', label: 'Purchases & Expenses', icon: TruckIcon, expandable: true,
        children: [
          { id: 'purchase-list', label: 'Purchase Invoices' },
          { id: 'payment-out', label: 'Payments Made' },
          { id: 'purchase-return', label: 'Purchase Returns' },
          { id: 'expense', label: 'Expenses' },
        ]
      },
      {
        id: 'cash-bank', label: 'Cash & Bank', icon: BanknotesIcon, expandable: true,
        children: [
          { id: 'cash-account', label: 'Cash Account' },
          { id: 'bank-account', label: 'Bank Account' },
        ]
      },
    ]
  },
  {
    section: 'REPORTS & MORE',
    items: [
      { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon },
      {
        id: 'grow', label: 'Grow Your Business', icon: ChartBarIcon, expandable: true,
        children: [
          { id: 'online-store', label: 'Online Store' },
        ]
      },
      {
        id: 'sync', label: 'Sync & Backup', icon: CloudArrowUpIcon, expandable: true,
        children: [
          { id: 'backup', label: 'Backup Data' },
        ]
      },
    ]
  },
  {
    section: 'SETTINGS',
    items: [
      { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
      { id: 'plans', label: 'Plans & Pricing', icon: StarIcon },
    ]
  },
]

export default function Sidebar({ activeScreen, onNavigate, businessName = 'My Business' }) {
  const [expanded, setExpanded] = useState({ parties: true, sale: true })

  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }))

  return (
    <div className="w-56 bg-[#1a1a35] flex flex-col h-full shrink-0">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <button className="w-full flex items-center gap-2 bg-[#252545] text-gray-400 text-xs px-3 py-2 rounded-lg hover:bg-[#2e2e52] transition-colors border border-[#2e2e52]">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Quick search…</span>
          <span className="text-[10px] text-gray-600 font-mono">⌘F</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section || '__top'}>
            {section && (
              <p className="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-gray-600 uppercase">
                {section}
              </p>
            )}
            {items.map(item => {
              const Icon = item.icon
              const isActive = activeScreen === item.id
              const isOpen = expanded[item.id]
              return (
                <div key={item.id}>
                  <button
                    onClick={() => item.expandable ? toggle(item.id) : onNavigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 mx-1.5 text-left text-sm transition-all rounded-lg ${
                      isActive
                        ? 'bg-teal-600/20 text-teal-300 font-medium'
                        : 'text-gray-400 hover:bg-[#252545] hover:text-gray-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                    <span className="flex-1 leading-tight text-[13px]">{item.label}</span>
                    {item.hasAdd && (
                      <PlusIcon
                        className="w-3.5 h-3.5 text-gray-500 hover:text-teal-400"
                        onClick={e => { e.stopPropagation(); onNavigate(item.id) }}
                      />
                    )}
                    {item.expandable && (
                      isOpen
                        ? <ChevronUpIcon className="w-3 h-3 text-gray-600" />
                        : <ChevronDownIcon className="w-3 h-3 text-gray-600" />
                    )}
                  </button>
                  {item.expandable && isOpen && (item.children ?? []).map(child => (
                    <button
                      key={child.id}
                      onClick={() => onNavigate(child.id)}
                      className={`w-full flex items-center gap-2 pl-10 pr-3 py-1.5 text-left text-[12.5px] transition-colors ${
                        activeScreen === child.id
                          ? 'text-teal-300 font-medium'
                          : 'text-gray-500 hover:text-gray-200'
                      }`}
                    >
                      {activeScreen === child.id && (
                        <span className="w-1 h-1 rounded-full bg-teal-400 shrink-0 -ml-3 mr-2" />
                      )}
                      <span className="flex-1">{child.label}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade CTA */}
      <div className="mx-3 mb-3 bg-gradient-to-br from-[#1e3a5f] to-[#1a2e4a] rounded-xl p-3 border border-blue-900/50">
        <p className="text-yellow-400 text-xs font-semibold mb-0.5">Free Plan Active</p>
        <p className="text-gray-500 text-[11px] mb-2">Unlock unlimited invoices & reports</p>
        <button onClick={() => onNavigate('plans')}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5">
          Upgrade to Pro
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Business selector */}
      <button onClick={() => onNavigate('settings')}
        className="flex items-center gap-2.5 px-4 py-3 border-t border-[#252545] hover:bg-[#252545] transition-colors">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
          {businessName[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-gray-300 text-xs font-medium truncate">{businessName}</p>
          <p className="text-gray-600 text-[10px]">My Business</p>
        </div>
        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-600 shrink-0" />
      </button>
    </div>
  )
}
