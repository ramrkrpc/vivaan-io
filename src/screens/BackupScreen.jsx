import { useState, useRef } from 'react'
import { CloudArrowUpIcon, CloudArrowDownIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { backupOps } from '../db'

export default function BackupScreen() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [importResult, setImportResult] = useState(null) // { ok, message }
  const fileRef = useRef(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await backupOps.exportAll()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `vivaan-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportDone(true)
      setTimeout(() => setExportDone(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.version || !data.parties) throw new Error('Invalid backup file format')
      await backupOps.importAll(data)
      setImportResult({ ok: true, message: `Data restored from ${file.name}. Reload the app to see changes.` })
    } catch (err) {
      setImportResult({ ok: false, message: err.message ?? 'Failed to import backup file.' })
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fa]">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white shrink-0">
        <h1 className="text-base md:text-lg font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Export your data as JSON or restore from a backup</p>
      </div>

      <div className="flex-1 overflow-auto p-3 md:p-5 space-y-3 md:space-y-4 max-w-xl">

        {/* Export Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <CloudArrowDownIcon className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Export Data</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Download all your data — invoices, parties, items, payments, expenses and settings — as a single JSON file.
              </p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="mt-4 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                {exportDone
                  ? <><CheckCircleIcon className="w-4 h-4" /> Downloaded!</>
                  : exporting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Preparing…</>
                    : <><CloudArrowDownIcon className="w-4 h-4" /> Download Backup</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Restore from Backup</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Select a previously exported JSON file to restore your data.{' '}
                <span className="text-red-500 font-medium">Warning: this will overwrite all current data.</span>
              </p>

              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                {importing
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Restoring…</>
                  : <><CloudArrowUpIcon className="w-4 h-4" /> Choose Backup File</>
                }
              </button>

              {importResult && (
                <div className={`mt-3 flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 ${
                  importResult.ok
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {importResult.ok
                    ? <CheckCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    : <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  }
                  <span>{importResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">💡 Tips</p>
          <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
            <li>Backup regularly, especially before making major changes</li>
            <li>Keep your backup file in a safe location (Google Drive, email)</li>
            <li>After restoring, reload the page to see the restored data</li>
            <li>The backup includes all invoices, parties, items, payments, expenses and settings</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
