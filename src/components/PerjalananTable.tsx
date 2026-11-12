import React, { useState, useMemo } from 'react';
import { PerjalananDinas, FilterState } from '../types/perjadin';
import { 
  formatRupiah, 
  formatDateIndo, 
  NAMA_BULAN 
} from '../utils/formatters';
import { exportPerjalananToExcel } from '../utils/excelExporter';
import { 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Edit3, 
  Trash2, 
  Eye, 
  Layers, 
  Users, 
  Calendar, 
  MapPin, 
  ChevronDown, 
  ChevronRight,
  Download,
  RotateCcw
} from 'lucide-react';

interface PerjalananTableProps {
  data: PerjalananDinas[];
  onOpenNewPerjadin: () => void;
  onEditPerjadin: (item: PerjalananDinas) => void;
  onDeletePerjadin: (id: string) => void;
  onViewDetail: (item: PerjalananDinas) => void;
  onPrintDoc: (item: PerjalananDinas) => void;
  initialMonthFilter?: string;
}

export const PerjalananTable: React.FC<PerjalananTableProps> = ({
  data,
  onOpenNewPerjadin,
  onEditPerjadin,
  onDeletePerjadin,
  onViewDetail,
  onPrintDoc,
  initialMonthFilter,
}) => {
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    hari: '',
    bulan: initialMonthFilter || 'Semua',
    triwulan: 'Semua',
    tahun: 'Semua',
    sheetBulan: initialMonthFilter || 'Semua',
    groupByUraian: false,
    mergePelaksana: false,
  });

  // Track expanded groups when groupByUraian is active
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (uraian: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [uraian]: !prev[uraian],
    }));
  };

  // Sync sheet tab with bulan filter
  const handleSheetChange = (sheet: string) => {
    setFilter((prev) => ({
      ...prev,
      sheetBulan: sheet,
      bulan: sheet,
    }));
  };

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Search filter
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase();
        const pelaksanaMatch = item.pelaksana.some(
          (p) =>
            p.nama.toLowerCase().includes(query) ||
            p.nip.toLowerCase().includes(query) ||
            p.jabatan.toLowerCase().includes(query)
        );
        const sppdMatch = item.sppdList.some((s) => s.nomor.toLowerCase().includes(query));
        const sp2dMatch = item.sp2dList.some((s) => s.nomor.toLowerCase().includes(query));
        const uraianMatch = item.uraian.toLowerCase().includes(query);
        const kotaMatch = item.kotaTujuan.toLowerCase().includes(query);
        const kegiatanMatch = item.kegiatan.toLowerCase().includes(query);
        const hotelMatch = item.namaHotel.toLowerCase().includes(query);
        const flightMatch = item.penerbangan.some(
          (f) =>
            f.maskapai.toLowerCase().includes(query) ||
            f.noTiket.toLowerCase().includes(query) ||
            f.kodeBooking.toLowerCase().includes(query)
        );

        if (
          !pelaksanaMatch &&
          !sppdMatch &&
          !sp2dMatch &&
          !uraianMatch &&
          !kotaMatch &&
          !kegiatanMatch &&
          !hotelMatch &&
          !flightMatch
        ) {
          return false;
        }
      }

      // 2. Filter Hari (Tanggal Berangkat / Tanggal Kembali / SPPD / SP2D)
      if (filter.hari) {
        const matchesHari =
          item.tanggalBerangkat === filter.hari ||
          item.tanggalKembali === filter.hari ||
          item.tanggalPembayaran === filter.hari ||
          item.sppdList.some((s) => s.tanggal === filter.hari) ||
          item.sp2dList.some((s) => s.tanggal === filter.hari);
        if (!matchesHari) return false;
      }

      // 3. Filter Bulan
      const activeBulan = filter.sheetBulan !== 'Semua' ? filter.sheetBulan : filter.bulan;
      if (activeBulan !== 'Semua') {
        if (item.bulan.toLowerCase() !== activeBulan.toLowerCase()) return false;
      }

      // 4. Filter Triwulan
      if (filter.triwulan !== 'Semua') {
        const q1 = ['Januari', 'Februari', 'Maret'];
        const q2 = ['April', 'Mei', 'Juni'];
        const q3 = ['Juli', 'Agustus', 'September'];
        const q4 = ['Oktober', 'November', 'Desember'];

        if (filter.triwulan === 'Q1' && !q1.includes(item.bulan)) return false;
        if (filter.triwulan === 'Q2' && !q2.includes(item.bulan)) return false;
        if (filter.triwulan === 'Q3' && !q3.includes(item.bulan)) return false;
        if (filter.triwulan === 'Q4' && !q4.includes(item.bulan)) return false;
      }

      // 5. Filter Tahun
      if (filter.tahun !== 'Semua') {
        if (String(item.tahun) !== filter.tahun) return false;
      }

      return true;
    });
  }, [data, filter]);

  // Grouped / Merged Representation
  const displayItems = useMemo(() => {
    // If Merge Pelaksana with same Uraian is enabled:
    if (filter.mergePelaksana) {
      const mergedMap: Record<string, PerjalananDinas> = {};
      filteredData.forEach((item) => {
        const key = item.uraian.trim();
        if (!mergedMap[key]) {
          mergedMap[key] = {
            ...item,
            pelaksana: [...item.pelaksana],
            uangHarian: [...item.uangHarian],
            representasi: [...item.representasi],
            uangSakuPeserta: [...item.uangSakuPeserta],
            penginapan: [...item.penginapan],
            transportKotaAsal: [...item.transportKotaAsal],
            transportKotaTujuan: [...item.transportKotaTujuan],
            sewaKendaraan: [...item.sewaKendaraan],
            penerbangan: [...item.penerbangan],
            sppdList: [...item.sppdList],
            sp2dList: [...item.sp2dList],
          };
        } else {
          // Merge pelaksana without duplicates by NIP
          item.pelaksana.forEach((p) => {
            if (!mergedMap[key].pelaksana.some((ep) => ep.nip === p.nip && ep.nama === p.nama)) {
              mergedMap[key].pelaksana.push(p);
            }
          });
          // Merge documents
          item.sppdList.forEach((s) => {
            if (!mergedMap[key].sppdList.some((es) => es.nomor === s.nomor)) {
              mergedMap[key].sppdList.push(s);
            }
          });
          item.sp2dList.forEach((s) => {
            if (!mergedMap[key].sp2dList.some((es) => es.nomor === s.nomor)) {
              mergedMap[key].sp2dList.push(s);
            }
          });
          // Add cost
          mergedMap[key].jumlahTotal = Number(mergedMap[key].jumlahTotal) + Number(item.jumlahTotal);
        }
      });
      return Object.values(mergedMap);
    }

    return filteredData;
  }, [filteredData, filter.mergePelaksana]);

  // Grouping by Uraian Structure
  const groupedData = useMemo(() => {
    if (!filter.groupByUraian) return null;
    const map: Record<string, { uraian: string; items: PerjalananDinas[]; totalNominal: number }> = {};
    displayItems.forEach((item) => {
      const key = item.uraian.trim();
      if (!map[key]) {
        map[key] = { uraian: key, items: [], totalNominal: 0 };
      }
      map[key].items.push(item);
      map[key].totalNominal += Number(item.jumlahTotal) || 0;
    });
    return Object.values(map);
  }, [displayItems, filter.groupByUraian]);

  const totalFilteredNominal = useMemo(() => {
    return displayItems.reduce((acc, curr) => acc + (Number(curr.jumlahTotal) || 0), 0);
  }, [displayItems]);

  const handleExportExcel = () => {
    exportPerjalananToExcel(displayItems, `SMPD_Perjalanan_Dinas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const resetFilters = () => {
    setFilter({
      search: '',
      hari: '',
      bulan: 'Semua',
      triwulan: 'Semua',
      tahun: 'Semua',
      sheetBulan: 'Semua',
      groupByUraian: false,
      mergePelaksana: false,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-slate-700" />
            <span>Riwayat Perjalanan Dinas</span>
          </h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh transaksi perjalanan dinas dengan kolom lengkap, filter bertingkat, dan penggabungan pelaksana.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download Spreadsheet Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={onOpenNewPerjadin}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {/* Filter Control Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Search & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Pencarian Bebas */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Pelaksana, NIP, SPPD, SP2D, Uraian, Kegiatan, Kota, Hotel..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>

          {/* Filter Hari */}
          <div className="lg:col-span-2">
            <input
              type="date"
              value={filter.hari}
              onChange={(e) => setFilter({ ...filter, hari: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 text-slate-700"
              title="Filter Tanggal Hari Perjalanan / SPPD / SP2D"
            />
          </div>

          {/* Filter Bulan */}
          <div className="lg:col-span-2">
            <select
              value={filter.bulan}
              onChange={(e) => {
                setFilter({
                  ...filter,
                  bulan: e.target.value,
                  sheetBulan: e.target.value,
                });
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="Semua">Semua Bulan</option>
              {NAMA_BULAN.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Triwulan */}
          <div className="lg:col-span-1">
            <select
              value={filter.triwulan}
              onChange={(e) => setFilter({ ...filter, triwulan: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="Semua">Kuartal</option>
              <option value="Q1">Q1 (Jan-Mar)</option>
              <option value="Q2">Q2 (Apr-Jun)</option>
              <option value="Q3">Q3 (Jul-Sep)</option>
              <option value="Q4">Q4 (Okt-Des)</option>
            </select>
          </div>

          {/* Filter Tahun */}
          <div className="lg:col-span-1">
            <select
              value={filter.tahun}
              onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="Semua">Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="lg:col-span-1 flex items-center">
            <button
              onClick={resetFilters}
              title="Reset Filter"
              className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Row 2: Toggles (Group by Uraian & Merge Pelaksana) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            {/* Toggle Pengelompokan Berdasarkan Uraian */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter.groupByUraian}
                onChange={(e) => setFilter({ ...filter, groupByUraian: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Kelompokkan Berdasarkan Uraian
              </span>
            </label>

            {/* Toggle Pelaksana dengan Uraian yang sama otomatis digabung */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter.mergePelaksana}
                onChange={(e) => setFilter({ ...filter, mergePelaksana: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Gabung Pelaksana dengan Uraian Sama
              </span>
            </label>
          </div>

          <div className="text-slate-500">
            Ditemukan: <span className="font-bold text-slate-900">{displayItems.length}</span> transaksi · Total:{' '}
            <span className="font-mono font-bold text-slate-900">{formatRupiah(totalFilteredNominal)}</span>
          </div>
        </div>
      </div>

      {/* Google Sheets-like Sheet/Bulan Tab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-medium select-none no-scrollbar">
        <span className="px-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
          SHEET BULAN:
        </span>
        <button
          onClick={() => handleSheetChange('Semua')}
          className={`px-3 py-1.5 rounded-t-lg transition-colors shrink-0 whitespace-nowrap border-b-2 ${
            filter.sheetBulan === 'Semua'
              ? 'bg-white border-slate-900 text-slate-900 font-bold shadow-xs'
              : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100'
          }`}
        >
          Semua Data
        </button>
        {NAMA_BULAN.map((bulanName) => (
          <button
            key={bulanName}
            onClick={() => handleSheetChange(bulanName)}
            className={`px-3 py-1.5 rounded-t-lg transition-colors shrink-0 whitespace-nowrap border-b-2 ${
              filter.sheetBulan === bulanName
                ? 'bg-white border-slate-900 text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100'
            }`}
          >
            {bulanName}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filter.groupByUraian && groupedData ? (
          // Grouped by Uraian Accordion View
          <div className="divide-y divide-slate-200">
            {groupedData.map((group) => {
              const isExpanded = expandedGroups[group.uraian] ?? true;
              return (
                <div key={group.uraian} className="overflow-hidden">
                  <div
                    onClick={() => toggleGroup(group.uraian)}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {group.uraian}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {group.items.length} Perjalanan · {group.items[0]?.kegiatan}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {formatRupiah(group.totalNominal)}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <TableContent
                        items={group.items}
                        onViewDetail={onViewDetail}
                        onEditPerjadin={onEditPerjadin}
                        onDeletePerjadin={onDeletePerjadin}
                        onPrintDoc={onPrintDoc}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {groupedData.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-400">
                Tidak ada data perjalanan dinas yang sesuai dengan filter.
              </div>
            )}
          </div>
        ) : (
          // Regular High-Density Table with all Columns
          <div className="overflow-x-auto">
            <TableContent
              items={displayItems}
              onViewDetail={onViewDetail}
              onEditPerjadin={onEditPerjadin}
              onDeletePerjadin={onDeletePerjadin}
              onPrintDoc={onPrintDoc}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface TableContentProps {
  items: PerjalananDinas[];
  onViewDetail: (item: PerjalananDinas) => void;
  onEditPerjadin: (item: PerjalananDinas) => void;
  onDeletePerjadin: (id: string) => void;
  onPrintDoc: (item: PerjalananDinas) => void;
}

const TableContent: React.FC<TableContentProps> = ({
  items,
  onViewDetail,
  onEditPerjadin,
  onDeletePerjadin,
  onPrintDoc,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">
        Tidak ada data perjalanan dinas ditemukan.
      </div>
    );
  }

  return (
    <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
      <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
        <tr>
          <th className="py-3 px-3 w-10 text-center">No</th>
          <th className="py-3 px-3 min-w-[120px]">Bulan / Tgl</th>
          <th className="py-3 px-4 min-w-[220px]">Uraian & Kegiatan</th>
          <th className="py-3 px-4 min-w-[150px]">Tujuan & Instansi</th>
          <th className="py-3 px-4 min-w-[200px]">Pelaksana Dinas</th>
          <th className="py-3 px-3 min-w-[110px]">SPPD / SP2D</th>
          <th className="py-3 px-3 text-right min-w-[130px]">Jumlah Total</th>
          <th className="py-3 px-3 text-center min-w-[120px]">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {items.map((item, idx) => {
          const sppdFirst = item.sppdList[0]?.nomor || '-';
          const sp2dFirst = item.sp2dList[0]?.nomor || '-';

          return (
            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                {idx + 1}
              </td>

              <td className="py-3 px-3">
                <span className="font-bold text-slate-900 block">
                  {item.bulan} {item.tahun}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatDateIndo(item.tanggalBerangkat)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  ({item.lamaPerjalananHari} Hari)
                </span>
              </td>

              <td className="py-3 px-4">
                <p className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                  {item.uraian}
                </p>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  <span>Rek: {item.kodeRekeningBelanja || item.kodeRekeningKegiatan}</span>
                  <span> · {item.subKegiatan || item.kegiatan}</span>
                </div>
              </td>

              <td className="py-3 px-4">
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{item.kotaTujuan}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {item.namaKantorTujuan || item.skpd}
                </div>
                {item.namaHotel && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    🏨 {item.namaHotel}
                  </div>
                )}
              </td>

              <td className="py-3 px-4">
                <div className="space-y-1">
                  {item.pelaksana.slice(0, 3).map((p) => (
                    <div key={p.id || p.nama} className="leading-tight">
                      <span className="font-medium text-slate-800 block text-[11px]">
                        {p.nama}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.nip} · {p.jabatan}
                      </span>
                    </div>
                  ))}
                  {item.pelaksana.length > 3 && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      +{item.pelaksana.length - 3} pelaksana lainnya
                    </span>
                  )}
                </div>
              </td>

              <td className="py-3 px-3 font-mono text-[11px]">
                <div title={`SPPD: ${sppdFirst}`} className="truncate max-w-[130px]">
                  <span className="text-slate-400 text-[10px]">SPPD: </span>
                  <span className="font-medium text-slate-800">{sppdFirst}</span>
                </div>
                <div title={`SP2D: ${sp2dFirst}`} className="truncate max-w-[130px] mt-0.5">
                  <span className="text-slate-400 text-[10px]">SP2D: </span>
                  <span className="font-medium text-slate-800">{sp2dFirst}</span>
                </div>
              </td>

              <td className="py-3 px-3 text-right">
                <span className="font-mono font-bold text-slate-900 text-xs tabular-nums block">
                  {formatRupiah(item.jumlahTotal)}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs font-medium">
                  {item.statusApproval || 'Disetujui'}
                </span>
              </td>

              <td className="py-3 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onViewDetail(item)}
                    title="Lihat Rincian Seluruh Kolom"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onPrintDoc(item)}
                    title="Cetak SPPD & Kwitansi Resmi"
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditPerjadin(item)}
                    title="Edit Data"
                    className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus data perjalanan dinas "${item.uraian}"?`)) {
                        onDeletePerjadin(item.id);
                      }
                    }}
                    title="Hapus Data"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
