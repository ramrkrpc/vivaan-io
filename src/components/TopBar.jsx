export default function TopBar({ businessName = 'My Business' }) {
  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-1.5 text-xs text-gray-600 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="vLogo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0d9488"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
            </defs>
            <path d="M4 6 L16 26 L28 6 L22 6 L16 18 L10 6 Z" fill="url(#vLogo)"/>
          </svg>
          <span className="font-bold text-sm bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Vivaan.io</span>
        </div>
        {['Company', 'Help', 'Versions', 'Shortcuts'].map(item => (
          <button key={item} className="hover:text-gray-900 transition-colors">{item}</button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button className="text-red-600 font-medium hover:underline">Request a Callback</button>
        <span className="text-gray-300">|</span>
        <span>Support: <span className="font-medium">+91-8000000000</span></span>
        <span className="text-gray-300">|</span>
        <button className="text-blue-600 hover:underline">Live Chat</button>
      </div>
    </div>
  )
}
