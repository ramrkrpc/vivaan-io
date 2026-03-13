export default function TopBar() {
  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-100 px-5 py-3 shrink-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M6 7 L16 23 L26 7 L21 7 L16 17 L11 7 Z" fill="white"/>
          </svg>
        </div>
        <div className="flex items-baseline">
          <span className="font-bold text-lg text-gray-900 tracking-tight">Vivaan</span>
          <span className="font-bold text-lg text-teal-600 tracking-tight">.io</span>
          <span className="ml-3 text-xs text-gray-400 font-normal hidden lg:inline border-l border-gray-200 pl-3">
            Accounting for Indian Businesses
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          Data saved
        </div>
        <button className="text-xs text-gray-500 hover:text-teal-600 hidden md:block transition-colors">Help</button>
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">Free Plan</span>
      </div>
    </div>
  )
}
