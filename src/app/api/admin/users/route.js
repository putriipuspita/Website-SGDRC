import { NextResponse } from 'next/server';
import { verifikasiAdmin } from '@/lib/auth';
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

    // Hapus data pendaftaran
    await db.query("DELETE FROM pendaftaran WHERE user_id = ?", [id]);
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ pesan: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ pesan: "Gagal menghapus user" }, { status: 500 });
  }
}
