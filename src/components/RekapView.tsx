import React, { useState, useMemo } from 'react';
import { PerjalananDinas } from '../types/perjadin';
import { 
  formatRupiah, 
  formatNumber, 
  NAMA_BULAN,
  PAGU_ANGGARAN_DEFAULT 
} from '../utils/formatters';
import { exportPerjalananToExcel } from '../utils/excelExporter';
import { 
  BarChart3, 
  Layers, 
  Users, 
  Calendar, 
  Download, 
  Printer, 
  Search,
  Building2,
  FolderTree
} from 'lucide-react';

interface RekapViewProps {
  data: PerjalananDinas[];
  paguAnggaran?: number;
}

export const RekapView: React.FC<RekapViewProps> = ({
  data,
  paguAnggaran = PAGU_ANGGARAN_DEFAULT,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kegiatan' | 'pelaksana' | 'bulan'>('kegiatan');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. REKAP PER KEGIATAN & SUB KEGIATAN
  const rekapKegiatan = useMemo(() => {
    const map: Record<
      string,
      {
        kegiatan: string;
        subKegiatan: string;
        kodeRekeningKegiatan: string;
        kodeRekeningBelanja: string;
        count: number;
        totalNominal: number;
        pelaksanaTotal: number;
      }
    > = {};

    data.forEach((item) => {
      const key = `${item.kodeRekeningKegiatan}__${item.subKegiatan || item.kegiatan}`;
      if (!map[key]) {
        map[key] = {
          kegiatan: item.kegiatan || 'Kegiatan Umum Perjadin',
          subKegiatan: item.subKegiatan || item.kegiatan || '-',
          kodeRekeningKegiatan: item.kodeRekeningKegiatan,
          kodeRekeningBelanja: item.kodeRekeningBelanja,
          count: 0,
          totalNominal: 0,
          pelaksanaTotal: 0,
        };
      }
      map[key].count += 1;
      map[key].totalNominal += Number(item.jumlahTotal) || 0;
      map[key].pelaksanaTotal += item.pelaksana.length;
    });

    return Object.values(map).filter((k) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        k.kegiatan.toLowerCase().includes(q) ||
        k.subKegiatan.toLowerCase().includes(q) ||
        k.kodeRekeningKegiatan.toLowerCase().includes(q) ||
        k.kodeRekeningBelanja.toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery]);

  // 2. REKAP PER PELAKSANA & URAIAN
  const rekapPelaksana = useMemo(() => {
    const map: Record<
      string,
      {
        nama: string;
        nip: string;
        jabatan: string;
        golongan: string;
        count: number;
        totalNominal: number;
        daftarUraian: { uraian: string; bulan: string; tanggal: string; nominal: number }[];
      }
    > = {};

    data.forEach((item) => {
      const nominalPerPerson = item.pelaksana.length > 0 ? (item.jumlahTotal / item.pelaksana.length) : item.jumlahTotal;
      item.pelaksana.forEach((p) => {
        const key = p.nama.trim().toLowerCase();
        if (!map[key]) {
          map[key] = {
            nama: p.nama,
            nip: p.nip || '-',
            jabatan: p.jabatan || '-',
            golongan: p.golongan || '-',
            count: 0,
            totalNominal: 0,
            daftarUraian: [],
          };
        }
        map[key].count += 1;
        map[key].totalNominal += nominalPerPerson;
        map[key].daftarUraian.push({
          uraian: item.uraian,
          bulan: item.bulan,
          tanggal: item.tanggalBerangkat,
          nominal: nominalPerPerson,
        });
      });
    });

    return Object.values(map)
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.nama.toLowerCase().includes(q) ||
          p.nip.toLowerCase().includes(q) ||
          p.jabatan.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.count - a.count);
  }, [data, searchQuery]);

  // 3. REKAP PER BULAN
  const rekapBulan = useMemo(() => {
    let kumulatif = 0;
    return NAMA_BULAN.map((bulanName, idx) => {
      const itemsInMonth = data.filter((d) => d.bulan.toLowerCase() === bulanName.toLowerCase());
      const totalMonth = itemsInMonth.reduce((acc, curr) => acc + (Number(curr.jumlahTotal) || 0), 0);
      const personilCount = itemsInMonth.reduce((acc, curr) => acc + curr.pelaksana.length, 0);
      kumulatif += totalMonth;
      const sisaPagu = Math.max(0, paguAnggaran - kumulatif);
      const serapanPersen = paguAnggaran > 0 ? (kumulatif / paguAnggaran) * 100 : 0;

      return {
        no: idx + 1,
        bulan: bulanName,
        jumlahPerjalanan: itemsInMonth.length,
        jumlahPersonil: personilCount,
        realisasiBulan: totalMonth,
        realisasiKumulatif: kumulatif,
        sisaPagu,
        serapanPersen,
      };
    });
  }, [data, paguAnggaran]);

  const handlePrintRekap = () => {
    window.print();
  };

  const handleExport = () => {
    exportPerjalananToExcel(data, `Rekap_SMPD_${activeSubTab}_2026.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-700" />
            <span>Rekapitulasi Anggaran & Pelaksana</span>
          </h2>
          <p className="text-xs text-slate-500">
            Laporan rekap komprehensif berdasarkan Kegiatan, Pelaksana/Uraian, dan Realisasi Bulanan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrintRekap}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Selection */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('kegiatan')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'kegiatan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Rekap per Kegiatan / Sub Kegiatan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pelaksana')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'pelaksana'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekap per Pelaksana / Uraian</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bulan')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'bulan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Rekap per Bulan (12 Bulan)</span>
          </button>
        </div>

        {activeSubTab !== 'bulan' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
            />
          </div>
        )}
      </div>

      {/* Tab 1: REKAP PER KEGIATAN & SUB KEGIATAN */}
      {activeSubTab === 'kegiatan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">
              Rekapitulasi Anggaran per Kegiatan & Sub Kegiatan
            </h3>
            <p className="text-xs text-slate-500">
              Pemetaan realisasi belanja terhadap pos kegiatan DPA.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-4">Program / Kegiatan</th>
                  <th className="py-3 px-4">Sub Kegiatan</th>
                  <th className="py-3 px-3 font-mono">Kode Rekening</th>
                  <th className="py-3 px-3 text-center">Frekuensi</th>
                  <th className="py-3 px-3 text-center">Total Personil</th>
                  <th className="py-3 px-4 text-right">Total Realisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapKegiatan.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.kegiatan}</td>
                    <td className="py-3 px-4 text-slate-700">{item.subKegiatan}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {item.kodeRekeningKegiatan}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">{item.count} Perjalanan</td>
                    <td className="py-3 px-3 text-center font-mono">{item.pelaksanaTotal} Orang</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(item.totalNominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right text-slate-900">TOTAL SELURUH KEGIATAN:</td>
                  <td className="py-3 px-3 text-center font-mono">
                    {rekapKegiatan.reduce((acc, curr) => acc + curr.count, 0)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    {rekapKegiatan.reduce((acc, curr) => acc + curr.pelaksanaTotal, 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                    {formatRupiah(rekapKegiatan.reduce((acc, curr) => acc + curr.totalNominal, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: REKAP PER PELAKSANA & URAIAN */}
      {activeSubTab === 'pelaksana' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">
              Rekapitulasi Dinas per Personel & Riwayat Uraian
            </h3>
            <p className="text-xs text-slate-500">
              Frekuensi dinas masing-masing pegawai dan daftar maksud kegiatan yang diikuti.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-4">Nama Pelaksana & NIP</th>
                  <th className="py-3 px-4">Jabatan & Pangkat</th>
                  <th className="py-3 px-3 text-center">Frekuensi Tugas</th>
                  <th className="py-3 px-4">Daftar Uraian Maksud Dinas</th>
                  <th className="py-3 px-4 text-right">Estimasi Belanja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapPelaksana.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 align-top">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{item.nama}</span>
                      <span className="font-mono text-[11px] text-slate-500">NIP. {item.nip}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{item.jabatan}</span>
                      <span className="text-[10px] text-slate-400">{item.golongan}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {item.count}x
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                        {item.daftarUraian.map((u, i) => (
                          <li key={i} className="line-clamp-2">
                            <span className="font-semibold text-slate-800">[{u.bulan}]</span> {u.uraian}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(item.totalNominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: REKAP PER BULAN (12 BULAN MATRIX) */}
      {activeSubTab === 'bulan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Matriks Realisasi Perjalanan Dinas 12 Bulan (T.A. 2026)
              </h3>
              <p className="text-xs text-slate-500">
                Pagu Total: {formatRupiah(paguAnggaran)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Total Terserap:</span>
              <span className="font-mono font-bold text-slate-900 block text-sm">
                {formatRupiah(rekapBulan[11]?.realisasiKumulatif || 0)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-4">Bulan</th>
                  <th className="py-3 px-3 text-center">Jml Perjalanan</th>
                  <th className="py-3 px-3 text-center">Jml Personil</th>
                  <th className="py-3 px-4 text-right">Realisasi Bulan Ini</th>
                  <th className="py-3 px-4 text-right">Realisasi Kumulatif</th>
                  <th className="py-3 px-4 text-right">Sisa Pagu</th>
                  <th className="py-3 px-3 text-center">% Serapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapBulan.map((row) => (
                  <tr key={row.bulan} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{row.no}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.bulan}</td>
                    <td className="py-3 px-3 text-center font-mono">{row.jumlahPerjalanan}</td>
                    <td className="py-3 px-3 text-center font-mono">{row.jumlahPersonil}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      {formatRupiah(row.realisasiBulan)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(row.realisasiKumulatif)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">
                      {formatRupiah(row.sisaPagu)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      {row.serapanPersen.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
