import { NextResponse } from 'next/server';

// Fungsi Font Proxy
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const font = searchParams.get('font');

  // Validasi parameter font wajib ada
  if (!font) {
    return NextResponse.json({ error: 'Parameter font diperlukan' }, { status: 400 });
  }

  // Ambil CSS Google Fonts berdasarkan nama font
  try {
    const response = await fetch(`https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}&display=swap`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // Extract URL font dari CSS
    const cssText = await response.text();
    const match = cssText.match(/url\(['"]?([^'")]+)['"]?\)/);
    const url = match ? match[1] : null;

    // Jika tidak ditemukan URL font
    if (!url) {
      return NextResponse.json({ error: 'Gagal menemukan URL font' }, { status: 404 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses request' }, { status: 500 });
  }
}
