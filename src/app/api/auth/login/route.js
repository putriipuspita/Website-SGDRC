import { hubungkanDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/auth';

// Fungsi login user
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validasi input
    if (!email || !password) {
      return new Response(JSON.stringify({ pesan: "Email dan password wajib diisi" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hubungkan database
    let db;
    try {
      db = await hubungkanDB();
    } catch (dbError) {
      console.error("DB Connection Error:", dbError);
      return new Response(JSON.stringify({ pesan: "Gagal terhubung ke database. Pastikan MySQL di XAMPP sudah aktif." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cari user berdasarkan email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ pesan: "Akun tidak ditemukan" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = rows[0];

    // Cek apakah sudah verifikasi email
    if (user.status_verifikasi === 0) {
      return new Response(JSON.stringify({ pesan: "Email Anda belum diverifikasi. Silakan cek inbox Anda." }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cek Password
    const passwordCocok = await bcrypt.compare(password, user.password);
    if (!passwordCocok) {
      return new Response(JSON.stringify({ pesan: "Password salah" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buat Token JWT
    const token = jwt.sign(
      { id: user.id, nama: user.nama, role: user.role },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    // Response login berhasil
    return new Response(JSON.stringify({
      pesan: "Login berhasil",
      token,
      user: { id: user.id, nama: user.nama, role: user.role }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error Login:", error);
    return new Response(JSON.stringify({ pesan: "Terjadi kesalahan server" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
