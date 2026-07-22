import { hubungkanDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { kirimEmailVerifikasi } from '@/lib/email';

// Fungsi register
export async function POST(req) {
  try {
    const { nama, email, password } = await req.json();

    // Validasi input
    if (!nama || !email || !password) {
      return new Response(JSON.stringify({ pesan: "Data tidak lengkap" }), { status: 400 });
    }

    // Koneksi database
    const db = await hubungkanDB();

    // Cek user apakah sudah ada
    const [userAda] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userAda.length > 0) {
      return new Response(JSON.stringify({ pesan: "Email sudah terdaftar" }), { status: 400 });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const tokenVerifikasi = crypto.randomBytes(32).toString('hex');

    // Simpan ke Database
    await db.query(
      'INSERT INTO users (nama, email, password, token_verifikasi, role) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashedPassword, tokenVerifikasi, 'peserta']
    );

    // Ambil host dan protocol untuk link verifikasi
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const linkVerifikasi = `${protocol}://${host}/api/auth/verify?token=${tokenVerifikasi}`;

    // Kirim email verifikasi
    kirimEmailVerifikasi(email, nama, linkVerifikasi).catch(err => console.error("Gagal kirim email verifikasi:", err));

    // Respons
    return new Response(JSON.stringify({
      pesan: "Registrasi berhasil! Silakan cek email Anda."
    }), { status: 201 });

  } catch (error) {
    console.error("Error Register:", error);
    return new Response(JSON.stringify({ pesan: "Terjadi kesalahan server" }), { status: 500 });
  }
}
