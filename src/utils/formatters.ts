import { PerjalananDinas } from '../types/perjadin';

export const PAGU_ANGGARAN_DEFAULT = 487742310; // Rp487.742.310

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatRupiah(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatRupiahShort(num: number): string {
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(2).replace('.', ',')} M`;
  }
  if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1).replace('.', ',')} Jt`;
  }
  if (num >= 1000) {
    return `Rp ${(num / 1000).toFixed(0)} Rb`;
  }
  return formatRupiah(num);
}

export function formatDateIndo(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${NAMA_BULAN[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function calculateTotalBiaya(p: Partial<PerjalananDinas>): number {
  const sumItems = (items: { jumlah: number }[] | undefined) =>
    (items || []).reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);

  const uangHarian = sumItems(p.uangHarian);
  const representasi = sumItems(p.representasi);
  const uangSaku = sumItems(p.uangSakuPeserta);
  const penginapan = sumItems(p.penginapan);
  const tiketETol = Number(p.tiketETol?.jumlah) || (Number(p.tiketETol?.pulang) || 0) + (Number(p.tiketETol?.pergi) || 0);
  const kotaAsal = sumItems(p.transportKotaAsal);
  const kotaTujuan = sumItems(p.transportKotaTujuan);
  const sewaKendaraan = sumItems(p.sewaKendaraan);
  const bbm = Number(p.bbm?.jumlahManual) || ((Number(p.bbm?.liter) || 0) * (Number(p.bbm?.harga) || 0));
  const penerbangan = (p.penerbangan || []).reduce((acc, curr) => acc + (Number(curr.hargaTiket) || 0), 0);

  return (
    uangHarian +
    representasi +
    uangSaku +
    penginapan +
    tiketETol +
    kotaAsal +
    kotaTujuan +
    sewaKendaraan +
    bbm +
    penerbangan
  );
}

export function terbilang(n: number): string {
  if (isNaN(n) || n === 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  function convert(x: number): string {
    x = Math.floor(x);
    if (x < 12) return satuan[x];
    if (x < 20) return convert(x - 10) + ' Belas';
    if (x < 100) return convert(Math.floor(x / 10)) + ' Puluh ' + convert(x % 10);
    if (x < 200) return 'Seratus ' + convert(x - 100);
    if (x < 1000) return convert(Math.floor(x / 100)) + ' Ratus ' + convert(x % 100);
    if (x < 2000) return 'Seribu ' + convert(x - 1000);
    if (x < 1000000) return convert(Math.floor(x / 1000)) + ' Ribu ' + convert(x % 1000);
    if (x < 1000000000) return convert(Math.floor(x / 1000000)) + ' Juta ' + convert(x % 1000000);
    if (x < 1000000000000) return convert(Math.floor(x / 1000000000)) + ' Miliar ' + convert(x % 1000000000);
    return convert(Math.floor(x / 1000000000000)) + ' Triliun ' + convert(x % 1000000000000);
  }

  const result = convert(Math.abs(n)).replace(/\s+/g, ' ').trim();
  return `${result} Rupiah`;
}
