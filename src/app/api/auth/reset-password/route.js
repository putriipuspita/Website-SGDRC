import { hubungkanDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, passwordBaru } = await req.json();

    if (!token || !passwordBaru) {
      return new Response(JSON.stringify({ pesan: "Data tidak lengkap" }), { status: 400 });
    }

    const db = await hubungkanDB();

    // 1. Cari user dengan token yang valid dan belum expired
    const [users] = await db.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return new Response(JSON.stringify({ pesan: "Token tidak valid atau telah kedaluwarsa" }), { status: 400 });
    }

    const user = users[0];

    // 2. Hash Password Baru
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(passwordBaru, salt);

    // 3. Update Password dan Hapus Token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashedPass, user.id]
    );

    return new Response(JSON.stringify({ pesan: "Password berhasil diperbarui! Silakan login kembali." }), { status: 200 });

  } catch (error) {
    console.error("Error Reset Password:", error);
    return new Response(JSON.stringify({ pesan: "Terjadi kesalahan server" }), { status: 500 });
  }
}
