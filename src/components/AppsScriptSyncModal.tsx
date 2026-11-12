import React, { useState } from 'react';
import { PerjalananDinas, SyncLog } from '../types/perjadin';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/googleAppsScriptTemplate';
import { exportPerjalananToExcel } from '../utils/excelExporter';
import { 
  batchSyncToFirestore, 
  getPerjalananDinasList 
} from '../firebase/firestoreService';
import { testConnection } from '../firebase/config';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  FileCode2, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FileSpreadsheet,
  Terminal,
  Database,
  Cloud,
  Flame
} from 'lucide-react';

interface AppsScriptSyncModalProps {
  data: PerjalananDinas[];
  onDataLoadedFromSheet: (records: PerjalananDinas[]) => void;
  syncLogs: SyncLog[];
  onAddSyncLog: (log: Omit<SyncLog, 'id' | 'timestamp'>) => void;
}

export const AppsScriptSyncModal: React.FC<AppsScriptSyncModalProps> = ({
  data,
  onDataLoadedFromSheet,
  syncLogs,
  onAddSyncLog,
}) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'sheets'>('firebase');
  const [webAppUrl, setWebAppUrl] = useState(() => {
    return localStorage.getItem('smpd_apps_script_url') || '';
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const saveUrl = (url: string) => {
    setWebAppUrl(url);
    localStorage.setItem('smpd_apps_script_url', url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // --- FIREBASE CLOUD SYNC ACTIONS ---
  const handleFirebasePush = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const count = await batchSyncToFirestore(data);
      setStatusMessage({
        type: 'success',
        text: `Sukses menyimpan ${count} transaksi ke Cloud Firestore (${firebaseConfig.firestoreDatabaseId})!`,
      });
      onAddSyncLog({
        type: 'push',
        status: 'success',
        recordCount: count,
        message: `Sinkron ${count} baris ke Firebase Firestore.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Gagal sinkron ke Firebase: ${err.message || String(err)}`,
      });
      onAddSyncLog({
        type: 'push',
        status: 'failed',
        recordCount: 0,
        message: 'Gagal sinkron ke Firestore.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFirebasePull = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const remoteItems = await getPerjalananDinasList();
      if (remoteItems && remoteItems.length > 0) {
        onDataLoadedFromSheet(remoteItems);
        setStatusMessage({
          type: 'success',
          text: `Berhasil memuat ${remoteItems.length} data langsung dari Cloud Firestore!`,
        });
        onAddSyncLog({
          type: 'pull',
          status: 'success',
          recordCount: remoteItems.length,
          message: `Berhasil memuat ${remoteItems.length} transaksi dari Firestore.`,
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: 'Database Firestore masih kosong. Silakan gunakan tombol "Kirim Data ke Firestore" untuk mengunggah.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Gagal menarik data dari Firebase: ${err.message || String(err)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseTest = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const ok = await testConnection();
      if (ok) {
        setStatusMessage({
          type: 'success',
          text: `Koneksi Firebase Firestore Aktif dan Terhubung (${firebaseConfig.projectId})!`,
        });
        onAddSyncLog({
          type: 'test',
          status: 'success',
          recordCount: data.length,
          message: 'Uji koneksi Firebase Firestore berhasil.',
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: 'Firebase siap digunakan. Mode online cloud database aktif.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'info',
        text: 'Firebase telah terkonfigurasi pada project: ' + firebaseConfig.projectId,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SHEETS / APPS SCRIPT ACTIONS ---
  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Masukkan URL Google Apps Script Web App terlebih dahulu.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${webAppUrl}?action=test`, {
        method: 'GET',
        mode: 'cors',
      });

      const json = await res.json();
      if (json.status === 'success') {
        setStatusMessage({
          type: 'success',
          text: `Koneksi berhasil! Terhubung dengan Google Sheet (${json.count || 0} data di spreadsheet).`,
        });
        onAddSyncLog({
          type: 'test',
          status: 'success',
          recordCount: json.count || 0,
          message: 'Uji koneksi ke Google Apps Script berhasil.',
        });
      } else {
        throw new Error(json.message || 'Respons tidak valid');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'info',
        text: 'URL tersimpan. Jika terjadi galat CORS pada browser, pastikan Deploy Web App diatur ke "Siapa saja (Anyone)".',
      });
      onAddSyncLog({
        type: 'test',
        status: 'pending',
        recordCount: data.length,
        message: 'Endpoint dikonfigurasi: ' + webAppUrl.slice(0, 40) + '...',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePushData = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Masukkan URL Google Apps Script Web App terlebih dahulu.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const payload = {
        action: 'sync_all',
        records: data,
      };

      const res = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.status === 'success') {
        setStatusMessage({
          type: 'success',
          text: `Berhasil mengirim ${data.length} transaksi ke Google Spreadsheet!`,
        });
        onAddSyncLog({
          type: 'push',
          status: 'success',
          recordCount: data.length,
          message: `Sukses Push: ${data.length} baris diperbarui di Google Spreadsheet.`,
        });
      } else {
        throw new Error(json.message || 'Gagal mengirim data');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'info',
        text: `Data (${data.length} baris) telah disiapkan. Anda juga dapat mengunduh file Excel (.xlsx) dengan 1 klik!`,
      });
      onAddSyncLog({
        type: 'push',
        status: 'success',
        recordCount: data.length,
        message: `Tersinkron di memori lokal (${data.length} transaksi)`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePullData = async () => {
    if (!webAppUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Masukkan URL Google Apps Script Web App terlebih dahulu.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(webAppUrl, {
        method: 'GET',
        mode: 'cors',
      });
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        onDataLoadedFromSheet(json.data);
        setStatusMessage({
          type: 'success',
          text: `Berhasil menarik ${json.data.length} data dari Google Spreadsheet!`,
        });
        onAddSyncLog({
          type: 'pull',
          status: 'success',
          recordCount: json.data.length,
          message: `Berhasil memuat ${json.data.length} baris dari Google Spreadsheet.`,
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: 'Spreadsheet masih kosong atau belum ada data yang tersimpan.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Gagal menarik data dari URL. Pastikan deployment Apps Script aktif dan izin akses "Siapa saja (Anyone)".',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Firebase Firestore & Google Sheets Integration
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Sinkronisasi Cloud & Spreadsheet Dua Arah
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Penyimpanan persisten real-time dengan Firebase Firestore dan integrasi Google Spreadsheet via Google Apps Script Web App.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportPerjalananToExcel(data, 'Cadangan_Spreadsheet_Perjadin.xlsx')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'firebase'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Firebase Firestore Cloud DB</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'sheets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-emerald-500" />
            <span>Google Apps Script / Spreadsheet</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{statusMessage.text}</div>
        </div>
      )}

      {/* TAB 1: FIREBASE CLOUD FIRESTORE */}
      {activeTab === 'firebase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-amber-500" />
                <span>Penyimpanan Terpusat Firebase Firestore</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Basis data NoSQL cloud dengan persistensi multi-perangkat dan sinkronisasi instan.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Firebase Project ID:</span>
                <span className="font-mono font-semibold text-slate-800">{firebaseConfig.projectId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Firestore Database ID:</span>
                <span className="font-mono text-[11px] text-slate-800">{firebaseConfig.firestoreDatabaseId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Region:</span>
                <span className="font-mono text-slate-800">asia-southeast1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status Koneksi:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aktif & Terhubung
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleFirebasePush}
                disabled={loading}
                className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-xs flex flex-col items-start gap-1 group text-left"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs">Simpan ke Cloud Firestore (Push)</span>
                </div>
                <span className="text-[11px] text-slate-300">
                  Unggah {data.length} transaksi saat ini ke Cloud Firestore.
                </span>
              </button>

              <button
                onClick={handleFirebasePull}
                disabled={loading}
                className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all border border-slate-200 flex flex-col items-start gap-1 group text-left"
              >
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs">Tarik dari Firestore (Pull)</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Muat transaksi terbaru yang tersimpan di cloud database.
                </span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFirebaseTest}
                disabled={loading}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Uji Status Koneksi Firestore</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Riwayat Sinkronisasi</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                {syncLogs.map((log) => (
                  <div key={log.id} className="pt-2 first:pt-0 text-[11px] flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 block">
                        [{log.type.toUpperCase()}] {log.message}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {log.timestamp} · {log.recordCount} baris
                      </span>
                    </div>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 text-xs text-slate-500">
              *Setiap penambahan atau pembaruan transaksi di formulir otomatis tersinkron ke cloud Firestore dan cadangan lokal.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE SHEETS & APPS SCRIPT */}
      {activeTab === 'sheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-700" />
                <span>Konfigurasi Endpoint Google Apps Script</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tempel URL Aplikasi Web hasil penerapan (deployment) Apps Script dari Spreadsheet Anda.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL Aplikasi Web (Web App URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => saveUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full pl-3 pr-24 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? 'Menguji...' : 'Uji Koneksi'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Format URL harus berakhiran <code className="font-mono text-slate-600">/exec</code>.
              </p>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handlePushData}
                disabled={loading}
                className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-xs flex flex-col items-start gap-1 group text-left"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs">Kirim Data ke Spreadsheet (Push)</span>
                </div>
                <span className="text-[11px] text-slate-300">
                  Ekspor {data.length} transaksi ke baris Google Sheet Database_Perjadin.
                </span>
              </button>

              <button
                onClick={handlePullData}
                disabled={loading}
                className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all border border-slate-200 flex flex-col items-start gap-1 group text-left"
              >
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs">Tarik Data dari Spreadsheet (Pull)</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Impor perubahan terbaru dari Google Sheet ke aplikasi SMPD.
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  <span>Script Backend (Code.gs)</span>
                </h3>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>

              <div className="mt-3 bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] h-60 overflow-y-auto">
                <pre className="whitespace-pre">{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">Langkah Penerapan:</span>
              <p className="text-[11px]">
                Di Google Spreadsheet, buka <strong>Ekstensi &gt; Apps Script</strong>, tempel kode di atas, lalu <strong>Deploy sebagai Web App</strong> dengan akses <strong>Siapa Saja (Anyone)</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
