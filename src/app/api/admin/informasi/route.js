import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifikasiAdmin } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

// Fungsi untuk hapus file dari folder
async function hapusFileFisik(pathRelatif) {
  if (!pathRelatif || !pathRelatif.startsWith('/uploads/')) return;
  try {
    const fullPath = join(process.cwd(), 'public', pathRelatif);
    await unlink(fullPath);
  } catch (err) {
    console.error(`Gagal menghapus file: ${pathRelatif}`, err.message);
  }
}

// Mengambil data pengaturan
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

// Mengupdate data pengaturan
export async function POST(request) {
  try {
    const { db, error } = await verifikasiAdmin(request);
    if (error) return error;

    const data = await request.json();

    // Update Pengaturan Umum
    if (data.umum) {
      for (const [key, nilaiRaw] of Object.entries(data.umum)) {
        const nilai = typeof nilaiRaw === 'object' ? JSON.stringify(nilaiRaw) : String(nilaiRaw);

        // Daftar key yang menyimpan file upload
        const keysFile = [
          'poster_utama', 'sertifikat_peserta', 'sertifikat_juara',
          'path_ttd', 'path_cap', 'path_logo_robotika', 'path_logo_sgdrc'
        ];

        // Hapus file lama jika ganti file baru
        if (keysFile.includes(key)) {
          const [lama] = await db.query('SELECT nilai FROM pengaturan WHERE nama_key = ?', [key]);
          if (lama.length > 0 && lama[0].nilai && lama[0].nilai !== nilai) {
            await hapusFileFisik(lama[0].nilai);
          }
        }

        // Hapus file fisik foto dokumentasi yang dihapus oleh admin
        if (key === 'foto_dokumentasi_list') {
          try {
            const [lama] = await db.query('SELECT nilai FROM pengaturan WHERE nama_key = ?', [key]);
            if (lama.length > 0 && lama[0].nilai) {
              const oldList = JSON.parse(lama[0].nilai);
              const newList = JSON.parse(nilai);
              if (Array.isArray(oldList) && Array.isArray(newList)) {
                const deletedFiles = oldList.filter(file => file && !newList.includes(file));
                for (const file of deletedFiles) {
                  await hapusFileFisik(file);
                }
              }
            }
          } catch (err) {
            console.error("Gagal membersihkan file dokumentasi lama:", err.message);
          }
        }

        // Cek apakah key sudah ada (update jika ada || insert data baru)
        const [cek] = await db.query('SELECT nama_key FROM pengaturan WHERE nama_key = ?', [key]);
        if (cek.length > 0) {
          await db.query('UPDATE pengaturan SET nilai = ? WHERE nama_key = ?', [nilai, key]);
        } else {
          await db.query('INSERT INTO pengaturan (nama_key, nilai) VALUES (?, ?)', [key, nilai]);
        }
      }
    }

    // Update Manajemen Lomba
    if (data.lomba) {
      const { id, nama, judul, jenjang, harga, tanggal, tim, gambar, grup_wa, deskripsi, status, labels, aksi, target } = data.lomba;

      // Tentukan tabel target
      const tabel = target === 'dashboard' ? 'lomba_dashboard' : 'lomba_landing_page';

      // Aksi tambah lomba
      if (aksi === 'tambah') {
        // Lomba Dashboard
        if (target === 'dashboard') {
          await db.query(
            'INSERT INTO lomba_dashboard (nama, jenjang, harga, tanggal, tim, gambar, status, grup_wa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nama || 'Cabang Baru', jenjang || '', harga || '', tanggal || '', tim || '', gambar || '', status || 'Open', grup_wa || '']
          );
        }
        // Lomba Landingpage
        else {
          await db.query(
            'INSERT INTO lomba_landing_page (judul, deskripsi, gambar, labels) VALUES (?, ?, ?, ?)',
            [judul || 'Lomba Baru', deskripsi || '', gambar || '', JSON.stringify(labels || [])]
          );
        }

        // Hapus Lomba
      } else if (aksi === 'hapus') {
        const [lama] = await db.query(`SELECT gambar FROM ${tabel} WHERE id = ?`, [id]);
        if (lama.length > 0) await hapusFileFisik(lama[0].gambar);
        await db.query(`DELETE FROM ${tabel} WHERE id = ?`, [id]);

        // Update Lomba
      } else {
        const [lama] = await db.query(`SELECT gambar FROM ${tabel} WHERE id = ?`, [id]);
        if (lama.length > 0 && lama[0].gambar !== gambar) await hapusFileFisik(lama[0].gambar);

        // Lomba Dahsboard
        if (target === 'dashboard') {
          await db.query(
            'UPDATE lomba_dashboard SET nama = ?, jenjang = ?, harga = ?, tanggal = ?, tim = ?, gambar = ?, status = ?, grup_wa = ? WHERE id = ?',
            [nama, jenjang, harga, tanggal, tim, gambar, status, grup_wa, id]
          );

          // Lomba Landingpage
        } else {
          await db.query(
            'UPDATE lomba_landing_page SET judul = ?, deskripsi = ?, gambar = ?, labels = ? WHERE id = ?',
            [judul, deskripsi, gambar, JSON.stringify(labels || []), id]
          );
        }
      }
    }

    // Update Manajemen Guidebook
    if (data.guidebook) {
      const { id, foto, judul, deskripsi, tautan, aksi } = data.guidebook;

      // Tambah GuideBook
      if (aksi === 'tambah') {
        await db.query(
          'INSERT INTO guidebook (foto, judul, deskripsi, tautan) VALUES (?, ?, ?, ?)',
          [foto || '', judul || 'Judul Baru', deskripsi || '', tautan || '']
        );

        // Hapus GuideBook
      } else if (aksi === 'hapus') {
        const [lama] = await db.query('SELECT foto, tautan FROM guidebook WHERE id = ?', [id]);
        if (lama.length > 0) {
          await hapusFileFisik(lama[0].foto);
          await hapusFileFisik(lama[0].tautan);
        }
        await db.query('DELETE FROM guidebook WHERE id = ?', [id]);

        // Update GuideBook
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

    // Update Manajemen Sponsor
    if (data.sponsor) {
      const { id, nama, logo, aksi } = data.sponsor;

      // Tambah Sponsor
      if (aksi === 'tambah') {
        await db.query('INSERT INTO sponsor (nama, gambarLogo) VALUES (?, ?)', [nama || 'Sponsor Baru', logo || '']);

        // Hapus Sponsor
      } else if (aksi === 'hapus') {
        const [lama] = await db.query('SELECT gambarLogo FROM sponsor WHERE id = ?', [id]);
        if (lama.length > 0) await hapusFileFisik(lama[0].gambarLogo);
        await db.query('DELETE FROM sponsor WHERE id = ?', [id]);

        // Update Sponsor
      } else {
        const [lama] = await db.query('SELECT gambarLogo FROM sponsor WHERE id = ?', [id]);
        if (lama.length > 0 && lama[0].gambarLogo !== logo) await hapusFileFisik(lama[0].gambarLogo);
        await db.query('UPDATE sponsor SET nama = ?, gambarLogo = ? WHERE id = ?', [nama, logo, id]);
      }
    }

    // Update Wa Grup
    if (data.wa_bulk && Array.isArray(data.wa_bulk)) {
      for (const item of data.wa_bulk) {
        if (item.id) {
          await db.query('UPDATE lomba_dashboard SET grup_wa = ? WHERE id = ?', [item.grup_wa || '', item.id]);
        }
      }
    }

    // Respon Berhasil
    return NextResponse.json({ pesan: 'Berhasil diperbarui' });

    // Error Server
  } catch (error) {
    console.error('Error Informasi Save:', error);
    return NextResponse.json({ pesan: 'Terjadi kesalahan sistem saat menyimpan data' }, { status: 500 });
  }
}
