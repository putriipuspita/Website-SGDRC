import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await hubungkanDB();
    // Ambil data langsung dari tabel sponsor
    const [semuaSponsor] = await db.query('SELECT * FROM sponsor ORDER BY id DESC');
    const hasil = semuaSponsor.map(s => ({
      id: s.id,
      nama: s.nama || s.judul || '',
      logo: s.gambarLogo || s.gambar || s.logo || ''
    }));
    return NextResponse.json(hasil);
  } catch (error) {
    console.error('Error Sponsor:', error);
    return NextResponse.json({ error: 'Gagal mengambil data sponsor' }, { status: 500 });
  }
}
