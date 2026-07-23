import { verifikasiAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { sinkronisasiSemuaPendaftaran } from '@/lib/sheetHelper';

// Handler untuk sinkronisasi manual data pendaftaran ke Google Sheets
export async function POST(request) {
  try {
    // Verifikasi admin terlebih dahulu
    const { error } = await verifikasiAdmin(request);
    if (error) return error;

    // Lakukan sinkronisasi seluruh data ke Google Sheets
    sinkronisasiSemuaPendaftaran()
      .then(() => console.log("Background sheet sync completed successfully."))
      .catch(err => console.error("Background sheet sync failed:", err));

    // Menampilkan Spreadsheet dari Google Sheets
    const urlTampilanSpreedsheet = (process.env.GOOGLE_SHEET_VIEW_URL || '').trim();
    return NextResponse.json({
      pesan: 'Sinkronisasi berhasil dimulai!',
      sukses: true,
      urlSpreadsheet: urlTampilanSpreedsheet
    });

    // Jika ada error
  } catch (kesalahan) {
    console.error("Gagal memproses sinkronisasi sheet:", kesalahan);
    return NextResponse.json({
      pesan: 'Terjadi kesalahan sistem saat sinkronisasi',
      sukses: false
    }, { status: 500 });
  }
}
