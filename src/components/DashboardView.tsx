import React, { useMemo, useState } from 'react';
import { PerjalananDinas } from '../types/perjadin';
import { 
  formatRupiah, 
  formatRupiahShort, 
  formatNumber, 
  PAGU_ANGGARAN_DEFAULT, 
  NAMA_BULAN 
} from '../utils/formatters';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  MapPin, 
  Calendar, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2,
  Users
} from 'lucide-react';

interface DashboardViewProps {
  data: PerjalananDinas[];
  paguAnggaran?: number;
  onOpenNewPerjadin: () => void;
  onNavigateToTable: (filterMonth?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  paguAnggaran = PAGU_ANGGARAN_DEFAULT,
  onOpenNewPerjadin,
  onNavigateToTable,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Filter data by year
  const filteredData = useMemo(() => {
    return data.filter((d) => d.tahun === selectedYear);
  }, [data, selectedYear]);

  // Aggregate metrics
  const totalRealisasi = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (Number(curr.jumlahTotal) || 0), 0);
  }, [filteredData]);

  const sisaAnggaran = Math.max(0, paguAnggaran - totalRealisasi);
  const persentaseSerapan = paguAnggaran > 0 ? (totalRealisasi / paguAnggaran) * 100 : 0;

  // 1. Kota yang paling sering dikunjungi
  const kotaStats = useMemo(() => {
    const map: Record<string, { count: number; totalNominal: number }> = {};
    filteredData.forEach((d) => {
      const kota = d.kotaTujuan || 'Lainnya';
      if (!map[kota]) {
        map[kota] = { count: 0, totalNominal: 0 };
      }
      map[kota].count += 1;
      map[kota].totalNominal += Number(d.jumlahTotal) || 0;
    });

    return Object.entries(map)
      .map(([kota, stat]) => ({
        kota,
        count: stat.count,
        nominal: stat.totalNominal,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // 2. Realisasi Bulanan (Januari s.d. Desember)
  const monthlyStats = useMemo(() => {
    const map: Record<string, { nominal: number; count: number }> = {};
    NAMA_BULAN.forEach((m) => {
      map[m] = { nominal: 0, count: 0 };
    });

    filteredData.forEach((d) => {
      if (map[d.bulan]) {
        map[d.bulan].nominal += Number(d.jumlahTotal) || 0;
        map[d.bulan].count += 1;
      }
    });

    return NAMA_BULAN.map((m, idx) => ({
      bulan: m,
      singkatan: m.substring(0, 3),
      bulanIndex: idx + 1,
      nominal: map[m].nominal,
      count: map[m].count,
    }));
  }, [filteredData]);

  const maxMonthlyNominal = useMemo(() => {
    const max = Math.max(...monthlyStats.map((m) => m.nominal), 1);
    return max;
  }, [monthlyStats]);

  // 3. Proporsi Pengeluaran Komponen Biaya
  const costBreakdown = useMemo(() => {
    let uangHarian = 0;
    let representasi = 0;
    let uangSaku = 0;
    let penginapan = 0;
    let tiketETol = 0;
    let transportAsal = 0;
    let transportTujuan = 0;
    let sewaKendaraan = 0;
    let bbm = 0;
    let penerbangan = 0;

    const sumCost = (arr: { jumlah: number }[] | undefined) =>
      (arr || []).reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);

    filteredData.forEach((d) => {
      uangHarian += sumCost(d.uangHarian);
      representasi += sumCost(d.representasi);
      uangSaku += sumCost(d.uangSakuPeserta);
      penginapan += sumCost(d.penginapan);
      tiketETol += Number(d.tiketETol?.jumlah) || 0;
      transportAsal += sumCost(d.transportKotaAsal);
      transportTujuan += sumCost(d.transportKotaTujuan);
      sewaKendaraan += sumCost(d.sewaKendaraan);
      bbm += Number(d.bbm?.jumlahManual) || 0;
      penerbangan += (d.penerbangan || []).reduce((acc, curr) => acc + (Number(curr.hargaTiket) || 0), 0);
    });

    const totalCalculated =
      uangHarian +
      representasi +
      uangSaku +
      penginapan +
      tiketETol +
      transportAsal +
      transportTujuan +
      sewaKendaraan +
      bbm +
      penerbangan;

    const items = [
      { label: 'Uang Harian', value: uangHarian, color: '#0284c7' }, // sky-600
      { label: 'Penginapan / Hotel', value: penginapan, color: '#0d9488' }, // teal-600
      { label: 'Penerbangan', value: penerbangan, color: '#4f46e5' }, // indigo-600
      { label: 'BBM & Kendaraan', value: bbm + sewaKendaraan, color: '#d97706' }, // amber-600
      { label: 'Transportasi & E-Tol', value: tiketETol + transportAsal + transportTujuan, color: '#059669' }, // emerald-600
      { label: 'Representasi & Saku', value: representasi + uangSaku, color: '#64748b' }, // slate-500
    ].filter((item) => item.value > 0);

    return {
      total: totalCalculated || 1,
      items,
    };
  }, [filteredData]);

  // Total unique pelaksana
  const totalPelaksanaCount = useMemo(() => {
    const set = new Set<string>();
    filteredData.forEach((d) => {
      d.pelaksana.forEach((p) => set.add(p.nama.trim().toLowerCase()));
    });
    return set.size;
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pemerintah Daerah · E-Perjalanan Dinas
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Dashboard Manajemen Perjalanan Dinas (SMPD)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau pagu DPA, realisasi belanja dinas, serapan anggaran, dan distribusi kota tujuan secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedYear(2026)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedYear === 2026
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TA 2026
            </button>
            <button
              onClick={() => setSelectedYear(2025)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedYear === 2025
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TA 2025
            </button>
          </div>

          <button
            onClick={onOpenNewPerjadin}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>+ Tambah Perjadin</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Pagu, Realisasi, Sisa Anggaran, Persentase Serapan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pagu Anggaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>PAGU ANGGARAN</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatRupiah(paguAnggaran)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">DPA SKPD</span>
            <span>·</span>
            <span>Tahun Anggaran {selectedYear}</span>
          </div>
        </div>

        {/* Card 2: Realisasi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>REALISASI BELANJA</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatRupiah(totalRealisasi)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{filteredData.length} Surat Perintah Tugas</span>
            <span className="font-medium text-slate-700">{totalPelaksanaCount} Personel</span>
          </div>
        </div>

        {/* Card 3: Sisa Anggaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>SISA ANGGARAN</span>
            <PieChart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {formatRupiah(sisaAnggaran)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sisa Kuota:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {(100 - persentaseSerapan).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 4: Persentase Serapan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>PERSENTASE SERAPAN</span>
            <span className="text-xs font-bold text-slate-800 font-mono">
              {persentaseSerapan.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {persentaseSerapan.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-500">terserap</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                persentaseSerapan > 90
                  ? 'bg-rose-500'
                  : persentaseSerapan > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, persentaseSerapan)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: 2 Grafik Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik 1: Realisasi Bulanan (dengan nominal/jumlah di atas grafik) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Realisasi Bulanan (Januari - Desember)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nominal dan jumlah perjalanan dinas yang terlaksana per bulan.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="inline-block w-3 h-3 rounded-xs bg-slate-900"></span>
                <span>Realisasi (Rp)</span>
              </div>
            </div>

            {/* Custom Bar Chart with Exact Nominal displayed above each bar */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3 items-end min-h-[220px]">
                {monthlyStats.map((item) => {
                  const heightPercent = maxMonthlyNominal > 0 ? (item.nominal / maxMonthlyNominal) * 100 : 0;
                  const hasData = item.nominal > 0;

                  return (
                    <div
                      key={item.bulan}
                      onClick={() => onNavigateToTable(item.bulan)}
                      className="group flex flex-col items-center justify-end h-full cursor-pointer transition-all"
                      title={`${item.bulan}: ${formatRupiah(item.nominal)} (${item.count} Perjadin)`}
                    >
                      {/* Nominal / Jumlah Tampil di Atas Grafik */}
                      <div className="text-[10px] font-mono tabular-nums text-slate-600 group-hover:text-slate-900 font-semibold mb-1 text-center whitespace-nowrap overflow-visible">
                        {hasData ? (
                          <span className="block scale-90 sm:scale-100">
                            {formatRupiahShort(item.nominal).replace('Rp ', '')}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </div>

                      {/* Bar Pillar */}
                      <div className="w-full bg-slate-100 rounded-t-md h-40 flex items-end p-0.5 group-hover:bg-slate-200 transition-colors">
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            hasData ? 'bg-slate-900 group-hover:bg-emerald-600' : 'bg-transparent'
                          }`}
                          style={{
                            height: `${Math.max(hasData ? 12 : 0, heightPercent)}%`,
                          }}
                        />
                      </div>

                      {/* Month Label */}
                      <span className="mt-2 text-[11px] font-medium text-slate-600 group-hover:text-slate-900">
                        {item.singkatan}
                      </span>
                      {hasData && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          {item.count}x
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>*Klik pada salah satu batang bulan untuk melihat rincian di tabel</span>
            <span className="font-mono font-medium text-slate-700">
              Total 12 Bulan: {formatRupiah(totalRealisasi)}
            </span>
          </div>
        </div>

        {/* Grafik 2: Proporsi Pengeluaran Komponen Biaya */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Proporsi Komponen Biaya</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alokasi dana per pos belanja perjalanan dinas.
              </p>
            </div>

            <div className="py-4 space-y-3">
              {costBreakdown.items.map((c) => {
                const percent = (c.value / costBreakdown.total) * 100;
                return (
                  <div key={c.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{c.label}</span>
                      <span className="font-mono tabular-nums text-slate-900 font-semibold">
                        {formatRupiah(c.value)}
                        <span className="text-slate-400 text-[11px] ml-1">
                          ({percent.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    {/* Visual Segment */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {costBreakdown.items.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Belum ada komponen biaya tercatat.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Total Komponen:</span>
            <span className="font-bold text-slate-900">
              {formatRupiah(totalRealisasi)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Card Tambahan - Kota Yang Paling Sering Dikunjungi & Ringkasan Dokumen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik 3: Kota Yang Paling Sering Dikunjungi (dengan nominal dan frekuensi) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kota Tujuan Terbanyak</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frekuensi kunjungan dinas dan total nominal belanja perjalanan.
              </p>
            </div>
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>

          <div className="py-3 divide-y divide-slate-100">
            {kotaStats.slice(0, 6).map((item, idx) => {
              const maxCount = kotaStats[0]?.count || 1;
              const barWidth = (item.count / maxCount) * 100;

              return (
                <div key={item.kota} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {item.kota}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-mono">
                        {item.count} Kunjungan
                      </span>
                    </div>
                    {/* Nominal di atas/samping grafik kota */}
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatRupiah(item.nominal)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {kotaStats.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada data perjalanan dinas tercatat.
              </div>
            )}
          </div>
        </div>

        {/* Ringkasan Status & Quick Actions */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Kelengkapan Administrasi</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standar kepatuhan SP2D, SPPD, dan pertanggungjawaban.
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="py-4 space-y-3.5">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    SPPD
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Surat Perintah Perjalanan Dinas</span>
                    <span className="text-[11px] text-slate-500">Tersinkron dengan pelaksana</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-slate-900">
                  {filteredData.reduce((acc, curr) => acc + (curr.sppdList?.length || 0), 0)} Dokumen
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                    SP2D
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Surat Perintah Pencairan Dana</span>
                    <span className="text-[11px] text-slate-500">Pencairan LS / Perjadin</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-slate-900">
                  {filteredData.reduce((acc, curr) => acc + (curr.sp2dList?.length || 0), 0)} Dokumen
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                    TIKET
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Penerbangan & Transportasi</span>
                    <span className="text-[11px] text-slate-500">Tiket pesawat & toll</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-slate-900">
                  {filteredData.reduce((acc, curr) => acc + (curr.penerbangan?.length || 0), 0)} Penerbangan
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTable()}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Lihat Seluruh Riwayat di Tabel Perjadin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
