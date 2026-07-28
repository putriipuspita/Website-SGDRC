import { readdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mengambil semua gambar otomatis dari folder /public/aset/dokumentasi
export async function GET() {
  try {
    const dirPath = join(process.cwd(), 'public', 'aset', 'dokumentasi');
    const files = await readdir(dirPath);

    const ekstensiGambar = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
    const daftarGambar = files
      .filter(file => ekstensiGambar.some(ext => file.toLowerCase().endsWith(ext)))
      .sort()
      .map(file => `/aset/dokumentasi/${file}`);

    return NextResponse.json(daftarGambar);
  } catch (error) {
    console.error('Gagal membaca folder dokumentasi:', error);
    return NextResponse.json([], { status: 500 });
  }
}
