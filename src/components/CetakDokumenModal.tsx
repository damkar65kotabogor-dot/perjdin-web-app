import React, { useState } from 'react';
import { PerjalananDinas } from '../types/perjadin';
import { 
  formatRupiah, 
  formatDateIndo, 
  terbilang 
} from '../utils/formatters';
import { 
  Printer, 
  X, 
  FileText, 
  Receipt, 
  FileCheck 
} from 'lucide-react';

interface CetakDokumenModalProps {
  item: PerjalananDinas | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CetakDokumenModal: React.FC<CetakDokumenModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [docType, setDocType] = useState<'sppd' | 'rincian' | 'kwitansi'>('sppd');

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const pelaksanaUtama = item.pelaksana[0] || {
    nama: '-',
    nip: '-',
    jabatan: '-',
    golongan: '-',
  };

  const pengikut = item.pelaksana.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Format Cetak Dokumen Resmi
            </span>
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setDocType('sppd')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  docType === 'sppd' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Format Lembar SPPD
              </button>
              <button
                onClick={() => setDocType('rincian')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  docType === 'rincian' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Rincian Biaya Riil
              </button>
              <button
                onClick={() => setDocType('kwitansi')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  docType === 'kwitansi' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Kwitansi Pembayaran
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 Simulation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 text-xs leading-normal print-container">
            {/* KOP SURAT PEMERINTAH DAERAH */}
            <div className="text-center pb-3 border-b-2 border-double border-slate-900 mb-6">
              <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider">
                PEMERINTAH DAERAH KOTA BOGOR
              </h4>
              <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight">
                {item.skpd.toUpperCase()}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Jalan Sukasari No. 65 Kota Bogor · Telp/Fax: (0251) 8322113 · Pos: 16142
              </p>
            </div>

            {/* DOKUMEN 1: LEMBAR SPPD RESMI */}
            {docType === 'sppd' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h4 className="font-bold text-sm underline uppercase tracking-wider">
                    SURAT PERINTAH PERJALANAN DINAS (SPPD)
                  </h4>
                  <p className="font-mono text-xs mt-1">
                    Nomor: {item.sppdList[0]?.nomor || '090/....-SPPD/DPKP/2026'}
                  </p>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-xs">
                  <tbody>
                    <tr>
                      <td className="border border-slate-800 p-2 w-8 text-center font-mono font-semibold">1.</td>
                      <td className="border border-slate-800 p-2 w-1/3 font-medium">Pejabat Pembina Kepegawaian / Yang Memberi Perintah</td>
                      <td className="border border-slate-800 p-2 font-semibold">Pengguna Anggaran {item.skpd}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">2.</td>
                      <td className="border border-slate-800 p-2 font-medium">Nama / NIP Pegawai yang diperintahkan</td>
                      <td className="border border-slate-800 p-2">
                        <span className="font-bold block">{pelaksanaUtama.nama}</span>
                        <span className="font-mono text-[11px] text-slate-600">NIP. {pelaksanaUtama.nip || '-'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">3.</td>
                      <td className="border border-slate-800 p-2 font-medium">
                        a. Pangkat dan Golongan<br />
                        b. Jabatan / Instansi<br />
                        c. Tingkat Biaya Perjalanan Dinas
                      </td>
                      <td className="border border-slate-800 p-2">
                        a. {pelaksanaUtama.golongan || '-'}<br />
                        b. {pelaksanaUtama.jabatan} / {item.skpd}<br />
                        c. Tingkat C / Dinas Dalam/Luar Daerah
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">4.</td>
                      <td className="border border-slate-800 p-2 font-medium">Maksud Perjalanan Dinas</td>
                      <td className="border border-slate-800 p-2 leading-relaxed font-medium">
                        {item.uraian}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">5.</td>
                      <td className="border border-slate-800 p-2 font-medium">Alat Angkutan yang dipergunakan</td>
                      <td className="border border-slate-800 p-2">
                        {item.penerbangan.length > 0 ? 'Pesawat Terbang / Kendaraan Dinas' : 'Kendaraan Dinas Operasional / Mobil Pribadi'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">6.</td>
                      <td className="border border-slate-800 p-2 font-medium">
                        a. Tempat Berangkat<br />
                        b. Tempat Tujuan
                      </td>
                      <td className="border border-slate-800 p-2">
                        a. Kota Bogor<br />
                        b. {item.namaKantorTujuan || item.kotaTujuan} ({item.kotaTujuan})
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">7.</td>
                      <td className="border border-slate-800 p-2 font-medium">
                        a. Lamanya Perjalanan Dinas<br />
                        b. Tanggal Berangkat<br />
                        c. Tanggal Harus Kembali
                      </td>
                      <td className="border border-slate-800 p-2">
                        a. {item.lamaPerjalananHari} ({terbilang(item.lamaPerjalananHari).replace(' Rupiah', '')}) hari<br />
                        b. {formatDateIndo(item.tanggalBerangkat)}<br />
                        c. {formatDateIndo(item.tanggalKembali)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">8.</td>
                      <td className="border border-slate-800 p-2 font-medium">Pengikut / Peserta Lainnya</td>
                      <td className="border border-slate-800 p-2">
                        {pengikut.length > 0 ? (
                          <ol className="list-decimal list-inside space-y-1">
                            {pengikut.map((p, i) => (
                              <li key={i}>
                                <span className="font-semibold">{p.nama}</span> - NIP. {p.nip || '-'} ({p.jabatan})
                              </li>
                            ))}
                          </ol>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">9.</td>
                      <td className="border border-slate-800 p-2 font-medium">
                        Pembebanan Anggaran<br />
                        a. Instansi / SKPD<br />
                        b. Kode Rekening Kegiatan<br />
                        c. Kode Rekening Belanja
                      </td>
                      <td className="border border-slate-800 p-2">
                        <br />
                        a. {item.skpd}<br />
                        b. <span className="font-mono">{item.kodeRekeningKegiatan}</span><br />
                        c. <span className="font-mono">{item.kodeRekeningBelanja}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 p-2 text-center font-mono font-semibold">10.</td>
                      <td className="border border-slate-800 p-2 font-medium">Keterangan Lain-lain</td>
                      <td className="border border-slate-800 p-2 leading-relaxed">
                        {item.keterangan || 'Dilaksanakan dengan penuh tanggung jawab sesuai ketentuan peraturan perundang-undangan.'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Tanda Tangan */}
                <div className="pt-8 flex justify-end">
                  <div className="text-center w-64 space-y-14">
                    <div>
                      <p>Dikeluarkan di : Bogor</p>
                      <p>Pada tanggal : {formatDateIndo(item.sppdList[0]?.tanggal || item.tanggalBerangkat)}</p>
                      <p className="font-bold mt-2">PENGGUNA ANGGARAN</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Drs. H. Ade Sarip Hidayat, M.Si</p>
                      <p className="text-[11px] font-mono">NIP. 197108151996031002</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOKUMEN 2: RINCIAN BIAYA RIIL */}
            {docType === 'rincian' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h4 className="font-bold text-sm underline uppercase tracking-wider">
                    RINCIAN BIAYA PERJALANAN DINAS
                  </h4>
                  <p className="font-mono text-xs mt-1">
                    Lampiran SPPD Nomor: {item.sppdList[0]?.nomor || '-'}
                  </p>
                </div>

                <div className="mb-4 text-xs space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="flex">
                    <span className="w-36 font-semibold">Pelaksana Tugas:</span>
                    <span>{pelaksanaUtama.nama} ({pelaksanaUtama.jabatan})</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 font-semibold">Tujuan Dinas:</span>
                    <span>{item.namaKantorTujuan || item.kotaTujuan} ({item.kotaTujuan})</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 font-semibold">Waktu Pelaksanaan:</span>
                    <span>{item.lamaPerjalananHari} Hari ({formatDateIndo(item.tanggalBerangkat)} s.d. {formatDateIndo(item.tanggalKembali)})</span>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-xs">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="border border-slate-800 p-2 w-10 text-center">No</th>
                      <th className="border border-slate-800 p-2">Rincian Komponen Biaya</th>
                      <th className="border border-slate-800 p-2 w-28 text-right">Jumlah (Rp)</th>
                      <th className="border border-slate-800 p-2 w-48">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Uang Harian */}
                    {item.uangHarian.map((uh, i) => (
                      <tr key={i}>
                        <td className="border border-slate-800 p-2 text-center font-mono">1</td>
                        <td className="border border-slate-800 p-2">Uang Harian ({uh.hari} {uh.satuan} x {formatRupiah(uh.harga)})</td>
                        <td className="border border-slate-800 p-2 text-right font-mono">{formatRupiah(uh.jumlah)}</td>
                        <td className="border border-slate-800 p-2">{uh.keterangan || '-'}</td>
                      </tr>
                    ))}

                    {/* Representasi */}
                    {item.representasi.map((r, i) => (
                      <tr key={i}>
                        <td className="border border-slate-800 p-2 text-center font-mono">2</td>
                        <td className="border border-slate-800 p-2">Biaya Representasi ({r.hari} {r.satuan} x {formatRupiah(r.harga)})</td>
                        <td className="border border-slate-800 p-2 text-right font-mono">{formatRupiah(r.jumlah)}</td>
                        <td className="border border-slate-800 p-2">{r.keterangan || '-'}</td>
                      </tr>
                    ))}

                    {/* Penginapan */}
                    {item.penginapan.map((png, i) => (
                      <tr key={i}>
                        <td className="border border-slate-800 p-2 text-center font-mono">3</td>
                        <td className="border border-slate-800 p-2">Biaya Hotel / Penginapan ({png.hari} {png.satuan} x {formatRupiah(png.harga)})</td>
                        <td className="border border-slate-800 p-2 text-right font-mono">{formatRupiah(png.jumlah)}</td>
                        <td className="border border-slate-800 p-2">{item.namaHotel || png.keterangan || '-'}</td>
                      </tr>
                    ))}

                    {/* Tol & BBM */}
                    {(item.tiketETol?.jumlah > 0 || item.bbm?.jumlahManual > 0) && (
                      <tr>
                        <td className="border border-slate-800 p-2 text-center font-mono">4</td>
                        <td className="border border-slate-800 p-2">
                          Biaya Transportasi Darat (BBM & E-Tol)
                        </td>
                        <td className="border border-slate-800 p-2 text-right font-mono">
                          {formatRupiah((item.tiketETol?.jumlah || 0) + (item.bbm?.jumlahManual || 0))}
                        </td>
                        <td className="border border-slate-800 p-2">
                          Tol: {formatRupiah(item.tiketETol?.jumlah || 0)}, BBM: {formatRupiah(item.bbm?.jumlahManual || 0)}
                        </td>
                      </tr>
                    )}

                    {/* Penerbangan */}
                    {item.penerbangan.map((fl, i) => (
                      <tr key={i}>
                        <td className="border border-slate-800 p-2 text-center font-mono">5</td>
                        <td className="border border-slate-800 p-2">
                          Tiket Pesawat {fl.maskapai} ({fl.asalDaerah} - {fl.tujuan})
                        </td>
                        <td className="border border-slate-800 p-2 text-right font-mono">{formatRupiah(fl.hargaTiket)}</td>
                        <td className="border border-slate-800 p-2">Booking: {fl.kodeBooking || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-slate-100">
                      <td colSpan={2} className="border border-slate-800 p-2 text-right">JUMLAH TOTAL</td>
                      <td className="border border-slate-800 p-2 text-right font-mono text-sm">{formatRupiah(item.jumlahTotal)}</td>
                      <td className="border border-slate-800 p-2"></td>
                    </tr>
                  </tfoot>
                </table>

                <p className="text-xs italic bg-slate-50 p-2 rounded border border-slate-200">
                  Terbilang: <span className="font-semibold">{terbilang(item.jumlahTotal)}</span>
                </p>

                {/* Tanda Tangan */}
                <div className="pt-8 grid grid-cols-2 gap-4">
                  <div className="text-center space-y-14">
                    <div>
                      <p>Telah dibayar sejumlah</p>
                      <p className="font-bold font-mono">{formatRupiah(item.jumlahTotal)}</p>
                      <p className="mt-2 font-semibold">Bendahara Pengeluaran,</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Ahmad Fauzi, S.E.</p>
                      <p className="text-[11px] font-mono">NIP. 198506192010011007</p>
                    </div>
                  </div>

                  <div className="text-center space-y-14">
                    <div>
                      <p>Bogor, {formatDateIndo(item.tanggalPembayaran || item.tanggalKembali)}</p>
                      <p>Telah menerima jumlah uang sebesar</p>
                      <p className="font-bold font-mono">{formatRupiah(item.jumlahTotal)}</p>
                      <p className="font-semibold">Yang Menerima,</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{pelaksanaUtama.nama}</p>
                      <p className="text-[11px] font-mono">NIP. {pelaksanaUtama.nip || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOKUMEN 3: KWITANSI PEMBAYARAN */}
            {docType === 'kwitansi' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h4 className="font-bold text-sm underline uppercase tracking-wider">
                    KWITANSI / BUKTI PEMBAYARAN PERJALANAN DINAS
                  </h4>
                  <p className="font-mono text-xs mt-1">
                    No. Bukti / SP2D: {item.sp2dList[0]?.nomor || '00.../SP2D-LS/2026'}
                  </p>
                </div>

                <div className="border border-slate-800 p-6 space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <span className="col-span-3 font-semibold text-slate-700">Sudah Terima Dari:</span>
                    <span className="col-span-9 font-bold">BENDAHARA PENGELUARAN {item.skpd.toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <span className="col-span-3 font-semibold text-slate-700">Uang Sejumlah:</span>
                    <span className="col-span-9 font-bold italic bg-slate-50 p-2 border border-slate-200">
                      == {terbilang(item.jumlahTotal)} ==
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <span className="col-span-3 font-semibold text-slate-700">Untuk Pembayaran:</span>
                    <span className="col-span-9 leading-relaxed">
                      Biaya Perjalanan Dinas dalam rangka: <strong>{item.uraian}</strong> ke {item.namaKantorTujuan || item.kotaTujuan} ({item.kotaTujuan}) selama {item.lamaPerjalananHari} hari pada tanggal {formatDateIndo(item.tanggalBerangkat)} s.d. {formatDateIndo(item.tanggalKembali)}.
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs pt-2">
                    <span className="col-span-3 font-semibold text-slate-700">Kode Rekening Belanja:</span>
                    <span className="col-span-9 font-mono font-medium">{item.kodeRekeningBelanja}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">TERBILANG JUMLAH:</span>
                      <span className="text-lg font-bold font-mono text-slate-900">
                        {formatRupiah(item.jumlahTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tanda Tangan Kwitansi */}
                <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
                  <div className="space-y-16">
                    <div>
                      <p className="font-semibold">Mengetahui/Menyetujui,</p>
                      <p className="font-bold">Pengguna Anggaran</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Drs. H. Ade Sarip Hidayat, M.Si</p>
                      <p className="text-[10px] font-mono">NIP. 197108151996031002</p>
                    </div>
                  </div>

                  <div className="space-y-16">
                    <div>
                      <p className="font-semibold">Lunas Dibayar,</p>
                      <p className="font-bold">Bendahara Pengeluaran</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Ahmad Fauzi, S.E.</p>
                      <p className="text-[10px] font-mono">NIP. 198506192010011007</p>
                    </div>
                  </div>

                  <div className="space-y-16">
                    <div>
                      <p>Bogor, {formatDateIndo(item.tanggalPembayaran || item.tanggalKembali)}</p>
                      <p className="font-bold">Yang Menerima,</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{pelaksanaUtama.nama}</p>
                      <p className="text-[10px] font-mono">NIP. {pelaksanaUtama.nip || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
