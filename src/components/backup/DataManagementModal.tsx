import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useSubscriptions } from '../../context/SubscriptionContext';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const { exportData, importData, resetDemoData, subscriptions } = useSubscriptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mybestspa-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message: `Restored ${res.count} subscriptions successfully!`,
        });
      } else {
        setImportStatus({
          type: 'error',
          message: res.message,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all data back to the curated demo subscriptions? This will replace your current entries.'
      )
    ) {
      resetDemoData();
      setImportStatus({
        type: 'success',
        message: 'Successfully reset to demo subscriptions!',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Data & Backup Manager
              </h3>
              <p className="text-xs text-slate-500">
                Local storage persistence controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {importStatus.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your subscriptions are saved safely in your browser via <code className="font-mono text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200">localStorage</code> through our <code className="font-mono text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200">storage.ts</code> service layer.
            </span>
          </div>

          {/* Action List */}
          <div className="space-y-2.5 pt-1">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center transition-colors">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-slate-900 block">
                    Export Backup (JSON)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Save all {subscriptions.length} subscriptions to a file
                  </span>
                </div>
              </div>
            </button>

            {/* Import */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-slate-900 block">
                    Import Backup (JSON)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Restore subscriptions from a previous export
                  </span>
                </div>
              </div>
            </button>

            {/* Reset Demo */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800 flex items-center justify-center transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-slate-900 block">
                    Reset to Curated Demo Data
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Reloads Netflix, Gymbox, Singtel contract, Superhuman, etc.
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
