export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * SMPD - SISTEM MANAJEMEN PERJALANAN DINAS
 * Google Apps Script Backend (Code.gs)
 * =========================================================================
 * Petunjuk Instalasi:
 * 1. Buka Google Spreadsheet baru atau yang sudah ada.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus kode bawaan dan tempel (paste) seluruh kode ini.
 * 4. Klik 'Simpan' (ikon disket).
 * 5. Klik tombol 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment).
 * 6. Pilih Jenis: 'Aplikasi Web' (Web app).
 * 7. Konfigurasi:
 *    - Deskripsi: API SMPD Perjalanan Dinas
 *    - Jalankan sebagai: Saya (email Anda)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone)
 * 8. Klik 'Terapkan' (Deploy), izinkan akses (Authorize Access).
 * 9. Salin URL Aplikasi Web (Web App URL) dan tempel ke Aplikasi Web SMPD.
 * =========================================================================
 */

const SHEET_NAME_SUMMARY = "Rekap_Perjadin";
const SHEET_NAME_DATABASE = "Database_Perjadin";

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dbSheet = ss.getSheetByName(SHEET_NAME_DATABASE);
  if (!dbSheet) {
    dbSheet = ss.insertSheet(SHEET_NAME_DATABASE);
    const headers = [
      "ID", "Bulan", "Tahun", "Kode Rekening Kegiatan", "Kode Rekening Belanja",
      "Uraian", "Kegiatan", "Sub Kegiatan", "SKPD", "Nama Kantor Tujuan", "Kota Tujuan",
      "Nama Pelaksana", "NIP Pelaksana", "Jabatan Pelaksana", "Golongan Pelaksana",
      "Total Uang Harian", "Total Representasi", "Total Uang Saku", "Total Penginapan",
      "Tiket E-Tol", "Transport Kota Asal", "Transport Kota Tujuan", "Sewa Kendaraan",
      "BBM", "Penerbangan", "Jumlah Total", "No SP2D", "Tgl SP2D", "No SPPD", "Tgl SPPD",
      "Lama Hari", "Tgl Berangkat", "Tgl Kembali", "Nama Hotel", "Tgl Pembayaran",
      "Keterangan", "Status Approval", "Raw JSON", "Terakhir Diperbarui"
    ];
    dbSheet.appendRow(headers);
    dbSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
    dbSheet.setFrozenRows(1);
  }
  return dbSheet;
}

function doGet(e) {
  try {
    const dbSheet = setupSheet();
    const rows = dbSheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return createJsonResponse({ status: "success", count: 0, data: [] });
    }
    
    // Ambil data dari kolom Raw JSON (kolom ke-38) atau rekonstruksi objek
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawJson = row[37];
      if (rawJson && typeof rawJson === "string" && rawJson.trim().startsWith("{")) {
        try {
          data.push(JSON.parse(rawJson));
          continue;
        } catch (err) {
          // fallback rekonstruksi dasar jika raw JSON rusak
        }
      }
      
      // Fallback row object
      data.push({
        id: row[0] || "ROW-" + i,
        bulan: row[1] || "",
        tahun: Number(row[2]) || 2026,
        kodeRekeningKegiatan: row[3] || "",
        kodeRekeningBelanja: row[4] || "",
        uraian: row[5] || "",
        kegiatan: row[6] || "",
        subKegiatan: row[7] || "",
        skpd: row[8] || "",
        namaKantorTujuan: row[9] || "",
        kotaTujuan: row[10] || "",
        pelaksana: [{ id: "p-1", nama: row[11] || "-", nip: row[12] || "-", jabatan: row[13] || "-", golongan: row[14] || "" }],
        jumlahTotal: Number(row[25]) || 0,
        lamaPerjalananHari: Number(row[30]) || 1,
        tanggalBerangkat: row[31] ? String(row[31]) : "",
        tanggalKembali: row[32] ? String(row[32]) : "",
        namaHotel: row[33] || "",
        tanggalPembayaran: row[34] ? String(row[34]) : "",
        keterangan: row[35] || "",
        statusApproval: row[36] || "Disetujui"
      });
    }

    return createJsonResponse({
      status: "success",
      count: data.length,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const dbSheet = setupSheet();
    const action = postData.action || "sync_all";
    
    if (action === "test") {
      return createJsonResponse({
        status: "success",
        message: "Koneksi Google Apps Script & Spreadsheet Berhasil!",
        sheetTitle: SpreadsheetApp.getActiveSpreadsheet().getName(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "sync_all" && Array.isArray(postData.records)) {
      // Clear data lama (kecuali header baris 1)
      const lastRow = dbSheet.getLastRow();
      if (lastRow > 1) {
        dbSheet.deleteRows(2, lastRow - 1);
      }

      const rowsToAppend = [];
      const records = postData.records;

      for (let i = 0; i < records.length; i++) {
        const item = records[i];
        const pelaksanaNames = (item.pelaksana || []).map(p => p.nama).join(", ");
        const pelaksanaNIPs = (item.pelaksana || []).map(p => p.nip).join(", ");
        const pelaksanaJabatans = (item.pelaksana || []).map(p => p.jabatan).join(", ");
        const pelaksanaGols = (item.pelaksana || []).map(p => p.golongan || "-").join(", ");
        const sp2dNums = (item.sp2dList || []).map(s => s.nomor).join(", ");
        const sp2dDates = (item.sp2dList || []).map(s => s.tanggal).join(", ");
        const sppdNums = (item.sppdList || []).map(s => s.nomor).join(", ");
        const sppdDates = (item.sppdList || []).map(s => s.tanggal).join(", ");

        const sumList = (arr) => (arr || []).reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
        const flightTotal = (item.penerbangan || []).reduce((acc, curr) => acc + (Number(curr.hargaTiket) || 0), 0);

        rowsToAppend.push([
          item.id || "perjadin-" + (i + 1),
          item.bulan || "",
          item.tahun || 2026,
          item.kodeRekeningKegiatan || "",
          item.kodeRekeningBelanja || "",
          item.uraian || "",
          item.kegiatan || "",
          item.subKegiatan || "",
          item.skpd || "",
          item.namaKantorTujuan || "",
          item.kotaTujuan || "",
          pelaksanaNames,
          pelaksanaNIPs,
          pelaksanaJabatans,
          pelaksanaGols,
          sumList(item.uangHarian),
          sumList(item.representasi),
          sumList(item.uangSakuPeserta),
          sumList(item.penginapan),
          Number(item.tiketETol?.jumlah) || 0,
          sumList(item.transportKotaAsal),
          sumList(item.transportKotaTujuan),
          sumList(item.sewaKendaraan),
          Number(item.bbm?.jumlahManual) || 0,
          flightTotal,
          Number(item.jumlahTotal) || 0,
          sp2dNums,
          sp2dDates,
          sppdNums,
          sppdDates,
          Number(item.lamaPerjalananHari) || 1,
          item.tanggalBerangkat || "",
          item.tanggalKembali || "",
          item.namaHotel || "",
          item.tanggalPembayaran || "",
          item.keterangan || "",
          item.statusApproval || "Disetujui",
          JSON.stringify(item),
          new Date().toISOString()
        ]);
      }

      if (rowsToAppend.length > 0) {
        dbSheet.getRange(2, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
      }

      return createJsonResponse({
        status: "success",
        message: "Berhasil menyinkronkan " + rowsToAppend.length + " data ke Google Spreadsheet.",
        count: rowsToAppend.length,
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Aksi tidak dikenali atau payload tidak valid."
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
