import { hubungkanDB } from '@/lib/db';
import crypto from 'crypto';
import { kirimEmailResetPassword } from '@/lib/email';

// Fungsi Lupa Password
export async function POST(req) {
  try {
    const { email } = await req.json();
    const host = req.headers.get('host');

    // Validasi email wajib diisi
    if (!email) {
      return new Response(JSON.stringify({ pesan: "Email wajib diisi" }), { status: 400 });
    }

    // Hubungkan Database
    const db = await hubungkanDB();

    // Cek user
    const [users] = await db.query('SELECT id, nama, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return new Response(JSON.stringify({ pesan: "Email belum terdaftar dalam sistem." }), { status: 404 });
    }

    const user = users[0];

    // Buat token reset
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);

    // Simpan token reset ke database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [token, expiry, user.id]
    );

    // Kirim Email
    const emailTerkirim = await kirimEmailResetPassword(user.email, user.nama, token, host);

    // Response
    if (emailTerkirim) {
      return new Response(JSON.stringify({ pesan: "Link reset berhasil dikirim ke email." }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ pesan: "Gagal kirim email." }), { status: 500 });
    }

  } catch (error) {
    console.error("Error Forgot Password:", error);
    return new Response(JSON.stringify({ pesan: "Terjadi kesalahan server" }), { status: 500 });
  }
}
