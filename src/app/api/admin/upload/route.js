import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { verifikasiAdmin } from '@/lib/auth';

// Fungsi Upload File
export async function POST(request) {
  try {
    const { error } = await verifikasiAdmin(request);
    if (error) return error;

    // Ambil Data Form
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'umum';

    // Validasi File Upload
    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    // Konversi File ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tentukan direktori penyimpanan
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    // Buat folder jika belum ada
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Nama file unik
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Simpan file
    await fs.writeFile(filePath, buffer);

    // Respon Berhasil
    return NextResponse.json({
      success: true,
      path: `/uploads/${folder}/${fileName}`
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 });
  }
}
