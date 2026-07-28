import { NextResponse } from 'next/server';
import { verifikasiAdmin } from '@/lib/auth';
import { sinkronisasiSemuaPendaftaran } from '@/lib/sheetHelper';
import bcrypt from 'bcryptjs';

// Fungsi Ambil daftar akun peserta
export async function GET(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    // Ambil seluruh akun peserta yang sudah terverifikasi
    const [users] = await db.query(`
      SELECT id, nama, email 
      FROM users 
      WHERE role = 'peserta' AND status_verifikasi = 1 
      ORDER BY id DESC
    `);

    // Kirim data peserta
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ pesan: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// FungsiTambah akun peserta baru
export async function POST(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    // Ambil data
    const { nama, email, password } = await req.json();

    // Validasi data
    if (!nama || !email || !password) {
      return NextResponse.json({ pesan: "Semua data wajib diisi" }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ pesan: "Email sudah terdaftar" }, { status: 400 });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan akun peserta baru ke database
    await db.query(
      "INSERT INTO users (nama, email, password, role, status_verifikasi) VALUES (?, ?, ?, 'peserta', 1)",
      [nama, email, hashedPassword]
    );

    return NextResponse.json({ pesan: "Akun berhasil dibuat" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ pesan: "Gagal membuat akun" }, { status: 500 });
  }
}

// Fungsi menghapus file fisik
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

// Fungsi Hapus akun peserta
export async function DELETE(req) {
  try {
    const { decoded, db, error } = await verifikasiAdmin(req);
    if (error) return error;

    // Ambil ID user yang akan dihapus
    const { id } = await req.json();

    // Cegah admin menghapus akun sendiri
    if (id === decoded.id) {
      return NextResponse.json({ pesan: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
    }

    // Ambil Seluruh File Pendaftaran dari user ini sebelum dihapus
    const [daftarPendaftaran] = await db.query(
      "SELECT file_bukti_bayar, file_bukti_refund, file_kartu_siswa, file_follow_ig, file_follow_ig_robotika FROM pendaftaran WHERE user_id = ?",
      [id]
    );

    // Hapus data pendaftaran
    await db.query("DELETE FROM pendaftaran WHERE user_id = ?", [id]);
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    // Sinkronisasi perubahan ke Google Sheets
    sinkronisasiSemuaPendaftaran().catch(err => console.error("Gagal sinkronisasi Sheets saat hapus user:", err));

    // Hapus seluruh file fisik berkas pendaftaran user tersebut
    for (const p of daftarPendaftaran) {
      const filePaths = [
        p.file_bukti_bayar,
        p.file_bukti_refund,
        p.file_kartu_siswa,
        p.file_follow_ig,
        p.file_follow_ig_robotika
      ];

      for (const path of filePaths) {
        if (path) await hapusFileFisik(path);
      }
    }

    return NextResponse.json({ pesan: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ pesan: "Gagal menghapus user" }, { status: 500 });
  }
}
