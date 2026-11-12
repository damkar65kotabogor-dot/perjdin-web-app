import React, { useState, useEffect } from 'react';
import { 
  PerjalananDinas, 
  Pelaksana, 
  CostItem, 
  Penerbangan, 
  SPDoc, 
  PerjalananItinerary 
} from '../types/perjadin';
import { 
  formatRupiah, 
  calculateTotalBiaya, 
  NAMA_BULAN 
} from '../utils/formatters';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  Users, 
  Plane, 
  Building2, 
  FileCheck, 
  Fuel, 
  CreditCard,
  Calendar,
  Layers,
  MapPin,
  ClipboardList
} from 'lucide-react';

interface PerjalananFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PerjalananDinas) => void;
  editItem?: PerjalananDinas | null;
}

export const PerjalananFormModal: React.FC<PerjalananFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [activeTab, setActiveTab] = useState<'anggaran' | 'pelaksana' | 'biaya' | 'administrasi'>('anggaran');

  // Form State
  const [bulan, setBulan] = useState('Januari');
  const [tahun, setTahun] = useState(2026);
  const [kodeRekeningKegiatan, setKodeRekeningKegiatan] = useState('1.05.01.2.02');
  const [kodeRekeningBelanja, setKodeRekeningBelanja] = useState('5.1.02.04.01.0001');
  const [uraian, setUraian] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [subKegiatan, setSubKegiatan] = useState('');
  const [skpd, setSkpd] = useState('Dinas Pemadam Kebakaran dan Penyelamatan');
  const [namaKantorTujuan, setNamaKantorTujuan] = useState('');
  const [kotaTujuan, setKotaTujuan] = useState('');

  // Pelaksana (Unlimited, 100+)
  const [pelaksanaList, setPelaksanaList] = useState<Pelaksana[]>([
    { id: 'p-1', nama: '', nip: '', jabatan: '', golongan: '' },
  ]);
  const [bulkPelaksanaText, setBulkPelaksanaText] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  // Cost items
  const [uangHarianList, setUangHarianList] = useState<CostItem[]>([]);
  const [representasiList, setRepresentasiList] = useState<CostItem[]>([]);
  const [uangSakuList, setUangSakuList] = useState<CostItem[]>([]);
  const [penginapanList, setPenginapanList] = useState<CostItem[]>([]);
  const [tiketETolPulang, setTiketETolPulang] = useState<number>(0);
  const [tiketETolPergi, setTiketETolPergi] = useState<number>(0);
  const [tiketETolJumlah, setTiketETolJumlah] = useState<number>(0);

  const [transportAsalList, setTransportAsalList] = useState<CostItem[]>([]);
  const [transportTujuanList, setTransportTujuanList] = useState<CostItem[]>([]);
  const [sewaKendaraanList, setSewaKendaraanList] = useState<CostItem[]>([]);

  // BBM
  const [bbmLiter, setBbmLiter] = useState<number>(0);
  const [bbmSatuan, setBbmSatuan] = useState('Liter');
  const [bbmHarga, setBbmHarga] = useState<number>(14500);
  const [bbmJumlahManual, setBbmJumlahManual] = useState<number>(0);

  // SP2D & SPPD
  const [sp2dList, setSp2dList] = useState<SPDoc[]>([{ id: 'sp2d-1', nomor: '', tanggal: '' }]);
  const [sppdList, setSppdList] = useState<SPDoc[]>([{ id: 'sppd-1', nomor: '', tanggal: '' }]);

  // Perjalanan Dates
  const [lamaPerjalananHari, setLamaPerjalananHari] = useState<number>(1);
  const [tanggalBerangkat, setTanggalBerangkat] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');
  const [itineraryList, setItineraryList] = useState<PerjalananItinerary[]>([]);

  // Penerbangan
  const [penerbanganList, setPenerbanganList] = useState<Penerbangan[]>([]);

  // Hotel & Pembayaran & Keterangan
  const [namaHotel, setNamaHotel] = useState('');
  const [tanggalPembayaran, setTanggalPembayaran] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Auto calculate total on state changes
  const computedTotal = React.useMemo(() => {
    return calculateTotalBiaya({
      uangHarian: uangHarianList,
      representasi: representasiList,
      uangSakuPeserta: uangSakuList,
      penginapan: penginapanList,
      tiketETol: { pulang: tiketETolPulang, pergi: tiketETolPergi, jumlah: tiketETolJumlah },
      transportKotaAsal: transportAsalList,
      transportKotaTujuan: transportTujuanList,
      sewaKendaraan: sewaKendaraanList,
      bbm: { liter: bbmLiter, satuan: bbmSatuan, harga: bbmHarga, jumlahManual: bbmJumlahManual },
      penerbangan: penerbanganList,
    });
  }, [
    uangHarianList,
    representasiList,
    uangSakuList,
    penginapanList,
    tiketETolPulang,
    tiketETolPergi,
    tiketETolJumlah,
    transportAsalList,
    transportTujuanList,
    sewaKendaraanList,
    bbmLiter,
    bbmSatuan,
    bbmHarga,
    bbmJumlahManual,
    penerbanganList,
  ]);

  // Load existing item for edit
  useEffect(() => {
    if (editItem) {
      setBulan(editItem.bulan || 'Januari');
      setTahun(editItem.tahun || 2026);
      setKodeRekeningKegiatan(editItem.kodeRekeningKegiatan || '');
      setKodeRekeningBelanja(editItem.kodeRekeningBelanja || '');
      setUraian(editItem.uraian || '');
      setKegiatan(editItem.kegiatan || '');
      setSubKegiatan(editItem.subKegiatan || '');
      setSkpd(editItem.skpd || 'Dinas Pemadam Kebakaran dan Penyelamatan');
      setNamaKantorTujuan(editItem.namaKantorTujuan || '');
      setKotaTujuan(editItem.kotaTujuan || '');

      setPelaksanaList(editItem.pelaksana.length > 0 ? editItem.pelaksana : [{ id: 'p-1', nama: '', nip: '', jabatan: '' }]);
      setUangHarianList(editItem.uangHarian || []);
      setRepresentasiList(editItem.representasi || []);
      setUangSakuList(editItem.uangSakuPeserta || []);
      setPenginapanList(editItem.penginapan || []);
      setTiketETolPulang(editItem.tiketETol?.pulang || 0);
      setTiketETolPergi(editItem.tiketETol?.pergi || 0);
      setTiketETolJumlah(editItem.tiketETol?.jumlah || 0);

      setTransportAsalList(editItem.transportKotaAsal || []);
      setTransportTujuanList(editItem.transportKotaTujuan || []);
      setSewaKendaraanList(editItem.sewaKendaraan || []);

      setBbmLiter(editItem.bbm?.liter || 0);
      setBbmSatuan(editItem.bbm?.satuan || 'Liter');
      setBbmHarga(editItem.bbm?.harga || 14500);
      setBbmJumlahManual(editItem.bbm?.jumlahManual || 0);

      setSp2dList(editItem.sp2dList?.length > 0 ? editItem.sp2dList : [{ id: 'sp2d-1', nomor: '', tanggal: '' }]);
      setSppdList(editItem.sppdList?.length > 0 ? editItem.sppdList : [{ id: 'sppd-1', nomor: '', tanggal: '' }]);

      setLamaPerjalananHari(editItem.lamaPerjalananHari || 1);
      setTanggalBerangkat(editItem.tanggalBerangkat || '');
      setTanggalKembali(editItem.tanggalKembali || '');
      setItineraryList(editItem.itineraryList || []);

      setPenerbanganList(editItem.penerbangan || []);
      setNamaHotel(editItem.namaHotel || '');
      setTanggalPembayaran(editItem.tanggalPembayaran || '');
      setKeterangan(editItem.keterangan || '');
    } else {
      // Reset form
      setBulan('Januari');
      setTahun(2026);
      setKodeRekeningKegiatan('1.05.01.2.02');
      setKodeRekeningBelanja('5.1.02.04.01.0001');
      setUraian('');
      setKegiatan('');
      setSubKegiatan('');
      setNamaKantorTujuan('');
      setKotaTujuan('');
      setPelaksanaList([{ id: 'p-1', nama: '', nip: '', jabatan: '', golongan: '' }]);
      setUangHarianList([{ id: 'uh-1', hari: 2, satuan: 'OH', harga: 430000, jumlah: 860000, keterangan: 'Uang Harian' }]);
      setRepresentasiList([]);
      setUangSakuList([]);
      setPenginapanList([]);
      setTiketETolPulang(0);
      setTiketETolPergi(0);
      setTiketETolJumlah(0);
      setTransportAsalList([]);
      setTransportTujuanList([]);
      setSewaKendaraanList([]);
      setBbmLiter(0);
      setBbmSatuan('Liter');
      setBbmHarga(14500);
      setBbmJumlahManual(0);
      setSp2dList([{ id: 'sp2d-1', nomor: '', tanggal: '' }]);
      setSppdList([{ id: 'sppd-1', nomor: '', tanggal: '' }]);
      setLamaPerjalananHari(2);
      setTanggalBerangkat('');
      setTanggalKembali('');
      setItineraryList([]);
      setPenerbanganList([]);
      setNamaHotel('');
      setTanggalPembayaran('');
      setKeterangan('');
    }
  }, [editItem, isOpen]);

  // Recalculate auto lama hari
  useEffect(() => {
    if (tanggalBerangkat && tanggalKembali) {
      const d1 = new Date(tanggalBerangkat);
      const d2 = new Date(tanggalKembali);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setLamaPerjalananHari(diffDays);
      }
    }
  }, [tanggalBerangkat, tanggalKembali]);

  // Sync auto BBM calculation
  const handleBbmCalc = (liter: number, harga: number) => {
    setBbmLiter(liter);
    setBbmHarga(harga);
    setBbmJumlahManual(liter * harga);
  };

  // Sync Tol total
  const handleTolChange = (p: number, k: number) => {
    setTiketETolPulang(p);
    setTiketETolPergi(k);
    setTiketETolJumlah(p + k);
  };

  if (!isOpen) return null;

  // Add Dynamic Pelaksana
  const handleAddPelaksana = () => {
    setPelaksanaList((prev) => [
      ...prev,
      { id: `p-${Date.now()}`, nama: '', nip: '', jabatan: '', golongan: '' },
    ]);
  };

  const handleRemovePelaksana = (index: number) => {
    setPelaksanaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePelaksana = (index: number, field: keyof Pelaksana, value: string) => {
    setPelaksanaList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Bulk Add Pelaksana from multiline text (Format: Nama | NIP | Jabatan | Golongan or tab-separated)
  const handleProcessBulkPelaksana = () => {
    if (!bulkPelaksanaText.trim()) return;
    const lines = bulkPelaksanaText.trim().split('\n');
    const newItems: Pelaksana[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;
      const parts = line.includes('\t') ? line.split('\t') : line.split('|');
      newItems.push({
        id: `p-${Date.now()}-${Math.random()}`,
        nama: (parts[0] || '').trim(),
        nip: (parts[1] || '').trim(),
        jabatan: (parts[2] || '').trim(),
        golongan: (parts[3] || '').trim(),
      });
    });

    if (newItems.length > 0) {
      setPelaksanaList((prev) => [...prev.filter((p) => p.nama.trim() !== ''), ...newItems]);
      setBulkPelaksanaText('');
      setShowBulkAdd(false);
    }
  };

  // Generic Cost Item List Handlers
  const handleAddCostItem = (setter: React.Dispatch<React.SetStateAction<CostItem[]>>, defaultSatuan = 'OH') => {
    setter((prev) => [
      ...prev,
      {
        id: `cost-${Date.now()}`,
        hari: 1,
        satuan: defaultSatuan,
        harga: 0,
        jumlah: 0,
        keterangan: '',
      },
    ]);
  };

  const handleUpdateCostItem = (
    setter: React.Dispatch<React.SetStateAction<CostItem[]>>,
    index: number,
    field: keyof CostItem,
    val: any
  ) => {
    setter((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: val };
        if (field === 'hari' || field === 'harga') {
          updated.jumlah = (Number(updated.hari) || 0) * (Number(updated.harga) || 0);
        }
        return updated;
      })
    );
  };

  const handleRemoveCostItem = (
    setter: React.Dispatch<React.SetStateAction<CostItem[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // Flights
  const handleAddFlight = () => {
    setPenerbanganList((prev) => [
      ...prev,
      {
        id: `fl-${Date.now()}`,
        arah: 'Berangkat',
        maskapai: 'Garuda Indonesia',
        namaPenumpang: pelaksanaList[0]?.nama || '',
        noTiket: '',
        kodeBooking: '',
        noPenerbangan: '',
        asalDaerah: 'Jakarta',
        tujuan: kotaTujuan || '',
        tanggal: tanggalBerangkat || '',
        kelas: 'Ekonomi',
        hargaTiket: 0,
      },
    ]);
  };

  // Itinerary
  const handleAddItinerary = () => {
    setItineraryList((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        tanggalBerangkat: '',
        tanggalKembali: '',
        lamaHari: 1,
        keterangan: '',
      },
    ]);
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!uraian.trim()) {
      alert('Harap isi uraian maksud perjalanan dinas.');
      setActiveTab('anggaran');
      return;
    }

    const cleanedPelaksana = pelaksanaList.filter((p) => p.nama.trim() !== '');
    if (cleanedPelaksana.length === 0) {
      alert('Harap isi setidaknya 1 nama pelaksana dinas.');
      setActiveTab('pelaksana');
      return;
    }

    const record: PerjalananDinas = {
      id: editItem?.id || `perjadin-${Date.now()}`,
      bulan,
      tahun: Number(tahun) || 2026,
      kodeRekeningKegiatan,
      kodeRekeningBelanja,
      uraian,
      kegiatan,
      subKegiatan,
      skpd,
      namaKantorTujuan,
      kotaTujuan,
      pelaksana: cleanedPelaksana,
      uangHarian: uangHarianList,
      representasi: representasiList,
      uangSakuPeserta: uangSakuList,
      penginapan: penginapanList,
      tiketETol: {
        pulang: Number(tiketETolPulang) || 0,
        pergi: Number(tiketETolPergi) || 0,
        jumlah: Number(tiketETolJumlah) || 0,
      },
      transportKotaAsal: transportAsalList,
      transportKotaTujuan: transportTujuanList,
      sewaKendaraan: sewaKendaraanList,
      bbm: {
        liter: Number(bbmLiter) || 0,
        satuan: bbmSatuan,
        harga: Number(bbmHarga) || 0,
        jumlahManual: Number(bbmJumlahManual) || 0,
      },
      jumlahTotal: computedTotal,
      sp2dList: sp2dList.filter((s) => s.nomor.trim() !== ''),
      sppdList: sppdList.filter((s) => s.nomor.trim() !== ''),
      lamaPerjalananHari: Number(lamaPerjalananHari) || 1,
      tanggalBerangkat,
      tanggalKembali,
      itineraryList,
      penerbangan: penerbanganList,
      namaHotel,
      tanggalPembayaran,
      keterangan,
      statusApproval: editItem?.statusApproval || 'Disetujui',
      createdAt: editItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Formulir E-Perjadin 21 Bagian
            </span>
            <h2 className="text-base sm:text-lg font-bold">
              {editItem ? 'Edit Data Perjalanan Dinas' : 'Tambah Perjalanan Dinas Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation for 21 Sections */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('anggaran')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'anggaran'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Anggaran & Kegiatan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pelaksana')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'pelaksana'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Data Pelaksana ({pelaksanaList.filter((p) => p.nama).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biaya')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'biaya'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>3. Komponen Biaya (Harian, Tol, BBM, Hotel)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('administrasi')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'administrasi'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>4. SPPD, SP2D & Penerbangan</span>
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: INFORMASI ANGGARAN & KEGIATAN */}
          {activeTab === 'anggaran' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bulan Pelaksanaan *
                  </label>
                  <select
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  >
                    {NAMA_BULAN.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Anggaran *
                  </label>
                  <input
                    type="number"
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKPD / Perangkat Daerah *
                  </label>
                  <input
                    type="text"
                    value={skpd}
                    onChange={(e) => setSkpd(e.target.value)}
                    placeholder="Dinas Pemadam Kebakaran dan Penyelamatan"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Rekening Kegiatan *
                  </label>
                  <input
                    type="text"
                    value={kodeRekeningKegiatan}
                    onChange={(e) => setKodeRekeningKegiatan(e.target.value)}
                    placeholder="Contoh: 1.05.01.2.02"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Rekening Belanja *
                  </label>
                  <input
                    type="text"
                    value={kodeRekeningBelanja}
                    onChange={(e) => setKodeRekeningBelanja(e.target.value)}
                    placeholder="Contoh: 5.1.02.04.01.0001 (Belanja Perjadin)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Maksud Perjalanan Dinas *
                </label>
                <textarea
                  rows={3}
                  required
                  value={uraian}
                  onChange={(e) => setUraian(e.target.value)}
                  placeholder="Tuliskan maksud lengkap perjalanan dinas, agenda rapat, atau pelatihan..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program / Kegiatan
                  </label>
                  <input
                    type="text"
                    value={kegiatan}
                    onChange={(e) => setKegiatan(e.target.value)}
                    placeholder="Contoh: Pelayanan Pencegahan dan Kesiapsiagaan Bahaya Kebakaran"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sub Kegiatan
                  </label>
                  <input
                    type="text"
                    value={subKegiatan}
                    onChange={(e) => setSubKegiatan(e.target.value)}
                    placeholder="Contoh: Koordinasi Penanganan Bencana dan Penyelamatan"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kantor / Tempat Tujuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaKantorTujuan}
                    onChange={(e) => setNamaKantorTujuan(e.target.value)}
                    placeholder="Contoh: Gedung Ditjen Bina Administrasi Kewilayahan Kemendagri"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kota / Kabupaten Tujuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={kotaTujuan}
                    onChange={(e) => setKotaTujuan(e.target.value)}
                    placeholder="Contoh: Jakarta, Bandung, Surabaya, Semarang, Denpasar"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA PELAKSANA & TUJUAN (Tidak dibatasi 2 orang, bisa 100+ orang) */}
          {activeTab === 'pelaksana' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Daftar Pelaksana Perjalanan Dinas ({pelaksanaList.length} Personel)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sistem mendukung pelaksana tanpa batas (2 orang, 10 orang, hingga 100+ orang).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkAdd(!showBulkAdd)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    {showBulkAdd ? 'Tutup Input Massal' : '⚡ Input Massal (Bulk Paste)'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddPelaksana}
                    className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Pelaksana</span>
                  </button>
                </div>
              </div>

              {/* Bulk Add Textarea */}
              {showBulkAdd && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <label className="block text-xs font-semibold text-emerald-950">
                    Tempel Teks Massal (Format per baris: Nama | NIP | Jabatan | Golongan atau Tab dari Excel)
                  </label>
                  <textarea
                    rows={4}
                    value={bulkPelaksanaText}
                    onChange={(e) => setBulkPelaksanaText(e.target.value)}
                    placeholder="Contoh:&#10;Ade Sarip Hidayat | 197108151996031002 | Kepala Dinas | Pembina Utama Muda (IV/c)&#10;Hendra Gunawan | 197904122005011004 | Kabid Penyelamatan | Pembina (IV/a)"
                    className="w-full p-2.5 text-xs bg-white border border-emerald-300 rounded-md font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkAdd(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-emerald-100 rounded-md"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessBulkPelaksana}
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md"
                    >
                      Tambahkan ke Tabel
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Pelaksana Rows */}
              <div className="space-y-3">
                {pelaksanaList.map((pelaksana, idx) => (
                  <div
                    key={pelaksana.id || idx}
                    className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-colors relative"
                  >
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800">
                        Pelaksana #{idx + 1}
                      </span>
                      {pelaksanaList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePelaksana(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                          title="Hapus Pelaksana Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Nama Lengkap & Gelar *
                        </label>
                        <input
                          type="text"
                          required
                          value={pelaksana.nama}
                          onChange={(e) => handleUpdatePelaksana(idx, 'nama', e.target.value)}
                          placeholder="Nama pegawai..."
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          NIP *
                        </label>
                        <input
                          type="text"
                          value={pelaksana.nip}
                          onChange={(e) => handleUpdatePelaksana(idx, 'nip', e.target.value)}
                          placeholder="198203152009021001"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-slate-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Jabatan *
                        </label>
                        <input
                          type="text"
                          value={pelaksana.jabatan}
                          onChange={(e) => handleUpdatePelaksana(idx, 'jabatan', e.target.value)}
                          placeholder="Jabatan dinas..."
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Gol / Pangkat (Opsional)
                        </label>
                        <input
                          type="text"
                          value={pelaksana.golongan || ''}
                          onChange={(e) => handleUpdatePelaksana(idx, 'golongan', e.target.value)}
                          placeholder="Contoh: Penata (III/c)"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddPelaksana}
                  className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Pelaksana Lainnya</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: KOMPONEN BIAYA LENGKAP */}
          {activeTab === 'biaya' && (
            <div className="space-y-6">
              {/* 3. UANG HARIAN */}
              <CostSection
                title="3. Uang Harian"
                items={uangHarianList}
                onAdd={() => handleAddCostItem(setUangHarianList, 'OH')}
                onUpdate={(idx, f, v) => handleUpdateCostItem(setUangHarianList, idx, f, v)}
                onRemove={(idx) => handleRemoveCostItem(setUangHarianList, idx)}
                defaultLabel="OH (Orang Hari)"
              />

              {/* 4. REPRESENTASI */}
              <CostSection
                title="4. Biaya Representasi (Pejabat Eselon)"
                items={representasiList}
                onAdd={() => handleAddCostItem(setRepresentasiList, 'Hari')}
                onUpdate={(idx, f, v) => handleUpdateCostItem(setRepresentasiList, idx, f, v)}
                onRemove={(idx) => handleRemoveCostItem(setRepresentasiList, idx)}
                defaultLabel="Hari"
              />

              {/* 5. UANG SAKU PESERTA */}
              <CostSection
                title="5. Uang Saku Peserta / Diklat / Bimtek"
                items={uangSakuList}
                onAdd={() => handleAddCostItem(setUangSakuList, 'OH')}
                onUpdate={(idx, f, v) => handleUpdateCostItem(setUangSakuList, idx, f, v)}
                onRemove={(idx) => handleRemoveCostItem(setUangSakuList, idx)}
                defaultLabel="OH"
              />

              {/* 6. PENGINAPAN */}
              <CostSection
                title="6. Biaya Penginapan / Hotel"
                items={penginapanList}
                onAdd={() => handleAddCostItem(setPenginapanList, 'Malam')}
                onUpdate={(idx, f, v) => handleUpdateCostItem(setPenginapanList, idx, f, v)}
                onRemove={(idx) => handleRemoveCostItem(setPenginapanList, idx)}
                defaultLabel="Malam"
              />

              {/* 7. TIKET / E-TOL */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <h4 className="text-xs font-bold text-slate-900">7. Tiket Tol / E-Tol</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Tol Pergi (Rp)
                    </label>
                    <input
                      type="number"
                      value={tiketETolPergi || ''}
                      onChange={(e) => handleTolChange(tiketETolPulang, Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Tol Pulang (Rp)
                    </label>
                    <input
                      type="number"
                      value={tiketETolPulang || ''}
                      onChange={(e) => handleTolChange(Number(e.target.value), tiketETolPergi)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Jumlah Tol Total (Rp)
                    </label>
                    <input
                      type="number"
                      value={tiketETolJumlah || ''}
                      onChange={(e) => setTiketETolJumlah(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 8. TRANSPORT KOTA ASAL */}
              <CostSection
                title="8. Transportasi Lokal Kota Asal (Bandara/Stasiun)"
                items={transportAsalList}
                onAdd={() => handleAddCostItem(setTransportAsalList, 'PP')}
                onUpdate={(idx, f, v) => handleUpdateCostItem(setTransportAsalList, idx, f, v)}
                onRemove={(idx) => handleRemoveCostItem(setTransportAsalList, idx)}
                defaultLabel="PP"
              />

              {/* 9. TRANSPORT KOTA TUJUAN */}
              <CostSection
                title="9. Transportasi Lokal Kota Tujuan"
                items={transportTujuanList}
                onAdd={() => handleAddCostItem(setTransportTujuanList, 'Hari')}
                onUpdate={(idx, f, v) => handleUpdateCostItem(setTransportTujuanList, idx, f, v)}
                onRemove={(idx) => handleRemoveCostItem(setTransportTujuanList, idx)}
                defaultLabel="Hari"
              />

              {/* 10. SEWA KENDARAAN */}
              <CostSection
                title="10. Sewa Kendaraan Dinas"
                items={sewaKendaraanList}
                onAdd={() => handleAddCostItem(setSewaKendaraanList, 'Hari')}
                onUpdate={(idx, f, v) => handleUpdateCostItem(setSewaKendaraanList, idx, f, v)}
                onRemove={(idx) => handleRemoveCostItem(setSewaKendaraanList, idx)}
                defaultLabel="Hari"
              />

              {/* 11. BBM */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-600" />
                    <span>11. Bahan Bakar Minyak (BBM)</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Liter
                    </label>
                    <input
                      type="number"
                      value={bbmLiter || ''}
                      onChange={(e) => handleBbmCalc(Number(e.target.value), bbmHarga)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      value={bbmSatuan}
                      onChange={(e) => setBbmSatuan(e.target.value)}
                      placeholder="Liter"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Harga / Liter (Rp)
                    </label>
                    <input
                      type="number"
                      value={bbmHarga || ''}
                      onChange={(e) => handleBbmCalc(bbmLiter, Number(e.target.value))}
                      placeholder="14500"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Jumlah Total BBM (Rp)
                    </label>
                    <input
                      type="number"
                      value={bbmJumlahManual || ''}
                      onChange={(e) => setBbmJumlahManual(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMINISTRASI & PENERBANGAN */}
          {activeTab === 'administrasi' && (
            <div className="space-y-6">
              {/* SPPD & SP2D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 13. SP2D */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">13. Surat Perintah Pencairan Dana (SP2D)</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setSp2dList((prev) => [...prev, { id: `sp2d-${Date.now()}`, nomor: '', tanggal: '' }])
                      }
                      className="text-xs text-slate-900 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah</span>
                    </button>
                  </div>
                  {sp2dList.map((item, idx) => (
                    <div key={item.id || idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.nomor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSp2dList((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, nomor: val } : s))
                          );
                        }}
                        placeholder="Nomor SP2D..."
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                      />
                      <input
                        type="date"
                        value={item.tanggal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSp2dList((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, tanggal: val } : s))
                          );
                        }}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                  ))}
                </div>

                {/* 14. SPPD */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">14. Surat Perintah Perjalanan Dinas (SPPD)</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setSppdList((prev) => [...prev, { id: `sppd-${Date.now()}`, nomor: '', tanggal: '' }])
                      }
                      className="text-xs text-slate-900 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah</span>
                    </button>
                  </div>
                  {sppdList.map((item, idx) => (
                    <div key={item.id || idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.nomor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSppdList((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, nomor: val } : s))
                          );
                        }}
                        placeholder="Nomor SPPD..."
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                      />
                      <input
                        type="date"
                        value={item.tanggal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSppdList((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, tanggal: val } : s))
                          );
                        }}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 15, 16, 17. Tanggal & Lama Perjalanan */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  15-17. Jadwal & Lama Perjalanan Dinas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Tanggal Berangkat *
                    </label>
                    <input
                      type="date"
                      value={tanggalBerangkat}
                      onChange={(e) => setTanggalBerangkat(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Tanggal Kembali *
                    </label>
                    <input
                      type="date"
                      value={tanggalKembali}
                      onChange={(e) => setTanggalKembali(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Lama Hari
                    </label>
                    <input
                      type="number"
                      value={lamaPerjalananHari}
                      onChange={(e) => setLamaPerjalananHari(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                </div>

                {/* Multi-Leg Itinerary */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-700">
                      Rute Tambahan (Lebih dari satu perjalanan)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItinerary}
                      className="text-xs text-slate-900 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Rute</span>
                    </button>
                  </div>
                  {itineraryList.map((it, idx) => (
                    <div key={it.id || idx} className="grid grid-cols-3 gap-2 mb-2">
                      <input
                        type="date"
                        value={it.tanggalBerangkat}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItineraryList((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, tanggalBerangkat: val } : item))
                          );
                        }}
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md font-mono"
                      />
                      <input
                        type="date"
                        value={it.tanggalKembali}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItineraryList((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, tanggalKembali: val } : item))
                          );
                        }}
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md font-mono"
                      />
                      <input
                        type="text"
                        value={it.keterangan || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItineraryList((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, keterangan: val } : item))
                          );
                        }}
                        placeholder="Keterangan rute..."
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 18. INFORMASI PENERBANGAN */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-indigo-600" />
                    <span>18. Informasi Penerbangan ({penerbanganList.length} Tiket Pesawat)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddFlight}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Tiket Pesawat</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {penerbanganList.map((flight, idx) => (
                    <div
                      key={flight.id || idx}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-800">
                          Tiket #{idx + 1} ({flight.arah})
                        </span>
                        <button
                          type="button"
                          onClick={() => setPenerbanganList((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Arah</label>
                          <select
                            value={flight.arah}
                            onChange={(e) => {
                              const val = e.target.value as 'Berangkat' | 'Pulang';
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, arah: val } : f))
                              );
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white"
                          >
                            <option value="Berangkat">Berangkat</option>
                            <option value="Pulang">Pulang</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Maskapai</label>
                          <input
                            type="text"
                            value={flight.maskapai}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, maskapai: val } : f))
                              );
                            }}
                            placeholder="Garuda / Batik / Lion"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Nama Penumpang</label>
                          <input
                            type="text"
                            value={flight.namaPenumpang}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, namaPenumpang: val } : f))
                              );
                            }}
                            placeholder="Nama penumpang"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Harga Tiket (Rp)</label>
                          <input
                            type="number"
                            value={flight.hargaTiket || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, hargaTiket: val } : f))
                              );
                            }}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Kode Booking</label>
                          <input
                            type="text"
                            value={flight.kodeBooking}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, kodeBooking: val } : f))
                              );
                            }}
                            placeholder="Contoh: KLD89Z"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">No Tiket</label>
                          <input
                            type="text"
                            value={flight.noTiket}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, noTiket: val } : f))
                              );
                            }}
                            placeholder="No Tiket"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">No Penerbangan</label>
                          <input
                            type="text"
                            value={flight.noPenerbangan}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, noPenerbangan: val } : f))
                              );
                            }}
                            placeholder="GA-312"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block">Kelas</label>
                          <input
                            type="text"
                            value={flight.kelas}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPenerbanganList((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, kelas: val } : f))
                              );
                            }}
                            placeholder="Ekonomi / Bisnis"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {penerbanganList.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Tidak ada tiket penerbangan (untuk perjalanan darat).
                    </div>
                  )}
                </div>
              </div>

              {/* 19, 20, 21. Hotel, Pembayaran, Keterangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    19. Nama Hotel / Penginapan
                  </label>
                  <input
                    type="text"
                    value={namaHotel}
                    onChange={(e) => setNamaHotel(e.target.value)}
                    placeholder="Contoh: Hotel Lumire Jakarta / Savoy Homann Bandung"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    20. Tanggal Pembayaran / SP2D Cair
                  </label>
                  <input
                    type="date"
                    value={tanggalPembayaran}
                    onChange={(e) => setTanggalPembayaran(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  21. Keterangan Tambahan / Catatan Khusus
                </label>
                <textarea
                  rows={3}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan hasil pelaksanaan, kaji terap, nomor surat tugas..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* Bottom Bar: 12. JUMLAH TOTAL & ACTIONS */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-0 bg-white py-3 -mb-6 -mx-6 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <Calculator className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  12. JUMLAH TOTAL BIAYA (DIHITUNG OTOMATIS)
                </span>
                <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                  {formatRupiah(computedTotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                {editItem ? 'Simpan Perubahan' : 'Simpan Data Perjadin'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CostSectionProps {
  title: string;
  items: CostItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof CostItem, val: any) => void;
  onRemove: (index: number) => void;
  defaultLabel: string;
}

const CostSection: React.FC<CostSectionProps> = ({
  title,
  items,
  onAdd,
  onUpdate,
  onRemove,
  defaultLabel,
}) => {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900">{title}</h4>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-slate-900 font-semibold flex items-center gap-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Item</span>
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-md border border-slate-200 text-xs"
          >
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block">Hari / Qty</label>
              <input
                type="number"
                value={item.hari || ''}
                onChange={(e) => onUpdate(idx, 'hari', Number(e.target.value))}
                placeholder="1"
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block">Satuan</label>
              <input
                type="text"
                value={item.satuan}
                onChange={(e) => onUpdate(idx, 'satuan', e.target.value)}
                placeholder={defaultLabel}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
              />
            </div>

            <div className="col-span-3">
              <label className="text-[10px] text-slate-400 block">Harga Satuan (Rp)</label>
              <input
                type="number"
                value={item.harga || ''}
                onChange={(e) => onUpdate(idx, 'harga', Number(e.target.value))}
                placeholder="0"
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div className="col-span-4">
              <label className="text-[10px] text-slate-400 block">Jumlah (Hari × Harga)</label>
              <div className="font-mono font-bold text-slate-900 py-1 tabular-nums">
                {formatRupiah(item.jumlah)}
              </div>
            </div>

            <div className="col-span-1 text-right">
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="py-2 text-xs text-slate-400 italic">
            Belum ada komponen ditambahkan. Klik "+ Tambah Item" di atas jika ada.
          </div>
        )}
      </div>
    </div>
  );
};
