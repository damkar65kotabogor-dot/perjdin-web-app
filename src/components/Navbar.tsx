import React from 'react';
import { UserSession } from '../types/perjadin';
import { 
  Compass, 
  LayoutDashboard, 
  FileSpreadsheet, 
  BarChart3, 
  FileCode2, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'riwayat' | 'rekap' | 'sync';
  setCurrentTab: (tab: 'dashboard' | 'riwayat' | 'rekap' | 'sync') => void;
  user: UserSession;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenNewPerjadin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onOpenLogin,
  onLogout,
  onOpenNewPerjadin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-xs">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight whitespace-nowrap">
                  SMPD
                </span>
                <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm uppercase tracking-wider hidden sm:inline-block">
                  E-Perjadin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block whitespace-nowrap">
                Sistem Manajemen Perjalanan Dinas
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('riwayat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'riwayat'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Riwayat Dinas</span>
            </button>

            <button
              onClick={() => setCurrentTab('rekap')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'rekap'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rekapitulasi</span>
            </button>

            <button
              onClick={() => setCurrentTab('sync')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'sync'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>Google Sheets API</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {user.isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenNewPerjadin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  <span>+ Tambah Perjadin</span>
                </button>

                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    @{user.username}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Petugas</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <button
            onClick={() => {
              setCurrentTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'dashboard' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => {
              setCurrentTab('riwayat');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'riwayat' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Riwayat Perjalanan Dinas</span>
          </button>
          <button
            onClick={() => {
              setCurrentTab('rekap');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'rekap' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Rekapitulasi</span>
          </button>
          <button
            onClick={() => {
              setCurrentTab('sync');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'sync' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Google Sheets & Apps Script</span>
          </button>
          {user.isLoggedIn && (
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenNewPerjadin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg"
              >
                + Tambah Perjadin Baru
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
