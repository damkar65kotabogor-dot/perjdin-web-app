import React from 'react';
import { PerjalananDinas } from '../types/perjadin';
import { 
  formatRupiah, 
  formatDateIndo, 
  terbilang 
} from '../utils/formatters';
import { 
  X, 
  Printer, 
  Edit3, 
  MapPin, 
  Building2, 
  Calendar, 
  Users, 
  FileCheck, 
  Plane, 
  CreditCard, 
  Fuel, 
  CheckCircle2,
  Tag
} from 'lucide-react';

interface PerjalananDetailModalProps {
  item: PerjalananDinas | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: PerjalananDinas) => void;
  onPrint: (item: PerjalananDinas) => void;
}

export const PerjalananDetailModal: React.FC<PerjalananDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onPrint,
}) => {
  if (!isOpen || !item) return null;

  const sumCost = (arr: { jumlah: number }[] | undefined) =>
    (arr || []).reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Rincian Transaksi Perjalanan Dinas
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-sm font-mono">
                {item.id}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight mt-0.5">
              {item.uraian}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(item)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Quick Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Realisasi</span>
              <span className="text-sm sm:text-base font-bold font-mono text-slate-900 tabular-nums">
                {formatRupiah(item.jumlahTotal)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kota Tujuan</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {item.kotaTujuan}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lama & Jadwal</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                {item.lamaPerjalananHari} Hari ({formatDateIndo(item.tanggalBerangkat)})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jumlah Pelaksana</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">
                {item.pelaksana.length} Personel
              </span>
            </div>
          </div>

          {/* 1. INFORMASI ANGGARAN & KEGIATAN */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>1. Informasi Anggaran & Kegiatan</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 text-[11px] block">Bulan & Tahun</span>
                <span className="font-semibold text-slate-800">{item.bulan} {item.tahun}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Kode Rekening Kegiatan</span>
                <span className="font-mono font-medium text-slate-800">{item.kodeRekeningKegiatan || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Kode Rekening Belanja</span>
                <span className="font-mono font-medium text-slate-800">{item.kodeRekeningBelanja || '-'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[11px] block">Program / Kegiatan</span>
                <span className="font-medium text-slate-800">{item.kegiatan || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Sub Kegiatan</span>
                <span className="font-medium text-slate-800">{item.subKegiatan || '-'}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-slate-400 text-[11px] block">Uraian Maksud Dinas</span>
              <p className="font-medium text-slate-900 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {item.uraian}
              </p>
            </div>
          </div>

          {/* 2. DATA PELAKSANA & TUJUAN */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Data Pelaksana ({item.pelaksana.length} Orang) & Tempat Tujuan</span>
              </h3>
              <span className="text-[11px] text-slate-500">{item.skpd}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Tempat / Kantor Tujuan</span>
                <span className="font-semibold text-slate-800">{item.namaKantorTujuan || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Kota / Kabupaten</span>
                <span className="font-semibold text-slate-800">{item.kotaTujuan}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {item.pelaksana.map((p, idx) => (
                <div key={p.id || idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 block">{p.nama}</span>
                      <span className="text-slate-400 font-mono text-[11px]">NIP. {p.nip || '-'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-slate-700 block">{p.jabatan}</span>
                    {p.golongan && <span className="text-slate-400 text-[10px]">{p.golongan}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-11. RINCIAN KOMPONEN BIAYA */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>3-11. Rincian Seluruh Komponen Biaya</span>
            </h3>

            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 text-[11px]">
                <tr>
                  <th className="py-2 px-3">Komponen Biaya</th>
                  <th className="py-2 px-3">Hari / Qty</th>
                  <th className="py-2 px-3">Satuan</th>
                  <th className="py-2 px-3 text-right">Harga Satuan</th>
                  <th className="py-2 px-3 text-right">Jumlah Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 3. Uang Harian */}
                {item.uangHarian.map((uh) => (
                  <tr key={uh.id}>
                    <td className="py-2 px-3 font-medium">Uang Harian {uh.keterangan ? `(${uh.keterangan})` : ''}</td>
                    <td className="py-2 px-3 font-mono">{uh.hari}</td>
                    <td className="py-2 px-3">{uh.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(uh.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(uh.jumlah)}</td>
                  </tr>
                ))}

                {/* 4. Representasi */}
                {item.representasi.map((rep) => (
                  <tr key={rep.id}>
                    <td className="py-2 px-3 font-medium">Representasi {rep.keterangan ? `(${rep.keterangan})` : ''}</td>
                    <td className="py-2 px-3 font-mono">{rep.hari}</td>
                    <td className="py-2 px-3">{rep.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(rep.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(rep.jumlah)}</td>
                  </tr>
                ))}

                {/* 5. Uang Saku Peserta */}
                {item.uangSakuPeserta.map((usp) => (
                  <tr key={usp.id}>
                    <td className="py-2 px-3 font-medium">Uang Saku Peserta {usp.keterangan ? `(${usp.keterangan})` : ''}</td>
                    <td className="py-2 px-3 font-mono">{usp.hari}</td>
                    <td className="py-2 px-3">{usp.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(usp.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(usp.jumlah)}</td>
                  </tr>
                ))}

                {/* 6. Penginapan */}
                {item.penginapan.map((png) => (
                  <tr key={png.id}>
                    <td className="py-2 px-3 font-medium">Penginapan {png.keterangan ? `(${png.keterangan})` : ''}</td>
                    <td className="py-2 px-3 font-mono">{png.hari}</td>
                    <td className="py-2 px-3">{png.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(png.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(png.jumlah)}</td>
                  </tr>
                ))}

                {/* 7. Tiket / E-Tol */}
                {(item.tiketETol?.jumlah > 0 || item.tiketETol?.pulang > 0) && (
                  <tr>
                    <td className="py-2 px-3 font-medium">
                      Tiket / E-Tol (Pergi: {formatRupiah(item.tiketETol.pergi)} + Pulang: {formatRupiah(item.tiketETol.pulang)})
                    </td>
                    <td className="py-2 px-3 font-mono">1</td>
                    <td className="py-2 px-3">PP</td>
                    <td className="py-2 px-3 text-right font-mono">-</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(item.tiketETol.jumlah)}</td>
                  </tr>
                )}

                {/* 8. Kota Asal */}
                {item.transportKotaAsal.map((tka) => (
                  <tr key={tka.id}>
                    <td className="py-2 px-3 font-medium">Transportasi Kota Asal {tka.keterangan ? `(${tka.keterangan})` : ''}</td>
                    <td className="py-2 px-3 font-mono">{tka.hari}</td>
                    <td className="py-2 px-3">{tka.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(tka.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(tka.jumlah)}</td>
                  </tr>
                ))}

                {/* 9. Kota Tujuan */}
                {item.transportKotaTujuan.map((tkt) => (
                  <tr key={tkt.id}>
                    <td className="py-2 px-3 font-medium">Transportasi Kota Tujuan {tkt.keterangan ? `(${tkt.keterangan})` : ''}</td>
                    <td className="py-2 px-3 font-mono">{tkt.hari}</td>
                    <td className="py-2 px-3">{tkt.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(tkt.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(tkt.jumlah)}</td>
                  </tr>
                ))}

                {/* 10. Sewa Kendaraan */}
                {item.sewaKendaraan.map((sk) => (
                  <tr key={sk.id}>
                    <td className="py-2 px-3 font-medium">Sewa Kendaraan {sk.keterangan ? `(${sk.keterangan})` : ''}</td>
                    <td className="py-2 px-3 font-mono">{sk.hari}</td>
                    <td className="py-2 px-3">{sk.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(sk.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(sk.jumlah)}</td>
                  </tr>
                ))}

                {/* 11. BBM */}
                {(item.bbm?.jumlahManual > 0 || item.bbm?.liter > 0) && (
                  <tr>
                    <td className="py-2 px-3 font-medium">
                      Bahan Bakar Minyak (BBM) ({item.bbm.liter} {item.bbm.satuan} @ {formatRupiah(item.bbm.harga)})
                    </td>
                    <td className="py-2 px-3 font-mono">{item.bbm.liter}</td>
                    <td className="py-2 px-3">{item.bbm.satuan}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(item.bbm.harga)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(item.bbm.jumlahManual)}</td>
                  </tr>
                )}

                {/* Penerbangan */}
                {item.penerbangan.map((fl) => (
                  <tr key={fl.id}>
                    <td className="py-2 px-3 font-medium">
                      Tiket Pesawat {fl.maskapai} ({fl.arah} - {fl.asalDaerah} ke {fl.tujuan})
                    </td>
                    <td className="py-2 px-3 font-mono">1</td>
                    <td className="py-2 px-3">Tiket</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(fl.hargaTiket)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRupiah(fl.hargaTiket)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="py-2.5 px-3 text-right">
                    12. JUMLAH TOTAL BIAYA:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm">
                    {formatRupiah(item.jumlahTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px] italic">
              Terbilang: <span className="font-semibold text-slate-800">{terbilang(item.jumlahTotal)}</span>
            </div>
          </div>

          {/* 13-21. ADMINISTRASI, DOKUMEN & PENERBANGAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SPPD & SP2D */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>13-14. Dokumen SPPD & SP2D</span>
              </h3>
              <div>
                <span className="text-slate-400 text-[11px] block">Surat Perintah Perjalanan Dinas (SPPD)</span>
                <div className="space-y-1 mt-1">
                  {item.sppdList.map((s, idx) => (
                    <div key={idx} className="font-mono text-xs flex justify-between bg-slate-50 p-1.5 rounded">
                      <span className="font-semibold text-slate-800">{s.nomor}</span>
                      <span className="text-slate-500">{formatDateIndo(s.tanggal)}</span>
                    </div>
                  ))}
                  {item.sppdList.length === 0 && <span className="text-slate-400">-</span>}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 text-[11px] block">Surat Perintah Pencairan Dana (SP2D)</span>
                <div className="space-y-1 mt-1">
                  {item.sp2dList.map((s, idx) => (
                    <div key={idx} className="font-mono text-xs flex justify-between bg-slate-50 p-1.5 rounded">
                      <span className="font-semibold text-slate-800">{s.nomor}</span>
                      <span className="text-slate-500">{formatDateIndo(s.tanggal)}</span>
                    </div>
                  ))}
                  {item.sp2dList.length === 0 && <span className="text-slate-400">-</span>}
                </div>
              </div>
            </div>

            {/* Hotel, Tanggal Bayar, Keterangan */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>19-21. Hotel & Pembayaran</span>
              </h3>

              <div>
                <span className="text-slate-400 text-[11px] block">Nama Hotel</span>
                <span className="font-semibold text-slate-900">{item.namaHotel || '-'}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Tanggal Pembayaran</span>
                <span className="font-semibold text-slate-900">{formatDateIndo(item.tanggalPembayaran)}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Keterangan</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                  {item.keterangan || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Terakhir diubah: {formatDateIndo(item.updatedAt.slice(0, 10))}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
