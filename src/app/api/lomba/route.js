import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';

// Fungsi mengambil data lomba dari halaman landing page
export async function GET() {
  try {
    const db = await hubungkanDB();
    const [rows] = await db.query('SELECT * FROM lomba_landing_page ORDER BY id ASC');

    // Format data lomba menjadi JSON
    const dataLomba = rows.map(l => ({
      id: l.id,
      judul: l.judul,
      deskripsi: l.deskripsi || '',
      gambar: l.gambar || '/aset/logo/placeholder.png',
      label: l.labels ? JSON.parse(l.labels) : []
    }));

    return NextResponse.json(dataLomba);
  } catch (error) {
    console.error('Error Lomba API:', error);
    return NextResponse.json({ error: 'Gagal mengambil data lomba' }, { status: 500 });
  }
}
