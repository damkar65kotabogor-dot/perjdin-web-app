export interface Pelaksana {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  golongan?: string; // Gol/Pangkat (opsional)
}

export interface CostItem {
  id: string;
  hari: number;
  satuan: string; // e.g. OH, Hari, Malam, Kali
  harga: number;
  jumlah: number; // hari * harga or direct
  keterangan?: string;
}

export interface TiketETol {
  pulang: number;
  pergi: number;
  jumlah: number;
}

export interface BBMItem {
  liter: number;
  satuan: string;
  harga: number;
  jumlahManual: number;
}

export interface SPDoc {
  id: string;
  nomor: string;
  tanggal: string;
}

export interface Penerbangan {
  id: string;
  arah: 'Berangkat' | 'Pulang';
  maskapai: string;
  namaPenumpang: string;
  noTiket: string;
  kodeBooking: string;
  noPenerbangan: string;
  asalDaerah: string;
  tujuan: string;
  tanggal: string;
  kelas: string;
  hargaTiket: number;
}

export interface PerjalananItinerary {
  id: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  lamaHari: number;
  keterangan?: string;
}

export interface PerjalananDinas {
  id: string;
  // 1. Informasi Anggaran & Kegiatan
  bulan: string; // Januari, Februari, ...
  tahun: number;
  kodeRekeningKegiatan: string;
  kodeRekeningBelanja: string;
  uraian: string;
  kegiatan: string;
  subKegiatan: string;

  // 2. Data Pelaksana & Tujuan
  pelaksana: Pelaksana[];
  skpd: string;
  namaKantorTujuan: string;
  kotaTujuan: string;

  // 3. Uang Harian
  uangHarian: CostItem[];

  // 4. Representasi
  representasi: CostItem[];

  // 5. Uang Saku Peserta
  uangSakuPeserta: CostItem[];

  // 6. Penginapan
  penginapan: CostItem[];

  // 7. Tiket / E-Tol
  tiketETol: TiketETol;

  // 8. Kota Asal
  transportKotaAsal: CostItem[];

  // 9. Kota Tujuan
  transportKotaTujuan: CostItem[];

  // 10. Sewa Kendaraan
  sewaKendaraan: CostItem[];

  // 11. BBM
  bbm: BBMItem;

  // 12. Jumlah Total (calculated)
  jumlahTotal: number;

  // 13. SP2D
  sp2dList: SPDoc[];

  // 14. SPPD
  sppdList: SPDoc[];

  // 15, 16, 17. Tanggal & Lama Perjalanan
  lamaPerjalananHari: number;
  tanggalBerangkat: string;
  tanggalKembali: string;
  itineraryList?: PerjalananItinerary[];

  // 18. Penerbangan
  penerbangan: Penerbangan[];

  // 19. Hotel
  namaHotel: string;

  // 20. Tanggal Pembayaran
  tanggalPembayaran: string;

  // 21. Keterangan
  keterangan: string;

  // Status & Timestamps
  statusApproval: 'Disetujui' | 'Draft' | 'Diajukan';
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  username: string;
  name: string;
  role: 'admin' | 'operator';
  isLoggedIn: boolean;
}

export interface FilterState {
  search: string;
  hari: string; // YYYY-MM-DD or empty
  bulan: string; // 'Semua' or 'Januari'..'Desember'
  triwulan: string; // 'Semua' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  tahun: string; // 'Semua' | '2026' | '2025'
  sheetBulan: string; // Active sheet view e.g. 'Semua', 'Januari', 'Februari', etc.
  groupByUraian: boolean;
  mergePelaksana: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'push' | 'pull' | 'test' | 'export';
  status: 'success' | 'failed' | 'pending';
  recordCount: number;
  message: string;
}
