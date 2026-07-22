import { verifikasiAdmin, simpanBerkasUpload } from '@/lib/auth';
import { sinkronisasiSemuaPendaftaran } from '@/lib/sheetHelper';

// Fungsi mengambil data peserta
export async function GET(req) {
  try {
    // Verifikasi admin
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    // Ambil Parameter URL
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const cari = searchParams.get('search');

    // Ambil data peserta
    let query = `
      SELECT p.*, u.email, l.nama as nama_lomba 
      FROM pendaftaran p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN lomba_dashboard l ON p.lomba_id = l.id
      WHERE 1=1
    `;

    let params = [];

    // Filter berdasarka nama lomba
    if (slug) {
      const namaLombaDB = slug.replace(/-/g, ' ').toUpperCase();
      query += ` AND l.nama = ?`;
      params.push(namaLombaDB);
    }

    // Filter Pencarian Peserta
    if (cari) {
      query += ` AND (
        p.nama_tim LIKE ? OR 
        p.nama_peserta1 LIKE ? OR 
        p.nama_peserta2 LIKE ? OR 
        p.nama_peserta3 LIKE ? OR
        p.asal_instansi LIKE ?
      )`;
      const keyword = `%${cari}%`;
      params.push(keyword, keyword, keyword, keyword, keyword);
    }

    // Urutkan Berdasarkan Tanggal Pendaftaran
    query += ` ORDER BY p.tanggal_pendaftaran DESC`;
    const [rows] = await db.query(query, params);

    // Respons Berhasi;
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    // Error Server
  } catch (error) {
    console.error("Error Admin Fetch Peserta:", error);
    return new Response(JSON.stringify({ pesan: "Gagal mengambil data" }), { status: 500 });
  }
}

import { kirimEmailNotifikasi } from '@/lib/email';

// Fungsi menghapus file
async function hapusFileFisik(pathRelatif) {
  if (!pathRelatif || !pathRelatif.startsWith('/uploads/')) return;
  try {
    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    const fullPath = join(process.cwd(), 'public', pathRelatif);
    await unlink(fullPath);
  } catch (err) {
    console.error(`Gagal hapus file: ${pathRelatif}`, err.message);
  }
}

// Fungsi update status pendaftaran
export async function PATCH(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    // Ambil data input
    const formData = await req.formData();
    const id = formData.get('id');
    const status = formData.get('status');
    const catatan = formData.get('catatan') || '';
    const fileRefund = formData.get('buktiRefund');

    // Ambil data peserta
    const [peserta] = await db.query(
      `SELECT p.nama_tim, p.nama_peserta1, u.email 
       FROM pendaftaran p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [id]
    );

    // Validasi peserta
    if (peserta.length === 0) return new Response(JSON.stringify({ pesan: "Data tidak ditemukan" }), { status: 404 });

    // Logika reset status
    const resetRefund = formData.get('resetRefund');
    const [pesertaFull] = await db.query(`SELECT status_pendaftaran, file_bukti_refund FROM pendaftaran WHERE id = ?`, [id]);
    const isKoreksi = status === 'refund' && pesertaFull[0].status_pendaftaran === 'refund';

    // Logika reset (kembali terverfikasi)
    if (resetRefund === 'true') {
      if (pesertaFull[0].file_bukti_refund) await hapusFileFisik(pesertaFull[0].file_bukti_refund);

      // Update status database
      await db.query(`UPDATE pendaftaran SET status_pendaftaran = 'success', file_bukti_refund = NULL WHERE id = ?`, [id]);
      sinkronisasiSemuaPendaftaran().catch(err => console.error("Gagal sinkronisasi Sheets saat reset status:", err));
      return new Response(JSON.stringify({ pesan: "Status berhasil di-reset ke Terverifikasi" }), { status: 200 });
    }

    // Query update status
    let query = `UPDATE pendaftaran SET status_pendaftaran = ?, catatan_admin = ?`;
    let params = [status, catatan];

    // Upload Bukti Refund Baru
    if (fileRefund && typeof fileRefund !== 'string') {
      // Hapus File Refund Lama
      if (pesertaFull[0].file_bukti_refund) await hapusFileFisik(pesertaFull[0].file_bukti_refund);

      const pathBukti = await simpanBerkasUpload(fileRefund, 'refund');
      if (pathBukti) {
        query += `, file_bukti_refund = ?`;
        params.push(pathBukti);
      }
    }

    // Jalankan Update Database
    query += ` WHERE id = ?`;
    params.push(id);
    await db.query(query, params);

    sinkronisasiSemuaPendaftaran().catch(err => console.error("Gagal sinkronisasi Sheets saat update status:", err));

    // Kirim email notifikasi
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const linkBukti = status === 'refund' ? (params.length > 2 ? params[2] : pesertaFull[0].file_bukti_refund) : null;
    kirimEmailNotifikasi(peserta[0].email, peserta[0].nama_tim || peserta[0].nama_peserta1, status, catatan, host, linkBukti, isKoreksi);

    // Respons Berhasil
    return new Response(JSON.stringify({ pesan: "Status berhasil diupdate" }), { status: 200 });

    // Error Server
  } catch (error) {
    console.error("Gagal update status:", error);
    return new Response(JSON.stringify({ pesan: "Gagal update status" }), { status: 500 });
  }
}

// Edit Data Peserta
export async function PUT(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    const formData = await req.formData();
    const id = formData.get('id');

    // Upload Bukti Transfer
    const file = formData.get('buktiTransfer');
    const pathBuktiBaru = await simpanBerkasUpload(file, 'edit');

    // Query Update Data
    let query = `
      UPDATE pendaftaran SET 
        nama_tim = ?, nama_peserta1 = ?, nama_peserta2 = ?, nama_peserta3 = ?, 
        asal_instansi = ?, jenjang = ?, whatsapp = ?, peringkat = ?, is_sertifikat_siap = ?
    `;

    // Variabel Parameter Update
    let params = [
      formData.get('nama_tim'), formData.get('nama_peserta1'), formData.get('nama_peserta2'), formData.get('nama_peserta3'),
      formData.get('asal_instansi'), formData.get('jenjang'), formData.get('whatsapp'),
      formData.get('peringkat') || null, formData.get('is_sertifikat_siap') || 0
    ];

    // Upload Bukti Transfer
    if (pathBuktiBaru) {
      // Ambil file bukti bayar lama sebelum update
      const [pesertaLama] = await db.query(
        "SELECT file_bukti_bayar FROM pendaftaran WHERE id = ?",
        [id]
      );
      if (pesertaLama.length > 0 && pesertaLama[0].file_bukti_bayar) {
        await hapusFileFisik(pesertaLama[0].file_bukti_bayar);
      }
      query += `, file_bukti_bayar = ?`;
      params.push(pathBuktiBaru);
    }

    // Execute Query
    query += ` WHERE id = ?`;
    params.push(id);

    // Update Database
    await db.query(query, params);
    sinkronisasiSemuaPendaftaran().catch(err => console.error("Gagal sinkronisasi Sheets saat edit data:", err));
    return new Response(JSON.stringify({ pesan: "Data berhasil diperbarui" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal update data" }), { status: 500 });
  }
}

// Fungsi Hapus Pendaftaran
export async function DELETE(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    const { id } = await req.json();

    // Ambil Seluruh File Peserta
    const [pendaftar] = await db.query(
      "SELECT file_bukti_bayar, file_bukti_refund, file_kartu_siswa, file_follow_ig, file_follow_ig_robotika, file_follow_tiktok FROM pendaftaran WHERE id = ?",
      [id]
    );

    // Hapus Dari Database
    await db.query("DELETE FROM pendaftaran WHERE id = ?", [id]);
    sinkronisasiSemuaPendaftaran().catch(err => console.error("Gagal sinkronisasi Sheets saat hapus data:", err));

    // Hapus File Fisik
    if (pendaftar.length > 0) {
      const p = pendaftar[0];
      const filePaths = [
        p.file_bukti_bayar,
        p.file_bukti_refund,
        p.file_kartu_siswa,
        p.file_follow_ig,
        p.file_follow_ig_robotika,
        p.file_follow_tiktok
      ];

      for (const path of filePaths) {
        if (path) await hapusFileFisik(path);
      }
    }

    // Respon Berhasil dan Error
    return new Response(JSON.stringify({ pesan: "Data dan seluruh berkas berhasil dihapus permanen" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal menghapus data" }), { status: 500 });
  }
}

// Fungsi Tambah Peserta Manual
export async function POST(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    // Ambil Data Form
    const formData = await req.formData();
    const slug = formData.get('slug');
    const email = formData.get('email');

    let lombaId = null;
    // Ambil ID Lomba Berdasarakan Slug
    if (slug) {
      const namaLombaDB = slug.replace(/-/g, ' ').toUpperCase();
      const [lomba] = await db.query("SELECT id FROM lomba_dashboard WHERE nama = ?", [namaLombaDB]);
      if (lomba.length > 0) lombaId = lomba[0].id;
    }

    // Validasi Lomba
    if (!lombaId) return new Response(JSON.stringify({ pesan: "Lomba tidak valid" }), { status: 400 });

    // Cari User Berdasarkan Email
    const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (user.length === 0) return new Response(JSON.stringify({ pesan: "User tidak ditemukan" }), { status: 400 });

    // Upload Bukti Transfer
    const file = formData.get('buktiTransfer');
    const pathBukti = await simpanBerkasUpload(file, 'admin');

    // Simpan Data Peserta Baru
    await db.query(
      `INSERT INTO pendaftaran (
        user_id, lomba_id, nama_tim, nama_peserta1, nama_peserta2, nama_peserta3, 
        asal_instansi, jenjang, whatsapp, file_bukti_bayar, status_pendaftaran, tanggal_pendaftaran
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'success', NOW())`,
      [
        user[0].id, lombaId, formData.get('nama_tim') || null, formData.get('nama_peserta1'),
        formData.get('nama_peserta2') || null, formData.get('nama_peserta3') || null,
        formData.get('asal_instansi'), formData.get('jenjang'), formData.get('whatsapp'),
        pathBukti
      ]
    );

    // Respon Berhasil dan Error
    return new Response(JSON.stringify({ pesan: "Peserta berhasil ditambahkan" }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal menambah peserta" }), { status: 500 });
  }
}
