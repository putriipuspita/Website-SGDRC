import { hubungkanDB } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function GET(req) {
  let linkTujuan = '';
  
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response("Token tidak valid", { status: 400 });
    }

    const db = await hubungkanDB();

    // 1. Cari user
    const [rows] = await db.query('SELECT id FROM users WHERE token_verifikasi = ?', [token]);
    if (rows.length === 0) {
      return new Response("Link verifikasi sudah tidak berlaku atau sudah digunakan.", { status: 400 });
    }

    const userId = rows[0].id;

    // 2. Aktifkan User
    await db.query(
      'UPDATE users SET status_verifikasi = 1, token_verifikasi = NULL WHERE id = ?',
      [userId]
    );

    // Siapkan alamat tujuan
    linkTujuan = '/verifikasi-berhasil';

  } catch (error) {
    console.error("Error Verification:", error);
    return new Response("Terjadi kesalahan server saat verifikasi.", { status: 500 });
  }

  // PENTING: Redirect harus di luar try-catch agar tidak dianggap error oleh Next.js
  if (linkTujuan) {
    redirect(linkTujuan);
  }
}

export async function POST(req) {
  try {
    const { token } = await req.json();
    const db = await hubungkanDB();
    const [rows] = await db.query('SELECT id FROM users WHERE token_verifikasi = ?', [token]);
    if (rows.length === 0) return new Response(JSON.stringify({ pesan: "Gagal" }), { status: 400 });
    await db.query('UPDATE users SET status_verifikasi = 1, token_verifikasi = NULL WHERE id = ?', [rows[0].id]);
    return new Response(JSON.stringify({ pesan: "Sukses" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ pesan: "Error" }), { status: 500 });
  }
}
