/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PerjalananDinas, 
  UserSession, 
  SyncLog 
} from './types/perjadin';
import { INITIAL_PERJALANAN_DATA } from './data/initialData';
import { PAGU_ANGGARAN_DEFAULT } from './utils/formatters';

import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { PerjalananTable } from './components/PerjalananTable';
import { PerjalananFormModal } from './components/PerjalananFormModal';
import { PerjalananDetailModal } from './components/PerjalananDetailModal';
import { CetakDokumenModal } from './components/CetakDokumenModal';
import { RekapView } from './components/RekapView';
import { AppsScriptSyncModal } from './components/AppsScriptSyncModal';

// Firebase Services
import { auth, testConnection, signOut } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  getPerjalananDinasList, 
  savePerjalananDinasDoc, 
  deletePerjalananDinasDoc,
  batchSyncToFirestore 
} from './firebase/firestoreService';

const LOCAL_STORAGE_KEY = 'smpd_perjalanan_dinas_data_v1';
const LOCAL_STORAGE_USER = 'smpd_user_session_v1';
const LOCAL_STORAGE_LOGS = 'smpd_sync_logs_v1';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'riwayat' | 'rekap' | 'sync'>('dashboard');
  const [initialMonthFilter, setInitialMonthFilter] = useState<string>('Semua');

  // User Authentication State
  const [user, setUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      username: 'perjadin',
      name: 'Petugas Administrasi Perjadin',
      role: 'admin',
      isLoggedIn: true,
    };
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Perjalanan Dinas Data State
  const [data, setData] = useState<PerjalananDinas[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved perjadin data', e);
      }
    }
    return INITIAL_PERJALANAN_DATA;
  });

  // Sync Logs
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'log-1',
        timestamp: new Date().toLocaleDateString('id-ID') + ' 08:30',
        type: 'export',
        status: 'success',
        recordCount: 10,
        message: 'Inisialisasi sistem database perjalanan dinas 2026',
      },
    ];
  });

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PerjalananDinas | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<PerjalananDinas | null>(null);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPrintItem, setSelectedPrintItem] = useState<PerjalananDinas | null>(null);

  // 1. Validate Connection to Firestore on Initial Boot (Mandatory Constraint)
  useEffect(() => {
    async function initFirestore() {
      try {
        await testConnection();
        // Check if remote data exists
        const remote = await getPerjalananDinasList();
        if (remote && remote.length > 0) {
          setData(remote);
          handleAddSyncLog({
            type: 'pull',
            status: 'success',
            recordCount: remote.length,
            message: `Memuat ${remote.length} transaksi dari Cloud Firestore`,
          });
        } else {
          // Seed initial data to Firestore
          await batchSyncToFirestore(INITIAL_PERJALANAN_DATA);
          handleAddSyncLog({
            type: 'push',
            status: 'success',
            recordCount: INITIAL_PERJALANAN_DATA.length,
            message: 'Inisialisasi data bawaan ke Cloud Firestore berhasil.',
          });
        }
      } catch (err) {
        console.info('Firestore offline/fallback mode active');
      }
    }
    initFirestore();
  }, []);

  // 2. Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          username: firebaseUser.email?.split('@')[0] || 'pegawai',
          name: firebaseUser.displayName || firebaseUser.email || 'Pegawai SKPD',
          role: 'admin',
          isLoggedIn: true,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Save session to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
  }, [user]);

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_LOGS, JSON.stringify(syncLogs));
  }, [syncLogs]);

  // Handlers for Data CRUD (saved to both Local & Firestore)
  const handleSavePerjadin = async (item: PerjalananDinas) => {
    setData((prev) => {
      const exists = prev.some((d) => d.id === item.id);
      if (exists) {
        return prev.map((d) => (d.id === item.id ? item : d));
      }
      return [item, ...prev];
    });

    try {
      await savePerjalananDinasDoc(item);
    } catch {
      // Handled via errorHandler
    }

    handleAddSyncLog({
      type: 'export',
      status: 'success',
      recordCount: 1,
      message: `Data "${item.uraian.substring(0, 30)}..." berhasil disimpan.`,
    });
  };

  const handleDeletePerjadin = async (id: string) => {
    setData((prev) => prev.filter((d) => d.id !== id));

    try {
      await deletePerjalananDinasDoc(id);
    } catch {
      // Handled via errorHandler
    }

    handleAddSyncLog({
      type: 'export',
      status: 'success',
      recordCount: 1,
      message: `ID ${id} dihapus dari riwayat.`,
    });
  };

  const handleAddSyncLog = (log: Omit<SyncLog, 'id' | 'timestamp'>) => {
    const newLog: SyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      ...log,
    };
    setSyncLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // Login & Logout
  const handleLoginSuccess = (session: UserSession) => {
    setUser(session);
    setLoginModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser({
      username: '',
      name: '',
      role: 'operator',
      isLoggedIn: false,
    });
  };

  // Navigations from Dashboard
  const handleNavigateToTable = (filterMonth?: string) => {
    if (filterMonth) {
      setInitialMonthFilter(filterMonth);
    } else {
      setInitialMonthFilter('Semua');
    }
    setCurrentTab('riwayat');
  };

  // Reset to default sample
  const handleResetToDefault = async () => {
    if (confirm('Kembalikan ke data bawaan awal (10 transaksi lengkap Kota Bogor)?')) {
      setData(INITIAL_PERJALANAN_DATA);
      try {
        await batchSyncToFirestore(INITIAL_PERJALANAN_DATA);
      } catch {
        // ignore
      }
      handleAddSyncLog({
        type: 'export',
        status: 'success',
        recordCount: INITIAL_PERJALANAN_DATA.length,
        message: 'Data dikembalikan ke setelan awal.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenNewPerjadin={() => {
          setEditingItem(null);
          setFormModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            data={data}
            paguAnggaran={PAGU_ANGGARAN_DEFAULT}
            onOpenNewPerjadin={() => {
              setEditingItem(null);
              setFormModalOpen(true);
            }}
            onNavigateToTable={handleNavigateToTable}
          />
        )}

        {currentTab === 'riwayat' && (
          <PerjalananTable
            data={data}
            onOpenNewPerjadin={() => {
              setEditingItem(null);
              setFormModalOpen(true);
            }}
            onEditPerjadin={(item) => {
              setEditingItem(item);
              setFormModalOpen(true);
            }}
            onDeletePerjadin={handleDeletePerjadin}
            onViewDetail={(item) => {
              setSelectedDetailItem(item);
              setDetailModalOpen(true);
            }}
            onPrintDoc={(item) => {
              setSelectedPrintItem(item);
              setPrintModalOpen(true);
            }}
            initialMonthFilter={initialMonthFilter}
          />
        )}

        {currentTab === 'rekap' && (
          <RekapView
            data={data}
            paguAnggaran={PAGU_ANGGARAN_DEFAULT}
          />
        )}

        {currentTab === 'sync' && (
          <AppsScriptSyncModal
            data={data}
            onDataLoadedFromSheet={(records) => {
              setData(records);
            }}
            syncLogs={syncLogs}
            onAddSyncLog={handleAddSyncLog}
          />
        )}
      </main>

      {/* Global Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PerjalananFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSavePerjadin}
        editItem={editingItem}
      />

      <PerjalananDetailModal
        item={selectedDetailItem}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDetailItem(null);
        }}
        onEdit={(item) => {
          setEditingItem(item);
          setFormModalOpen(true);
        }}
        onPrint={(item) => {
          setSelectedPrintItem(item);
          setPrintModalOpen(true);
        }}
      />

      <CetakDokumenModal
        item={selectedPrintItem}
        isOpen={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setSelectedPrintItem(null);
        }}
      />

      {/* Quiet Government Footer (no-print) */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SMPD</span>
            <span>·</span>
            <span>Sistem Manajemen Perjalanan Dinas terintegrasi Firebase Firestore & Spreadsheet</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetToDefault}
              className="text-slate-400 hover:text-slate-700 hover:underline text-[11px]"
            >
              Reset Data Bawaan
            </button>
            <span className="text-slate-400">Pagu: Rp 487.742.310</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
