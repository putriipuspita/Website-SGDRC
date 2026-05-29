import { verifikasiUser } from '@/lib/auth';

// Fungsi pendaftaran
export async function GET(req) {
  try {
    const { decoded, db, error } = await verifikasiUser(req);
    if (error) return error;

    const userId = decoded.id;

    // Ambil semua pendaftaran milik user
    const [rows] = await db.query(`
      SELECT p.*, l.nama as nama_lomba, l.grup_wa
      FROM pendaftaran p
      LEFT JOIN lomba_dashboard l ON p.lomba_id = l.id
      WHERE p.user_id = ?
      ORDER BY p.tanggal_pendaftaran DESC
    `, [userId]);

    // Ambil pendaftaran
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
