import React, { useState, useEffect } from 'react';
import { X, Server, Download, Database, Check, Copy, FileText, ChevronRight, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface XamppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XamppModal: React.FC<XamppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'instructions' | 'files'>('instructions');
  const [selectedFile, setSelectedFile] = useState<string>('database.sql');
  const [filesData, setFilesData] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadFiles() {
      setLoadingFiles(true);
      try {
        const res = await fetch('/api/xampp/files');
        const data = await res.json();
        if (data.files) {
          setFilesData(data.files);
        }
      } catch (err) {
        console.warn('Failed loading XAMPP files:', err);
      } finally {
        setLoadingFiles(false);
      }
    }

    loadFiles();
  }, []);

  const handleCopyCode = () => {
    const content = filesData[selectedFile] || '';
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileList = [
    { name: 'database.sql', label: 'MySQL Database Dump', desc: 'Creates localwork DB & tables in phpMyAdmin' },
    { name: 'config/db.php', label: 'Database Config (db.php)', desc: 'PDO connection to MySQL with SQLite fallback' },
    { name: 'index.php', label: 'Storefront (index.php)', desc: 'Complete standalone PHP + Bootstrap storefront' },
    { name: 'api/products.php', label: 'Products API (products.php)', desc: 'PHP category filter & search endpoint' },
    { name: 'api/orders.php', label: 'Orders API (orders.php)', desc: 'Order tracking & milestone status dispatch' },
    { name: 'api/stripe.php', label: 'Stripe API (stripe.php)', desc: 'Payment intent & freight weight calculations' },
    { name: 'api/notifications.php', label: 'Notifications API (notifications.php)', desc: 'Push alert feeds' },
    { name: 'README_XAMPP.txt', label: 'Readme Instructions', desc: 'Step-by-step setup documentation' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-display font-black text-orange-400 text-sm">
              <Server className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg text-white uppercase tracking-tight">
                  XAMPP Deployment & Hosting Suite
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  PHP + MySQL + Apache
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Deploy LOCALWORK directly into your local XAMPP <code className="text-neutral-300">htdocs</code> directory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Quick Download Bar */}
        <div className="bg-neutral-950/60 px-6 py-3 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'instructions'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-850 text-neutral-300 hover:text-white'
              }`}
            >
              Setup Guide (4 Steps)
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'files'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-850 text-neutral-300 hover:text-white'
              }`}
            >
              Browse & Copy PHP / SQL Code
            </button>
          </div>

          {/* 1-Click ZIP Download */}
          <a
            href="/api/xampp/download"
            download="localwork_xampp.zip"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-emerald-900/30"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Complete XAMPP Package (.ZIP)</span>
          </a>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'instructions' ? (
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono text-xs">
                    1
                  </span>
                  <span>Extract Files to XAMPP htdocs</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Download the ZIP package and extract its contents into your XAMPP web root folder:
                </p>
                <div className="bg-neutral-900 p-3 rounded-lg font-mono text-[11px] text-emerald-400 border border-neutral-800 space-y-1">
                  <div>Windows: <span className="text-neutral-200">C:\xampp\htdocs\localwork\</span></div>
                  <div>macOS: <span className="text-neutral-200">/Applications/XAMPP/htdocs/localwork/</span></div>
                  <div>Linux: <span className="text-neutral-200">/opt/lampp/htdocs/localwork/</span></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono text-xs">
                    2
                  </span>
                  <span>Start Apache & MySQL in XAMPP Control Panel</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Open the <strong>XAMPP Control Panel</strong> and click the <strong>Start</strong> button next to both <strong>Apache</strong> and <strong>MySQL</strong>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono text-xs">
                    3
                  </span>
                  <span>Import database.sql in phpMyAdmin</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Open your browser and navigate to:
                </p>
                <div className="bg-neutral-900 p-2.5 rounded-lg font-mono text-xs text-amber-400 border border-neutral-800 flex items-center justify-between">
                  <span>http://localhost/phpmyadmin/</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 mt-2">
                  <li>Click on the <strong>Import</strong> tab at the top.</li>
                  <li>Click <strong>Choose File</strong> and select <code className="text-neutral-200">C:\xampp\htdocs\localwork\database.sql</code>.</li>
                  <li>Click <strong>Import</strong> (or "Go"). All tables and materials will be generated automatically.</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono text-xs">
                    4
                  </span>
                  <span>Launch LOCALWORK!</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Open your browser and enter:
                </p>
                <div className="bg-neutral-900 p-3 rounded-lg font-mono text-sm text-white font-bold border border-neutral-800 flex items-center justify-between">
                  <span className="text-amber-400">http://localhost/localwork/</span>
                  <span className="text-emerald-400 font-normal text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Ready</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* File List */}
              <div className="space-y-1.5 md:col-span-1 border-r border-neutral-800 pr-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Included XAMPP Files:
                </span>
                {fileList.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFile(f.name)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      selectedFile === f.name
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold text-neutral-200 truncate">
                      {f.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">{f.label}</div>
                  </button>
                ))}
              </div>

              {/* Code Preview & Copy */}
              <div className="md:col-span-2 flex flex-col h-full">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-semibold">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile}</span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-[480px] leading-relaxed select-all">
                  <pre>{filesData[selectedFile] || 'Loading file content...'}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-950 p-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Built with PHP PDO Prepared Statements & MariaDB/MySQL Support</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 rounded-lg transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
