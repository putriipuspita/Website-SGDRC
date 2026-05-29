import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await hubungkanDB();
    const [rows] = await db.query('SELECT id, nama, jenjang, harga, tanggal, tim, gambar, status, grup_wa FROM lomba_dashboard ORDER BY id ASC');
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error Fetch Lomba Dashboard:", error);
    return new Response(JSON.stringify({ pesan: "Gagal mengambil data lomba" }), { status: 500 });
  }
}
