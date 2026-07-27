import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await hubungkanDB();
    const [baris] = await db.query("SELECT nilai FROM pengaturan WHERE nama_key = 'foto_dokumentasi_list'");
    
    if (baris.length > 0 && baris[0].nilai) {
      try {
        const listParsed = JSON.parse(baris[0].nilai);
        if (Array.isArray(listParsed) && listParsed.length > 0) {
          return NextResponse.json(listParsed);
        }
      } catch (e) {
        console.error("Gagal parse foto_dokumentasi_list dari database:", e);
      }
    }
    
    // Fallback default jika database kosong
    const fallback = [
      "/aset/dokumentasi/IMG_0077.JPG",
      "/aset/dokumentasi/IMG_0090.JPG",
      "/aset/dokumentasi/IMG_5693.JPG",
      "/aset/dokumentasi/IMG_5713.JPG",
      "/aset/dokumentasi/IMG_5714.JPG",
      "/aset/dokumentasi/IMG_5890.JPG",
      "/aset/dokumentasi/LNS00702.JPG",
      "/aset/dokumentasi/LNS00712.JPG",
      "/aset/dokumentasi/LNS00866.JPG"
    ];
    return NextResponse.json(fallback);
  } catch (error) {
    console.error("Gagal mengambil dokumentasi:", error);
    return NextResponse.json([], { status: 500 });
  }
}
