import SaleInvoiceScreen from './SaleInvoiceScreen'

export default function PurchaseInvoiceScreen({ onNavigate }) {
  return <SaleInvoiceScreen onNavigate={onNavigate} invoiceType="purchase" />
}
