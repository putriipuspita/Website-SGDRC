import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fontName = searchParams.get('font');

  if (!fontName) {
    return NextResponse.json({ error: 'Parameter font diperlukan' }, { status: 400 });
  }

  try {
    const bold = searchParams.get('bold') === 'true';
    const italic = searchParams.get('italic') === 'true';

    let googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontName}`;

    if (italic && bold) {
      googleFontsUrl += `:ital,wght@1,700`;
    } else if (italic) {
      googleFontsUrl += `:ital,wght@1,400`;
    } else if (bold) {
      googleFontsUrl += `:wght@700`;
    }

    googleFontsUrl += `&display=swap`;
    
    // Set User-Agent ke browser agar mendapatkan format font yang stabil (.ttf / .woff2)
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    };

    let response = await fetch(googleFontsUrl, { headers });
    if (!response.ok) {
      // Cadangan: Jika respons gagal (karena kombinasi gaya tidak didukung), ambil versi regular dasar
      const urlCadangan = `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`;
      response = await fetch(urlCadangan, { headers });
      if (!response.ok) {
        throw new Error(`Google Fonts API merespons dengan status ${response.status}`);
      }
    }

    const cssText = await response.text();
    
    // Cari blok /* latin */ terlebih dahulu agar mendapatkan subset latin (bukan cyrillic/vietnamese)
    const latinIndex = cssText.indexOf('/* latin */');
    let targetCss = cssText;
    if (latinIndex !== -1) {
      targetCss = cssText.substring(latinIndex);
    }

    // Temukan URL file font (.ttf atau .woff2)
    const match = targetCss.match(/src:\s*url\(([^)]+)\)/);
    if (match) {
      const fontUrl = match[1].replace(/['"]/g, '');
      return NextResponse.json({ url: fontUrl });
    }

    return NextResponse.json({ error: 'URL font tidak ditemukan dalam CSS' }, { status: 404 });
  } catch (error) {
    console.error('Error loading font proxy:', error);
    return NextResponse.json({ error: 'Gagal memuat font' }, { status: 500 });
  }
}
