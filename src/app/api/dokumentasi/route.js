import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const folderDokumentasi = path.join(process.cwd(), 'public', 'aset', 'dokumentasi');
    
    // Membaca semua file di dalam folder tersebut
    const daftarFile = await fs.readdir(folderDokumentasi);
    
    // Filter hanya file gambar (jpg, jpeg, png, gif, svg, webp)
    const ekstensiGambar = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const daftarGambar = daftarFile
      .filter(namaFile => {
        const ekstensi = path.extname(namaFile).toLowerCase();
        return ekstensiGambar.includes(ekstensi);
      })
      // Map ke path relatif untuk digunakan di tag <img src="..." />
      .map(namaFile => `/aset/dokumentasi/${namaFile}`);

    return NextResponse.json(daftarGambar);
  } catch (error) {
    console.error("Gagal membaca folder dokumentasi:", error);
    // Fallback data kosong jika folder tidak ditemukan atau error
    return NextResponse.json([], { status: 500 });
  }
}
