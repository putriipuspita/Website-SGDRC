import { hubungkanDB } from '@/lib/db';
import crypto from 'crypto';
import { kirimEmailResetPassword } from '@/lib/email';

export async function POST(req) {
  try {
    const { email } = await req.json();
    const host = req.headers.get('host');

    if (!email) {
      return new Response(JSON.stringify({ pesan: "Email wajib diisi" }), { status: 400 });
    }

    const db = await hubungkanDB();

    // 1. Cek User
    const [users] = await db.query('SELECT id, nama, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return new Response(JSON.stringify({ pesan: "Cek email Anda untuk instruksi reset." }), { status: 200 });
    }

    const user = users[0];

    // 2. Buat Token Reset (Random String)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 jam dari sekarang

    // 3. Simpan Token ke Database
    // Pastikan Anda sudah menambahkan kolom reset_token dan reset_expires di tabel users
    await db.query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [token, expiry, user.id]
    );

    // 4. Kirim Email
    const emailTerkirim = await kirimEmailResetPassword(user.email, user.nama, token, host);

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
