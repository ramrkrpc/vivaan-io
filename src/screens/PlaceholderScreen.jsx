export default function PlaceholderScreen({ title, icon = '📋', description, buttonLabel, onButtonClick }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-lg font-semibold text-gray-800">{title || "Vivaan.io"}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">{icon}</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          {description && <p className="text-gray-500 text-sm mb-6">{description}</p>}
          {buttonLabel && (
            <button
              onClick={onButtonClick}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 mx-auto"
            >
              <span className="text-base">+</span>
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
