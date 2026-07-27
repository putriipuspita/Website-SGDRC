import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Fungsi mengambil data guidebook
export async function GET() {
  try {
    const db = await hubungkanDB();
    const [semuaGuidebook] = await db.query('SELECT * FROM guidebook');
    return NextResponse.json(semuaGuidebook);
  } catch (error) {
    console.error('Error Guidebook:', error);
    return NextResponse.json({ error: 'Gagal mengambil data guidebook' }, { status: 500 });
  }
}
