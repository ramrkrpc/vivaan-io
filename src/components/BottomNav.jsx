import {
  HomeIcon, ShoppingCartIcon, TruckIcon, UsersIcon, Bars3Icon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ShoppingCartIcon as CartSolid,
  TruckIcon as TruckSolid,
  UsersIcon as UsersSolid,
  Bars3Icon as BarsSolid,
} from '@heroicons/react/24/solid'

const TABS = [
  { id: 'home',          label: 'Home',      Out: HomeIcon,         Solid: HomeIconSolid },
  { id: 'sale-list',     label: 'Sales',     Out: ShoppingCartIcon, Solid: CartSolid },
  { id: 'purchase-list', label: 'Buys',      Out: TruckIcon,        Solid: TruckSolid },
  { id: 'party-details', label: 'Parties',   Out: UsersIcon,        Solid: UsersSolid },
  { id: '__more__',      label: 'More',      Out: Bars3Icon,        Solid: BarsSolid },
]

const SALE_IDS     = new Set(['sale-list','sale-invoice-new','payment-in','sale-return','estimate','sale-order','delivery-challan','pos-billing'])
const PURCHASE_IDS = new Set(['purchase-list','purchase-invoice-new','payment-out','purchase-return','purchase-order','expense'])
const PARTY_IDS    = new Set(['party-details','whatsapp-connect'])

function getActiveTab(screen) {
  if (screen === 'home' || screen === 'dashboard') return 'home'
  if (SALE_IDS.has(screen))     return 'sale-list'
  if (PURCHASE_IDS.has(screen)) return 'purchase-list'
  if (PARTY_IDS.has(screen))    return 'party-details'
  return '__more__'
}

export default function BottomNav({ activeScreen, onNavigate }) {
  const activeTab = getActiveTab(activeScreen)

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-14">
        {TABS.map(({ id, label, Out, Solid }) => {
          const active = activeTab === id
          const Icon   = active ? Solid : Out
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors select-none
                ${active ? 'text-teal-600' : 'text-gray-400 active:bg-gray-50'}`}
            >
              <Icon className="w-6 h-6" />
              <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
