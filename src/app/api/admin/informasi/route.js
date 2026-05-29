import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { unlink } from 'fs/promises';
import { join } from 'path';

const SECRET_KEY = 'sgdrc-rahasia-banget';

// Fungsi Helper untuk Hapus File Fisik
async function hapusFileFisik(pathRelatif) {
  if (!pathRelatif || !pathRelatif.startsWith('/uploads/')) return;
  try {
    const fullPath = join(process.cwd(), 'public', pathRelatif);
    await unlink(fullPath);
  } catch (err) {
    console.error(`Gagal menghapus file: ${pathRelatif}`, err.message);
  }
}

export async function GET(req) {
  try {
    const db = await hubungkanDB();
    const [baris] = await db.query('SELECT * FROM pengaturan');
    
    const pengaturan = {};
    baris.forEach(item => {
      pengaturan[item.nama_key] = item.nilai;
    });

    return NextResponse.json(pengaturan);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ pesan: "Sesi Berakhir" }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin') return NextResponse.json({ pesan: "Akses ditolak" }, { status: 403 });

    const data = await request.json();
    const db = await hubungkanDB();

    // 1. Update Pengaturan Umum (Tabel: pengaturan)
    if (data.umum) {
      for (const [key, nilaiRaw] of Object.entries(data.umum)) {
        const nilai = typeof nilaiRaw === 'object' ? JSON.stringify(nilaiRaw) : String(nilaiRaw);
        
        // AUTO-DELETE UNTUK SEMUA FILE (Poster, Sertifikat, TTD, Cap, Logo, dll)
        const keysFile = [
          'poster_utama', 'sertifikat_peserta', 'sertifikat_juara', 
          'path_ttd', 'path_cap', 'path_logo_robotika', 'path_logo_sgdrc'
        ];

        if (keysFile.includes(key)) {
          const [lama] = await db.query('SELECT nilai FROM pengaturan WHERE nama_key = ?', [key]);
          if (lama.length > 0 && lama[0].nilai && lama[0].nilai !== nilai) {
            await hapusFileFisik(lama[0].nilai);
          }
        }

        const [cek] = await db.query('SELECT nama_key FROM pengaturan WHERE nama_key = ?', [key]);
        if (cek.length > 0) {
          await db.query('UPDATE pengaturan SET nilai = ? WHERE nama_key = ?', [nilai, key]);
        } else {
          await db.query('INSERT INTO pengaturan (nama_key, nilai) VALUES (?, ?)', [key, nilai]);
        }
      }
    }

    // 2. Update Manajemen Lomba
    if (data.lomba) {
      const { id, nama, judul, jenjang, harga, tanggal, tim, gambar, grup_wa, deskripsi, status, labels, aksi, target } = data.lomba;
      
      const tabel = target === 'dashboard' ? 'lomba_dashboard' : 'lomba';
      
      if (aksi === 'tambah') {
        if (target === 'dashboard') {
          await db.query(
            'INSERT INTO lomba_dashboard (nama, jenjang, harga, tanggal, tim, gambar, status, grup_wa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nama || 'Cabang Baru', jenjang || '', harga || '', tanggal || '', tim || '', gambar || '', status || 'Open', grup_wa || '']
          );
        } else {
          await db.query(
            'INSERT INTO lomba (judul, deskripsi, gambar, labels) VALUES (?, ?, ?, ?)',
            [judul || 'Lomba Baru', deskripsi || '', gambar || '', JSON.stringify(labels || [])]
          );
        }
      } else if (aksi === 'hapus') {
        const [lama] = await db.query(`SELECT gambar FROM ${tabel} WHERE id = ?`, [id]);
        if (lama.length > 0) await hapusFileFisik(lama[0].gambar);
        await db.query(`DELETE FROM ${tabel} WHERE id = ?`, [id]);
      } else {
        const [lama] = await db.query(`SELECT gambar FROM ${tabel} WHERE id = ?`, [id]);
        if (lama.length > 0 && lama[0].gambar !== gambar) await hapusFileFisik(lama[0].gambar);
        
        if (target === 'dashboard') {
          await db.query(
            'UPDATE lomba_dashboard SET nama = ?, jenjang = ?, harga = ?, tanggal = ?, tim = ?, gambar = ?, status = ?, grup_wa = ? WHERE id = ?',
            [nama, jenjang, harga, tanggal, tim, gambar, status, grup_wa, id]
          );
        } else {
          await db.query(
            'UPDATE lomba SET judul = ?, deskripsi = ?, gambar = ?, labels = ? WHERE id = ?',
            [judul, deskripsi, gambar, JSON.stringify(labels || []), id]
          );
        }
      }
    }

    // 3. Update Manajemen Guidebook
    if (data.guidebook) {
      const { id, foto, judul, deskripsi, tautan, aksi } = data.guidebook;
      
      if (aksi === 'tambah') {
        await db.query(
          'INSERT INTO guidebook (foto, judul, deskripsi, tautan) VALUES (?, ?, ?, ?)',
          [foto || '', judul || 'Judul Baru', deskripsi || '', tautan || '']
        );
      } else if (aksi === 'hapus') {
        const [lama] = await db.query('SELECT foto, tautan FROM guidebook WHERE id = ?', [id]);
        if (lama.length > 0) {
          await hapusFileFisik(lama[0].foto);
          await hapusFileFisik(lama[0].tautan);
        }
        await db.query('DELETE FROM guidebook WHERE id = ?', [id]);
      } else {
        const [lama] = await db.query('SELECT foto, tautan FROM guidebook WHERE id = ?', [id]);
        if (lama.length > 0) {
          if (lama[0].foto !== foto) await hapusFileFisik(lama[0].foto);
          if (lama[0].tautan !== tautan) await hapusFileFisik(lama[0].tautan);
        }
        await db.query(
          'UPDATE guidebook SET foto = ?, judul = ?, deskripsi = ?, tautan = ? WHERE id = ?',
          [foto, judul, deskripsi, tautan, id]
        );
      }
    }

    // 4. Update Manajemen Sponsor
    if (data.sponsor) {
      const { id, nama, logo, aksi } = data.sponsor;
      if (aksi === 'tambah') {
        await db.query('INSERT INTO sponsor (nama, gambarLogo) VALUES (?, ?)', [nama || 'Sponsor Baru', logo || '']);
      } else if (aksi === 'hapus') {
        const [lama] = await db.query('SELECT gambarLogo FROM sponsor WHERE id = ?', [id]);
        if (lama.length > 0) await hapusFileFisik(lama[0].gambarLogo);
        await db.query('DELETE FROM sponsor WHERE id = ?', [id]);
      } else {
        const [lama] = await db.query('SELECT gambarLogo FROM sponsor WHERE id = ?', [id]);
        if (lama.length > 0 && lama[0].gambarLogo !== logo) await hapusFileFisik(lama[0].gambarLogo);
        await db.query('UPDATE sponsor SET nama = ?, gambarLogo = ? WHERE id = ?', [nama, logo, id]);
      }
    }

    // 5. Update Bulk WA Groups
    if (data.wa_bulk && Array.isArray(data.wa_bulk)) {
      for (const item of data.wa_bulk) {
        if (item.id) {
          await db.query('UPDATE lomba_dashboard SET grup_wa = ? WHERE id = ?', [item.grup_wa || '', item.id]);
        }
      }
    }

    return NextResponse.json({ pesan: 'Berhasil diperbarui' });
  } catch (error) {
    console.error('Error Informasi Save:', error);
    return NextResponse.json({ pesan: 'Terjadi kesalahan sistem saat menyimpan data' }, { status: 500 });
  }
}
