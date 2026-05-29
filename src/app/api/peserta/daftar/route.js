import { hubungkanDB } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'sgdrc-rahasia-banget';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ pesan: "Sesi Berakhir" }), { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    const db = await hubungkanDB();

    // Verifikasi user masih ada
    const [userExist] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userExist.length === 0) {
      return new Response(JSON.stringify({ pesan: "Akun tidak ditemukan" }), { status: 401 });
    }

    const formData = await req.formData();
    
    const data = {
      user_id: userId,
      lomba_id: formData.get('lomba_id'),
      nama_tim: formData.get('namaTim'),
      nama_peserta1: formData.get('peserta1'),
      nama_peserta2: formData.get('peserta2'),
      nama_peserta3: formData.get('peserta3'),
      asal_instansi: formData.get('asalInstansi'),
      jenjang: formData.get('jenjang'),
      whatsapp: formData.get('whatsapp'),
    };

    const fileKeys = ['kartuSiswa', 'ikutiInstagram', 'ikutiInstagramRobotika', 'ikutiTiktok', 'buktiBayar'];
    const paths = {};

    for (const key of fileKeys) {
      const file = formData.get(key);
      if (file && typeof file !== 'string') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${key}-${file.name.replace(/\s+/g, '_')}`;
        const relativePath = `/uploads/pendaftaran/${fileName}`;
        const fullPath = join(process.cwd(), 'public', relativePath);
        await writeFile(fullPath, buffer);
        paths[key] = relativePath;
      }
    }

    // SIMPAN KE DATABASE (PASTIKAN TIDAK ADA DEFINISI DB LAGI)
    await db.query(
      `INSERT INTO pendaftaran (
        user_id, lomba_id, nama_tim, nama_peserta1, nama_peserta2, nama_peserta3, 
        asal_instansi, jenjang, whatsapp, 
        file_kartu_siswa, file_follow_ig, file_follow_ig_robotika, file_follow_tiktok, file_bukti_bayar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id, data.lomba_id, data.nama_tim, data.nama_peserta1, data.nama_peserta2, data.nama_peserta3,
        data.asal_instansi, data.jenjang, data.whatsapp,
        paths.kartuSiswa, paths.ikutiInstagram, paths.ikutiInstagramRobotika, paths.ikutiTiktok, paths.buktiBayar
      ]
    );

    return new Response(JSON.stringify({ pesan: "Pendaftaran berhasil!" }), { status: 201 });

  } catch (error) {
    console.error("Error Pendaftaran:", error);
    return new Response(JSON.stringify({ pesan: "Gagal memproses pendaftaran" }), { status: 500 });
  }
}
