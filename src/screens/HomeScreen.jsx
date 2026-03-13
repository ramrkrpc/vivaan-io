import { useState } from 'react'

const INDIAN_STATES = [
  'Andaman & Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar',
  'Chandigarh','Chhattisgarh','Dadra & Nagar Haveli','Daman & Diu','Delhi',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand',
  'Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'
]

function TaxInvoicePreview({ customerName, invoiceAmount }) {
  return (
    <div className="bg-white border border-gray-200 rounded text-xs">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <span className="font-semibold text-gray-700">Tax Invoice</span>
        <span className="bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded font-semibold">Sample Invoice</span>
      </div>
      <div className="p-3">
        <h3 className="text-center font-bold text-sm text-gray-800 mb-3">TAX INVOICE</h3>
        <div className="flex justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-700 text-[11px]">Bill To</p>
            <p className="text-gray-400 text-[10px]">{customerName || 'Your Customer Name'}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-700 text-[11px]">Invoice Details</p>
            <p className="text-gray-500 text-[10px]">Invoice No. #1</p>
            <p className="text-gray-500 text-[10px]">Date : 13-03-2026</p>
          </div>
        </div>
        <table className="w-full text-[10px] border-collapse mb-2">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-1 text-left">#</th>
              <th className="p-1 text-left">Item name</th>
              <th className="p-1 text-right">Qty</th>
              <th className="p-1 text-right">Price/Unit</th>
              <th className="p-1 text-right">GST</th>
              <th className="p-1 text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="p-1 text-gray-400">1</td>
              <td className="p-1 text-gray-400">Item 1</td>
              <td className="p-1 text-right text-gray-400">1</td>
              <td className="p-1 text-right text-gray-400">₹1,000</td>
              <td className="p-1 text-right text-gray-400">18%</td>
              <td className="p-1 text-right text-gray-400">₹1,180</td>
            </tr>
            <tr>
              <td className="p-1 text-gray-400">2</td>
              <td className="p-1 text-gray-400">Paper</td>
              <td className="p-1 text-right text-gray-400">1</td>
              <td className="p-1 text-right text-gray-400">₹1,000</td>
              <td className="p-1 text-right text-gray-400">18%</td>
              <td className="p-1 text-right text-gray-400">₹1,180</td>
            </tr>
          </tbody>
        </table>
        <div className="text-[10px] text-gray-500 mb-2">
          <p className="font-medium">Amount In Words -</p>
          <p>Two Thousand Three Hundred Sixty Rupees Only</p>
        </div>
        <div className="flex justify-end">
          <div className="text-[10px] w-40">
            <div className="flex justify-between py-0.5"><span>Sub Total</span><span>₹2,000</span></div>
            <div className="flex justify-between py-0.5"><span>SGST@9%</span><span>₹180</span></div>
            <div className="flex justify-between py-0.5"><span>CGST@9%</span><span>₹180</span></div>
            <div className="flex justify-between py-0.5 bg-purple-600 text-white px-1 font-semibold"><span>Total</span><span>₹2,360</span></div>
            <div className="flex justify-between py-0.5 font-medium"><span>Balance Due</span><span className="text-red-600">₹{invoiceAmount || '2,360'}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomeScreen({ onNavigate }) {
  const [customerName, setCustomerName] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('0.00')
  const [received, setReceived] = useState('0.00')

  const balance = (parseFloat(invoiceAmount) || 0) - (parseFloat(received) || 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <svg className="w-7 h-7" viewBox="0 0 50 50" fill="none">
          <path d="M5 10L25 5L45 10L45 40L25 45L5 40Z" fill="#d32f2f"/>
          <path d="M20 20L30 20M20 25L35 25M20 30L28 30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <h1 className="text-lg font-semibold text-gray-800">Welcome to Vyapar</h1>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="grid grid-cols-2 gap-6 max-w-5xl">
          {/* Left: Invoice Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                Enter details to make your first Sale 🚀
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">First sale is made in less than a minute on Vyapar</p>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Invoice Details :</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">Invoice Number : <span className="font-medium">01</span></p>
                <p className="text-xs text-gray-600">Invoice Date : <span className="font-medium">13-03-2026</span></p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Bill To :</span>
                </div>
                <label className="block text-xs text-gray-600 mb-1">
                  Customer Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  placeholder="Enter customer name"
                />
              </div>
            </div>

            {/* Add Sample Item */}
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 mb-4 text-center bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm font-medium">Add Sample Item</span>
              </div>
            </div>

            {/* Invoice Calculation */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Invoice Calculation :</span>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Invoice Amount<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={invoiceAmount}
                    onChange={e => setInvoiceAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Received</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={received}
                    onChange={e => setReceived(e.target.value)}
                    className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Balance</span>
              <span className={`text-base font-bold ${balance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹ {balance.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => alert('Invoice Created!')}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Your First Invoice
            </button>
          </div>

          {/* Right: Invoice Preview */}
          <div>
            <p className="text-xs text-gray-500 text-center mb-3">1Cr Vyaparis have created invoices on Vyapar ⚡</p>
            <TaxInvoicePreview customerName={customerName} invoiceAmount={invoiceAmount} />
          </div>
        </div>
      </div>
    </div>
  )
}
