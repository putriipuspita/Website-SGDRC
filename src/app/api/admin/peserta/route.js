import { hubungkanDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'sgdrc-rahasia-banget';

// 1. Ambil Data Peserta (dengan Search & Filter Slug)
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ pesan: "Sesi habis" }), { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const db = await hubungkanDB();

    // Cek apakah user masih ada dan rolenya admin di DB
    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (user.length === 0 || user[0].role !== 'admin') {
      return new Response(JSON.stringify({ pesan: "Akses ditolak" }), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug'); 
    const cari = searchParams.get('search');
    
    let query = `
      SELECT p.*, u.email, l.nama as nama_lomba 
      FROM pendaftaran p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN lomba_dashboard l ON p.lomba_id = l.id
      WHERE 1=1
    `;
    
    let params = [];
    
    if (slug) {
      const namaLombaDB = slug.replace(/-/g, ' ').toUpperCase();
      query += ` AND l.nama = ?`;
      params.push(namaLombaDB);
    }

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
    
    query += ` ORDER BY p.tanggal_pendaftaran DESC`;

    const [rows] = await db.query(query, params);
    
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error Admin Fetch Peserta:", error);
    return new Response(JSON.stringify({ pesan: "Gagal mengambil data" }), { status: 500 });
  }
}

import { kirimEmailNotifikasi } from '@/lib/email';

// Helper Hapus File
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

// 2. Update Status Pendaftaran (Dukungan Upload Bukti Refund)
export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ pesan: "Sesi habis" }), { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = await hubungkanDB();

    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (user.length === 0 || user[0].role !== 'admin') return new Response(null, { status: 403 });

    const formData = await req.formData();
    const id = formData.get('id');
    const status = formData.get('status');
    const catatan = formData.get('catatan') || '';
    const fileRefund = formData.get('buktiRefund');

    const [peserta] = await db.query(
      `SELECT p.nama_tim, p.nama_peserta1, u.email 
       FROM pendaftaran p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`, 
      [id]
    );

    if (peserta.length === 0) return new Response(JSON.stringify({ pesan: "Data tidak ditemukan" }), { status: 404 });

    const resetRefund = formData.get('resetRefund');
    const [pesertaFull] = await db.query(`SELECT status_pendaftaran, file_bukti_refund FROM pendaftaran WHERE id = ?`, [id]);
    const isKoreksi = status === 'refund' && pesertaFull[0].status_pendaftaran === 'refund';

    // 1. Logika RESET (Kembali ke Terverifikasi)
    if (resetRefund === 'true') {
        // HAPUS FILE FISIK REFUND LAMA
        if (pesertaFull[0].file_bukti_refund) await hapusFileFisik(pesertaFull[0].file_bukti_refund);
        
        await db.query(`UPDATE pendaftaran SET status_pendaftaran = 'success', file_bukti_refund = NULL WHERE id = ?`, [id]);
        return new Response(JSON.stringify({ pesan: "Status berhasil di-reset ke Terverifikasi" }), { status: 200 });
    }

    let query = `UPDATE pendaftaran SET status_pendaftaran = ?, catatan_admin = ?`;
    let params = [status, catatan];

    // Jika ada file refund
    if (fileRefund && typeof fileRefund !== 'string') {
        // HAPUS FILE FISIK REFUND LAMA JIKA ADA (SEBELUM GANTI BARU)
        if (pesertaFull[0].file_bukti_refund) await hapusFileFisik(pesertaFull[0].file_bukti_refund);

        const { writeFile } = await import('fs/promises');
        const { join } = await import('path');
        const bytes = await fileRefund.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-refund-${fileRefund.name.replace(/\s+/g, '_')}`;
        const pathBukti = `/uploads/pendaftaran/${fileName}`;
        const fullPath = join(process.cwd(), 'public', pathBukti);
        await writeFile(fullPath, buffer);
        
        query += `, file_bukti_refund = ?`;
        params.push(pathBukti);
    }

    query += ` WHERE id = ?`;
    params.push(id);
    await db.query(query, params);

    const host = req.headers.get('host');
    const linkBukti = status === 'refund' ? (params.length > 2 ? params[2] : pesertaFull[0].file_bukti_refund) : null;
    
    kirimEmailNotifikasi(peserta[0].email, peserta[0].nama_tim || peserta[0].nama_peserta1, status, catatan, host, linkBukti, isKoreksi);

    return new Response(JSON.stringify({ pesan: "Status berhasil diupdate" }), { status: 200 });
  } catch (error) {
    console.error("Gagal update status:", error);
    return new Response(JSON.stringify({ pesan: "Gagal update status" }), { status: 500 });
  }
}

// 3. Edit Data Peserta
export async function PUT(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = await hubungkanDB();

    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (user.length === 0 || user[0].role !== 'admin') return new Response(null, { status: 403 });

    const formData = await req.formData();
    const id = formData.get('id');

    let pathBuktiBaru = null;
    const file = formData.get('buktiTransfer');
    if (file && typeof file !== 'string') {
        const { writeFile, mkdir } = await import('fs/promises');
        const { join, dirname } = await import('path');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-edit-${file.name.replace(/\s+/g, '_')}`;
        pathBuktiBaru = `/uploads/pendaftaran/${fileName}`;
        const fullPath = join(process.cwd(), 'public', pathBuktiBaru);
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, buffer);
    }

    let query = `
      UPDATE pendaftaran SET 
        nama_tim = ?, nama_peserta1 = ?, nama_peserta2 = ?, nama_peserta3 = ?, 
        asal_instansi = ?, jenjang = ?, whatsapp = ?, peringkat = ?, is_sertifikat_siap = ?
    `;
    let params = [
      formData.get('nama_tim'), formData.get('nama_peserta1'), formData.get('nama_peserta2'), formData.get('nama_peserta3'),
      formData.get('asal_instansi'), formData.get('jenjang'), formData.get('whatsapp'),
      formData.get('peringkat') || null, formData.get('is_sertifikat_siap') || 0
    ];

    if (pathBuktiBaru) {
      query += `, file_bukti_bayar = ?`;
      params.push(pathBuktiBaru);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await db.query(query, params);
    return new Response(JSON.stringify({ pesan: "Data berhasil diperbarui" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal update data" }), { status: 500 });
  }
}

// 4. Hapus Pendaftaran (Auto-Delete Files)
export async function DELETE(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ pesan: "Sesi Berakhir" }), { status: 401 });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = await hubungkanDB();

    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (user.length === 0 || user[0].role !== 'admin') return new Response(null, { status: 403 });

    const { id } = await req.json();

    // AMBIL PATH SELURUH FILE SEBELUM DIHAPUS
    const [pendaftar] = await db.query(
      "SELECT file_bukti_bayar, file_bukti_refund, file_kartu_siswa, file_follow_ig, file_follow_ig_robotika, file_follow_tiktok FROM pendaftaran WHERE id = ?", 
      [id]
    );
    
    // HAPUS DARI DATABASE
    await db.query("DELETE FROM pendaftaran WHERE id = ?", [id]);

    // HAPUS FILE FISIK JIKA ADA
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

    return new Response(JSON.stringify({ pesan: "Data dan seluruh berkas berhasil dihapus permanen" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal menghapus data" }), { status: 500 });
  }
}

// 5. Tambah Peserta Manual
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = await hubungkanDB();

    const [userAdmin] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
    if (userAdmin.length === 0 || userAdmin[0].role !== 'admin') return new Response(null, { status: 403 });

    const formData = await req.formData();
    const slug = formData.get('slug');
    const email = formData.get('email');
    
    let lombaId = null;
    if (slug) {
        const namaLombaDB = slug.replace(/-/g, ' ').toUpperCase();
        const [lomba] = await db.query("SELECT id FROM lomba_dashboard WHERE nama = ?", [namaLombaDB]);
        if (lomba.length > 0) lombaId = lomba[0].id;
    }

    if (!lombaId) return new Response(JSON.stringify({ pesan: "Lomba tidak valid" }), { status: 400 });

    const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (user.length === 0) return new Response(JSON.stringify({ pesan: "User tidak ditemukan" }), { status: 400 });

    let pathBukti = null;
    const file = formData.get('buktiTransfer');
    if (file && typeof file !== 'string') {
        const { writeFile, mkdir } = await import('fs/promises');
        const { join, dirname } = await import('path');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-admin-${file.name.replace(/\s+/g, '_')}`;
        pathBukti = `/uploads/pendaftaran/${fileName}`;
        const fullPath = join(process.cwd(), 'public', pathBukti);
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, buffer);
    }

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

    return new Response(JSON.stringify({ pesan: "Peserta berhasil ditambahkan" }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ pesan: "Gagal menambah peserta" }), { status: 500 });
  }
}
