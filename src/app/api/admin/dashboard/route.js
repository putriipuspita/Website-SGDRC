import { hubungkanDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'sgdrc-rahasia-banget';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ pesan: "Sesi habis, silakan login ulang" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return new Response(JSON.stringify({ pesan: "Token tidak valid" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (decoded.role !== 'admin') {
      return new Response(JSON.stringify({ pesan: "Akses ditolak" }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = await hubungkanDB();
    
    // Pastikan koneksi database aman
    try {
      // 1. Total Pendaftar (Hanya yang user-nya masih ada)
      const [totalRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);
      const [successRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE status_pendaftaran = 'success' 
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);
      const [pendingRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE status_pendaftaran = 'pending' 
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);
      const [refundRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE status_pendaftaran = 'refund' 
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);

      // 2. Statistik Per Lomba (Hanya hitung yang Terverifikasi/Success)
      const [lombaStats] = await db.query(`
        SELECT l.nama, COUNT(p.id) as jumlah 
        FROM lomba_dashboard l
        LEFT JOIN pendaftaran p ON l.id = p.lomba_id AND p.status_pendaftaran = 'success'
        WHERE p.id IS NULL OR EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
        GROUP BY l.id
      `);

      return new Response(JSON.stringify({
        statistikUtama: {
          total: totalRows[0].jumlah,
          success: successRows[0].jumlah,
          pending: pendingRows[0].jumlah,
          refund: refundRows[0].jumlah
        },
        statistikLomba: lombaStats
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error("DB Error Dashboard:", dbError);
      return new Response(JSON.stringify({ pesan: "Database bermasalah: " + dbError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error("Dashboard Error:", error);
    return new Response(JSON.stringify({ pesan: "Terjadi kesalahan server internal" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
