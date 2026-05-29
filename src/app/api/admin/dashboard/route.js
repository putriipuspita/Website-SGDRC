import { verifikasiAdmin } from '@/lib/auth';

// Endpoint GET statistik dashboard admin
export async function GET(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    try {
      // Statistik total pendaftar
      const [totalRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);

      // Statistik pendaftar sukses
      const [successRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE status_pendaftaran = 'success' 
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);

      // Statistik pendaftar pending
      const [pendingRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE status_pendaftaran = 'pending' 
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);

      // Statistik pendaftar refund
      const [refundRows] = await db.query(`
        SELECT COUNT(*) as jumlah FROM pendaftaran p 
        WHERE status_pendaftaran = 'refund' 
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
      `);

      // Data pendaftar tiap lomba
      const [lombaStats] = await db.query(`
        SELECT l.nama, COUNT(p.id) as jumlah 
        FROM lomba_dashboard l
        LEFT JOIN pendaftaran p ON l.id = p.lomba_id AND p.status_pendaftaran = 'success'
        WHERE p.id IS NULL OR EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id)
        GROUP BY l.id
      `);

      // Response berhasil
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

      // Error database
    } catch (dbError) {
      console.error("DB Error Dashboard:", dbError);
      return new Response(JSON.stringify({ pesan: "Database bermasalah: " + dbError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Error server
  } catch (error) {
    console.error("Dashboard Error:", error);
    return new Response(JSON.stringify({ pesan: "Terjadi kesalahan server internal" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
