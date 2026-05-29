import { hubungkanDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'sgdrc-rahasia-banget';

export async function GET(req) {
  try {
    // 1. Verifikasi Token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ pesan: "Sesi Berakhir" }), { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    // 2. Ambil Data Pendaftaran dari Database (Join dengan lomba_dashboard)
    const db = await hubungkanDB();
    const [rows] = await db.query(`
      SELECT p.*, l.nama as nama_lomba, l.grup_wa
      FROM pendaftaran p
      LEFT JOIN lomba_dashboard l ON p.lomba_id = l.id
      WHERE p.user_id = ?
      ORDER BY p.tanggal_pendaftaran DESC
    `, [userId]);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error Fetch Pendaftaran:", error);
    return new Response(JSON.stringify({ pesan: "Gagal mengambil data pendaftaran", error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
