import { useState, useEffect } from 'react'
import { settingsOps } from './db'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import MobileMoreDrawer from './components/MobileMoreDrawer'
import DashboardScreen from './screens/DashboardScreen'
import PartyDetailsScreen from './screens/PartyDetailsScreen'
import WhatsAppConnectScreen from './screens/WhatsAppConnectScreen'
import SaleInvoiceScreen from './screens/SaleInvoiceScreen'
import PurchaseInvoiceScreen from './screens/PurchaseInvoiceScreen'
import SaleListScreen from './screens/SaleListScreen'
import PurchaseListScreen from './screens/PurchaseListScreen'
import PaymentInScreen from './screens/PaymentInScreen'
import PaymentOutScreen from './screens/PaymentOutScreen'
import ItemsScreen from './screens/ItemsScreen'
import ReportsScreen from './screens/ReportsScreen'
import SettingsScreen from './screens/SettingsScreen'
import ExpenseScreen from './screens/ExpenseScreen'
import BackupScreen from './screens/BackupScreen'
import PlaceholderScreen from './screens/PlaceholderScreen'
import './index.css'

export default function App() {
  const [activeScreen, setActiveScreen]   = useState('home')
  const [showMoreDrawer, setShowMoreDrawer] = useState(false)
  const [businessName, setBusinessName]   = useState('My Business')

  useEffect(() => {
    settingsOps.get('business').then(b => { if (b?.businessName) setBusinessName(b.businessName) })
  }, [])

  const navigate = (screen) => {
    if (screen === '__more__') { setShowMoreDrawer(true); return }
    setShowMoreDrawer(false)
    setActiveScreen(screen)
    // Refresh business name when leaving settings
    if (activeScreen === 'settings') {
      settingsOps.get('business').then(b => { if (b?.businessName) setBusinessName(b.businessName) })
    }
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
      case 'dashboard':
        return <DashboardScreen onNavigate={navigate} />
      case 'party-details':
        return <PartyDetailsScreen onNavigate={navigate} />
      case 'items':
        return <ItemsScreen onNavigate={navigate} />
      case 'sale-invoice-new':
        return <SaleInvoiceScreen onNavigate={navigate} invoiceType="sale" />
      case 'purchase-invoice-new':
        return <PurchaseInvoiceScreen onNavigate={navigate} />
      case 'sale-list':
        return <SaleListScreen onNavigate={navigate} />
      case 'purchase-list':
        return <PurchaseListScreen onNavigate={navigate} />
      case 'payment-in':
        return <PaymentInScreen onNavigate={navigate} />
      case 'payment-out':
        return <PaymentOutScreen onNavigate={navigate} />
      case 'reports':
        return <ReportsScreen onNavigate={navigate} />
      case 'settings':
        return <SettingsScreen />
      case 'whatsapp-connect':
        return <WhatsAppConnectScreen />
      case 'vyapar-network':
        return <PlaceholderScreen title="Vivaan Network" icon="🌐" description="Connect with other businesses to grow your network." buttonLabel="Explore Network" />
      case 'sale-return':
        return <PlaceholderScreen title="Sale Return" icon="↩️" description="Manage sales returns and credit notes." buttonLabel="Add Sale Return" />
      case 'estimate':
        return <PlaceholderScreen title="Estimate / Quotation" icon="📝" description="Create estimates and quotations for customers." buttonLabel="Create Estimate" />
      case 'sale-order':
        return <PlaceholderScreen title="Sale Order" icon="📋" description="Manage sale orders from your customers." buttonLabel="Create Sale Order" />
      case 'delivery-challan':
        return <PlaceholderScreen title="Delivery Challan" icon="🚚" description="Create and manage delivery challans." buttonLabel="Create Challan" />
      case 'pos-billing':
        return <PlaceholderScreen title="POS Billing" icon="🖥️" description="Point of Sale billing for quick transactions." buttonLabel="Start POS" />
      case 'purchase-return':
        return <PlaceholderScreen title="Purchase Return" icon="↩️" description="Manage purchase returns and debit notes." buttonLabel="Add Purchase Return" />
      case 'purchase-order':
        return <PlaceholderScreen title="Purchase Order" icon="📦" description="Create and manage purchase orders." buttonLabel="Create Purchase Order" />
      case 'expense':
        return <ExpenseScreen onNavigate={navigate} />
      case 'online-store':
        return <PlaceholderScreen title="Online Store" icon="🛍️" description="Set up your online store and start selling." buttonLabel="Setup Store" />
      case 'loyalty':
        return <PlaceholderScreen title="Loyalty Program" icon="⭐" description="Reward your loyal customers." buttonLabel="Setup Loyalty" />
      case 'cash-account':
        return <PlaceholderScreen title="Cash Account" icon="💵" description="Manage your cash transactions." buttonLabel="Add Transaction" />
      case 'bank-account':
        return <PlaceholderScreen title="Bank Account" icon="🏦" description="Manage your bank accounts and transactions." buttonLabel="Add Bank Account" />
      case 'cheque':
        return <PlaceholderScreen title="Cheque" icon="📜" description="Manage cheque transactions." buttonLabel="Add Cheque" />
      case 'sync-data':
        return <PlaceholderScreen title="Sync Data" icon="🔄" description="Sync your data across devices." buttonLabel="Sync Now" />
      case 'backup':
        return <BackupScreen />
      case 'godown':
        return <PlaceholderScreen title="Godown" icon="🏭" description="Manage multiple warehouses/godowns." buttonLabel="Add Godown" />
      case 'price-list':
        return <PlaceholderScreen title="Price List" icon="🏷️" description="Create and manage price lists for different customers." buttonLabel="Create Price List" />
      case 'plans':
        return <PlaceholderScreen title="Plans & Pricing" icon="👑" description="Upgrade to Vivaan.io Premium to unlock all features." buttonLabel="View Premium Plans" />
      default:
        return <DashboardScreen onNavigate={navigate} />
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile, visible on md+ */}
        <div className="hidden md:flex">
          <Sidebar activeScreen={activeScreen} onNavigate={navigate} businessName={businessName} />
        </div>
        {/* Main content — extra bottom padding on mobile for BottomNav */}
        <main className="flex-1 overflow-hidden pb-14 md:pb-0">
          {renderScreen()}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav activeScreen={activeScreen} onNavigate={navigate} />

      {/* Mobile "More" drawer */}
      {showMoreDrawer && (
        <MobileMoreDrawer
          onClose={() => setShowMoreDrawer(false)}
          onNavigate={navigate}
        />
      )}
    </div>
  )
}
