import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await hubungkanDB();
    
    // Ambil data dari lomba_landing_page (labels sudah menyatu di sini dalam format JSON)
    const [rows] = await db.query('SELECT * FROM lomba_landing_page ORDER BY id ASC');
    
    const dataLomba = rows.map(l => ({
      id: l.id,
      judul: l.judul,
      deskripsi: l.deskripsi || '',
      gambar: l.gambar || '/aset/logo/placeholder.png',
      // Parse JSON labels dari database
      label: l.labels ? JSON.parse(l.labels) : []
    }));
    
    return NextResponse.json(dataLomba);
  } catch (error) {
    console.error('Error Lomba API:', error);
    return NextResponse.json({ error: 'Gagal mengambil data lomba' }, { status: 500 });
  }
}
