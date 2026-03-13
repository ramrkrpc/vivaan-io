import { useState } from 'react'
import {
  HomeIcon, UsersIcon, CubeIcon, ShoppingCartIcon,
  TruckIcon, ChartBarIcon, BanknotesIcon, DocumentChartBarIcon,
  CloudArrowUpIcon, WrenchScrewdriverIcon, Cog6ToothIcon,
  StarIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon,
  PlusIcon, ChevronRightIcon
} from '@heroicons/react/24/outline'

const NAV = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  {
    id: 'parties', label: 'Parties', icon: UsersIcon, expandable: true,
    children: [
      { id: 'party-details', label: 'Party Details', hasAdd: true },
      { id: 'whatsapp-connect', label: 'Whatsapp Connect' },
    ]
  },
  { id: 'items', label: 'Items', icon: CubeIcon, hasAdd: true },
  {
    id: 'sale', label: 'Sale', icon: ShoppingCartIcon, expandable: true,
    children: [
      { id: 'sale-list', label: 'Sale Invoice' },
      { id: 'payment-in', label: 'Payment In' },
      { id: 'sale-return', label: 'Sale Return' },
      { id: 'estimate', label: 'Estimate / Quotation' },
      { id: 'sale-order', label: 'Sale Order' },
      { id: 'delivery-challan', label: 'Delivery Challan' },
      { id: 'pos-billing', label: 'POS Billing' },
    ]
  },
  {
    id: 'purchase', label: 'Purchase & Expense', icon: TruckIcon, expandable: true,
    children: [
      { id: 'purchase-list', label: 'Purchase Invoice' },
      { id: 'payment-out', label: 'Payment Out' },
      { id: 'purchase-return', label: 'Purchase Return' },
      { id: 'expense', label: 'Expense' },
    ]
  },
  {
    id: 'cash-bank', label: 'Cash & Bank', icon: BanknotesIcon, expandable: true,
    children: [
      { id: 'cash-account', label: 'Cash Account' },
      { id: 'bank-account', label: 'Bank Account' },
    ]
  },
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
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  { id: 'plans', label: 'Plans & Pricing', icon: StarIcon },
]

export default function Sidebar({ activeScreen, onNavigate, businessName = 'My Business' }) {
  const [expanded, setExpanded] = useState({ parties: true, sale: true })

  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }))

  return (
    <div className="w-52 bg-[#1c1c3b] flex flex-col h-full shrink-0">
      {/* Search */}
      <div className="px-2 pt-2 pb-1">
        <button className="w-full flex items-center gap-2 bg-[#2a2a50] text-gray-300 text-xs px-3 py-2 rounded hover:bg-[#333360] transition-colors">
          <MagnifyingGlassIcon className="w-3.5 h-3.5" />
          Open Anything (Ctrl+F)
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {NAV.map(item => {
          const Icon = item.icon
          const isActive = activeScreen === item.id
          const isOpen = expanded[item.id]
          return (
            <div key={item.id}>
              <button
                onClick={() => item.expandable ? toggle(item.id) : onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  isActive ? 'bg-[#2e2e50] text-white' : 'text-gray-300 hover:bg-[#2a2a4a] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 leading-tight">{item.label}</span>
                {item.hasAdd && <PlusIcon className="w-3.5 h-3.5 text-gray-400" onClick={e => { e.stopPropagation(); onNavigate(item.id) }} />}
                {item.expandable && (isOpen ? <ChevronUpIcon className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />)}
              </button>
              {item.expandable && isOpen && (item.children ?? []).map(child => (
                <button
                  key={child.id}
                  onClick={() => onNavigate(child.id)}
                  className={`w-full flex items-center gap-2 pl-9 pr-3 py-1.5 text-left text-sm transition-colors ${
                    activeScreen === child.id ? 'bg-[#2e2e50] text-white' : 'text-gray-400 hover:bg-[#2a2a4a] hover:text-gray-200'
                  }`}
                >
                  <span className="flex-1">{child.label}</span>
                </button>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Trial / CTA */}
      <div className="mx-2 mb-2 bg-[#2a2a4a] rounded-lg p-3">
        <p className="text-yellow-400 text-xs font-semibold mb-1">✨ Free Plan Active</p>
        <div className="w-full bg-[#444] rounded-full h-1.5 mb-2">
          <div className="bg-teal-400 h-1.5 rounded-full w-1/4" />
        </div>
        <button onClick={() => onNavigate('plans')}
          className="w-full flex items-center justify-between bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-all">
          <span>⭐ Upgrade to Pro</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Business */}
      <button onClick={() => onNavigate('settings')}
        className="flex items-center gap-2 px-3 py-2.5 border-t border-[#2a2a4a] hover:bg-[#2a2a4a] transition-colors">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
          {businessName[0]?.toUpperCase()}
        </div>
        <span className="text-gray-300 text-sm flex-1 text-left truncate">{businessName}</span>
        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500" />
      </button>
    </div>
  )
}
