import * as XLSX from 'xlsx';
import { PerjalananDinas } from '../types/perjadin';

export function exportPerjalananToExcel(data: PerjalananDinas[], filename = 'SMPD_Perjalanan_Dinas_2026.xlsx') {
  // 1. Sheet Utama: Detail Database
  const detailRows = data.map((item, idx) => {
    const pelaksanaNames = item.pelaksana.map((p) => p.nama).join(', ');
    const pelaksanaNIPs = item.pelaksana.map((p) => p.nip).join(', ');
    const pelaksanaJabatans = item.pelaksana.map((p) => p.jabatan).join(', ');
    const pelaksanaGols = item.pelaksana.map((p) => p.golongan || '-').join(', ');
    const sp2dNums = item.sp2dList.map((s) => s.nomor).join(', ');
    const sppdNums = item.sppdList.map((s) => s.nomor).join(', ');

    const sumCost = (arr: { jumlah: number }[] | undefined) =>
      (arr || []).reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
    const flightTotal = (item.penerbangan || []).reduce((acc, curr) => acc + (Number(curr.hargaTiket) || 0), 0);

    return {
      No: idx + 1,
      ID: item.id,
      Bulan: item.bulan,
      Tahun: item.tahun,
      'Kode Rekening Kegiatan': item.kodeRekeningKegiatan,
      'Kode Rekening Belanja': item.kodeRekeningBelanja,
      'Uraian Maksud Dinas': item.uraian,
      Kegiatan: item.kegiatan,
      'Sub Kegiatan': item.subKegiatan,
      SKPD: item.skpd,
      'Kantor / Tempat Tujuan': item.namaKantorTujuan,
      'Kota / Kab Tujuan': item.kotaTujuan,
      'Nama Pelaksana': pelaksanaNames,
      'NIP Pelaksana': pelaksanaNIPs,
      Jabatan: pelaksanaJabatans,
      'Gol / Pangkat': pelaksanaGols,
      'Uang Harian (Rp)': sumCost(item.uangHarian),
      'Representasi (Rp)': sumCost(item.representasi),
      'Uang Saku (Rp)': sumCost(item.uangSakuPeserta),
      'Penginapan (Rp)': sumCost(item.penginapan),
      'Tiket / E-Tol (Rp)': Number(item.tiketETol?.jumlah) || 0,
      'Transport Asal (Rp)': sumCost(item.transportKotaAsal),
      'Transport Tujuan (Rp)': sumCost(item.transportKotaTujuan),
      'Sewa Kendaraan (Rp)': sumCost(item.sewaKendaraan),
      'BBM (Rp)': Number(item.bbm?.jumlahManual) || 0,
      'Penerbangan (Rp)': flightTotal,
      'Jumlah Total (Rp)': Number(item.jumlahTotal) || 0,
      'Nomor SP2D': sp2dNums,
      'Nomor SPPD': sppdNums,
      'Lama (Hari)': item.lamaPerjalananHari,
      'Tgl Berangkat': item.tanggalBerangkat,
      'Tgl Kembali': item.tanggalKembali,
      'Nama Hotel': item.namaHotel,
      'Tgl Pembayaran': item.tanggalPembayaran,
      Keterangan: item.keterangan,
      Status: item.statusApproval,
    };
  });

  const wb = XLSX.utils.book_new();

  // Detail Sheet
  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Database Perjadin');

  // 2. Sheet Rekap Bulanan
  const monthlyMap: Record<string, { count: number; total: number }> = {};
  const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  bulanList.forEach((b) => {
    monthlyMap[b] = { count: 0, total: 0 };
  });

  data.forEach((d) => {
    if (monthlyMap[d.bulan]) {
      monthlyMap[d.bulan].count += 1;
      monthlyMap[d.bulan].total += Number(d.jumlahTotal) || 0;
    }
  });

  const monthlyRows = bulanList.map((b, i) => ({
    No: i + 1,
    Bulan: b,
    'Jumlah Perjalanan': monthlyMap[b].count,
    'Realisasi (Rp)': monthlyMap[b].total,
  }));
  const wsMonth = XLSX.utils.json_to_sheet(monthlyRows);
  XLSX.utils.book_append_sheet(wb, wsMonth, 'Rekap Bulanan');

  // 3. Sheet Rekap Pelaksana
  const pelaksanaMap: Record<string, { nip: string; jabatan: string; count: number; total: number }> = {};
  data.forEach((d) => {
    const totalPerPerson = d.pelaksana.length > 0 ? (d.jumlahTotal / d.pelaksana.length) : d.jumlahTotal;
    d.pelaksana.forEach((p) => {
      if (!pelaksanaMap[p.nama]) {
        pelaksanaMap[p.nama] = { nip: p.nip, jabatan: p.jabatan, count: 0, total: 0 };
      }
      pelaksanaMap[p.nama].count += 1;
      pelaksanaMap[p.nama].total += totalPerPerson;
    });
  });

  const pelaksanaRows = Object.keys(pelaksanaMap).map((nama, idx) => ({
    No: idx + 1,
    Nama: nama,
    NIP: pelaksanaMap[nama].nip,
    Jabatan: pelaksanaMap[nama].jabatan,
    'Frekuensi Dinas': pelaksanaMap[nama].count,
    'Estimasi Total Biaya (Rp)': Math.round(pelaksanaMap[nama].total),
  }));
  const wsPelaksana = XLSX.utils.json_to_sheet(pelaksanaRows);
  XLSX.utils.book_append_sheet(wb, wsPelaksana, 'Rekap Pelaksana');

  // Trigger download
  XLSX.writeFile(wb, filename);
}
