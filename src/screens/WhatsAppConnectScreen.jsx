import { useState } from 'react'
import TermsModal from '../components/TermsModal'

function QRCode() {
  // Simple SVG QR code placeholder pattern
  return (
    <div className="w-40 h-40 border-4 border-gray-800 rounded p-2 bg-white mx-auto">
      <div className="w-full h-full grid" style={{ gridTemplateColumns: 'repeat(10,1fr)', gap: 1 }}>
        {Array.from({ length: 100 }, (_, i) => (
          <div
            key={i}
            className={`rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function WhatsAppConnectScreen() {
  const [step, setStep] = useState('landing') // landing | qr
  const [agreed, setAgreed] = useState(true)
  const [showTerms, setShowTerms] = useState(false)

  if (step === 'landing') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">Welcome to Vyapar</h1>
        </div>
        <div className="flex-1 overflow-auto flex flex-col items-center justify-center bg-white p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            WhatsApp in Vyapar to Share Bills, Reminders & More
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center max-w-xl">
            Send invoices, remind customers, and track payments — all from Vyapar with your existing WhatsApp.
          </p>

          {/* Illustration */}
          <div className="mb-8">
            <div className="w-80 h-44 bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-6xl">📱💼</div>
              </div>
              <div className="absolute top-4 right-8 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                ✓ Invoice sent
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6 mb-8 max-w-2xl w-full">
            {[
              { icon: '📄', title: 'Send Bills in Single Click', desc: 'Send bills instantly and get payments on time' },
              { icon: '📱', title: 'Works With Existing WhatsApp', desc: 'No new app. Keep using the account you already have' },
              { icon: '🛡️', title: 'Fully Secured & Encrypted', desc: 'Messages are end to end encrypted and safe' },
            ].map(f => (
              <div key={f.title} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">{f.icon}</div>
                <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('qr')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
          >
            Link my WhatsApp
          </button>
          <p className="text-xs text-gray-400 mt-2">🔒 Secure, official, and designed for your business.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Banner */}
      <div className="bg-green-600 text-white px-6 py-2.5 text-sm font-medium flex items-center justify-between shrink-0">
        <span>Only Your Party Chats Will be Shown in Vyapar</span>
        <span className="text-lg">💬</span>
      </div>

      <div className="flex-1 overflow-auto grid grid-cols-2 bg-white">
        {/* Left: Illustration */}
        <div className="flex flex-col items-center justify-center p-10 border-r border-gray-100">
          <div className="w-72 h-52 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl flex items-center justify-center mb-6">
            <div className="text-7xl">🏪</div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Whatsapp Connect</h3>
          <p className="text-gray-500 text-sm text-center">
            Seamlessly Connect WhatsApp for Smarter Business Communication
          </p>
        </div>

        {/* Right: QR */}
        <div className="flex flex-col items-center justify-center p-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Log in with WhatsApp to send bulk messages</h3>
          <p className="text-gray-500 text-xs mb-6">Safe. Secure. Private.</p>

          <QRCode />
          <p className="text-gray-600 text-sm mt-3 mb-6">Scan this QR code</p>

          <div className="space-y-4 max-w-xs w-full text-xs text-gray-600">
            <div>
              <p className="text-gray-400 uppercase tracking-wide font-semibold mb-1">STEP 1</p>
              <p>Open WhatsApp on your mobile, click the <strong>⋮</strong> icon and select 'Linked devices'.</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide font-semibold mb-1">STEP 2</p>
              <p>Click on the 'Link a device' button on this screen. This will open the QR code scanner.</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide font-semibold mb-1">STEP 3</p>
              <p>Using your mobile, scan the QR code shown on the right</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              Proceed with{' '}
              <button
                onClick={() => setShowTerms(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Standard Usage Terms
              </button>
            </label>
          </div>
        </div>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  )
}
