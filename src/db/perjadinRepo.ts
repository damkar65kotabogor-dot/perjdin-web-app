import { db } from './index.ts';
import { perjalananDinas, users } from './schema.ts';
import { eq } from 'drizzle-orm';
import { PerjalananDinas } from '../types/perjadin';

export async function getAllPerjalananDinas(): Promise<PerjalananDinas[]> {
  try {
    const rows = await db.select().from(perjalananDinas);
    return rows.map((r) => ({
      id: r.id,
      bulan: r.bulan,
      tahun: r.tahun,
      kodeRekeningKegiatan: r.kodeRekeningKegiatan || '',
      kodeRekeningBelanja: r.kodeRekeningBelanja || '',
      uraian: r.uraian,
      kegiatan: r.kegiatan || '',
      subKegiatan: r.subKegiatan || '',
      skpd: r.skpd,
      namaKantorTujuan: r.namaKantorTujuan || '',
      kotaTujuan: r.kotaTujuan,
      pelaksana: (r.pelaksana as any) || [],
      uangHarian: (r.uangHarian as any) || [],
      representasi: (r.representasi as any) || [],
      uangSakuPeserta: (r.uangSakuPeserta as any) || [],
      penginapan: (r.penginapan as any) || [],
      tiketETol: (r.tiketETol as any) || { pulang: 0, pergi: 0, jumlah: 0 },
      transportKotaAsal: (r.transportKotaAsal as any) || [],
      transportKotaTujuan: (r.transportKotaTujuan as any) || [],
      sewaKendaraan: (r.sewaKendaraan as any) || [],
      bbm: (r.bbm as any) || { liter: 0, satuan: 'Liter', harga: 0, jumlahManual: 0 },
      penerbangan: (r.penerbangan as any) || [],
      jumlahTotal: r.jumlahTotal,
      sp2dList: (r.sp2dList as any) || [],
      sppdList: (r.sppdList as any) || [],
      itineraryList: (r.itineraryList as any) || [],
      lamaPerjalananHari: r.lamaPerjalananHari,
      tanggalBerangkat: r.tanggalBerangkat || '',
      tanggalKembali: r.tanggalKembali || '',
      namaHotel: r.namaHotel || '',
      tanggalPembayaran: r.tanggalPembayaran || '',
      keterangan: r.keterangan || '',
      statusApproval: (r.statusApproval as any) || 'Disetujui',
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to select all perjalanan_dinas:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function upsertPerjalananDinas(item: PerjalananDinas) {
  try {
    const values = {
      id: item.id,
      bulan: item.bulan,
      tahun: Number(item.tahun) || 2026,
      kodeRekeningKegiatan: item.kodeRekeningKegiatan || '',
      kodeRekeningBelanja: item.kodeRekeningBelanja || '',
      uraian: item.uraian,
      kegiatan: item.kegiatan || '',
      subKegiatan: item.subKegiatan || '',
      skpd: item.skpd,
      namaKantorTujuan: item.namaKantorTujuan || '',
      kotaTujuan: item.kotaTujuan,
      pelaksana: item.pelaksana,
      uangHarian: item.uangHarian,
      representasi: item.representasi,
      uangSakuPeserta: item.uangSakuPeserta,
      penginapan: item.penginapan,
      tiketETol: item.tiketETol,
      transportKotaAsal: item.transportKotaAsal,
      transportKotaTujuan: item.transportKotaTujuan,
      sewaKendaraan: item.sewaKendaraan,
      bbm: item.bbm,
      penerbangan: item.penerbangan,
      jumlahTotal: Number(item.jumlahTotal) || 0,
      sp2dList: item.sp2dList,
      sppdList: item.sppdList,
      itineraryList: item.itineraryList || [],
      lamaPerjalananHari: Number(item.lamaPerjalananHari) || 1,
      tanggalBerangkat: item.tanggalBerangkat || '',
      tanggalKembali: item.tanggalKembali || '',
      namaHotel: item.namaHotel || '',
      tanggalPembayaran: item.tanggalPembayaran || '',
      keterangan: item.keterangan || '',
      statusApproval: item.statusApproval || 'Disetujui',
      updatedAt: new Date(),
    };

    const result = await db.insert(perjalananDinas)
      .values(values)
      .onConflictDoUpdate({
        target: perjalananDinas.id,
        set: values,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to upsert perjalanan_dinas:', error);
    throw new Error('Database write failed. Please try again later.', { cause: error });
  }
}

export async function deletePerjalananDinas(id: string) {
  try {
    await db.delete(perjalananDinas).where(eq(perjalananDinas.id, id));
  } catch (error) {
    console.error('Failed to delete perjalanan_dinas:', error);
    throw new Error('Database deletion failed.', { cause: error });
  }
}

export async function batchUpsertPerjalananDinas(items: PerjalananDinas[]) {
  try {
    for (const item of items) {
      await upsertPerjalananDinas(item);
    }
    return items.length;
  } catch (error) {
    console.error('Failed to batch upsert perjalanan_dinas:', error);
    throw new Error('Batch database write failed.', { cause: error });
  }
}

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || '',
        role: 'admin',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || '',
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Failed to register user in database.', { cause: error });
  }
}
