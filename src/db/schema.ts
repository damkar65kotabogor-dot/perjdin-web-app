import { pgTable, text, serial, integer, doublePrecision, jsonb, timestamp } from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Perjalanan Dinas table
export const perjalananDinas = pgTable('perjalanan_dinas', {
  id: text('id').primaryKey(),
  bulan: text('bulan').notNull(),
  tahun: integer('tahun').notNull(),
  kodeRekeningKegiatan: text('kode_rekening_kegiatan'),
  kodeRekeningBelanja: text('kode_rekening_belanja'),
  uraian: text('uraian').notNull(),
  kegiatan: text('kegiatan'),
  subKegiatan: text('sub_kegiatan'),
  skpd: text('skpd').notNull(),
  namaKantorTujuan: text('nama_kantor_tujuan'),
  kotaTujuan: text('kota_tujuan').notNull(),
  pelaksana: jsonb('pelaksana').notNull(),
  uangHarian: jsonb('uang_harian').default([]),
  representasi: jsonb('representasi').default([]),
  uangSakuPeserta: jsonb('uang_saku_peserta').default([]),
  penginapan: jsonb('penginapan').default([]),
  tiketETol: jsonb('tiket_e_tol'),
  transportKotaAsal: jsonb('transport_kota_asal').default([]),
  transportKotaTujuan: jsonb('transport_kota_tujuan').default([]),
  sewaKendaraan: jsonb('sewa_kendaraan').default([]),
  bbm: jsonb('bbm'),
  penerbangan: jsonb('penerbangan').default([]),
  jumlahTotal: doublePrecision('jumlah_total').notNull(),
  sp2dList: jsonb('sp2d_list').default([]),
  sppdList: jsonb('sppd_list').default([]),
  itineraryList: jsonb('itinerary_list').default([]),
  lamaPerjalananHari: integer('lama_perjalanan_hari').default(1).notNull(),
  tanggalBerangkat: text('tanggal_berangkat'),
  tanggalKembali: text('tanggal_kembali'),
  namaHotel: text('nama_hotel'),
  tanggalPembayaran: text('tanggal_pembayaran'),
  keterangan: text('keterangan'),
  statusApproval: text('status_approval').default('Disetujui').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
