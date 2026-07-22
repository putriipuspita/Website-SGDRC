import { verifikasiUser } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { kirimKeSpreadsheet } from '@/lib/sheetHelper';

// Fungsi proses pendaftaran
export async function POST(req) {
  try {
    const { decoded, db, error } = await verifikasiUser(req);
    if (error) return error;

    const userId = decoded.id;

    // Verifikasi user masih ada di database
    const [userExist] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userExist.length === 0) {
      return new Response(JSON.stringify({ pesan: "Akun tidak ditemukan" }), { status: 401 });
    }

    const formData = await req.formData();

    // Ambil data
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

    // File upload handling
    const fileKeys = ['kartuSiswa', 'ikutiInstagram', 'ikutiInstagramRobotika', 'ikutiTiktok', 'buktiBayar'];
    const paths = {};
    const UKURAN_MAKSIMAL = 2 * 1024 * 1024; // 2MB

    // Simpan file ke database (dioptimalkan untuk hemat ruang penyimpanan)
    for (const key of fileKeys) {
      const file = formData.get(key);
      if (file && typeof file !== 'string') {
        // Validasi ukuran file di sisi server tetap aktif
        if (file.size > UKURAN_MAKSIMAL) {
          return new Response(
            JSON.stringify({ pesan: `Ukuran file berkas (${key}) terlalu besar. Maksimal 2MB.` }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        // Hanya buktiBayar yang disimpan fisik ke server
        if (key === 'buktiBayar') {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `${Date.now()}-${key}-${file.name.replace(/\s+/g, '_')}`;
          const relativePath = `/uploads/pendaftaran/${fileName}`;
          const fullPath = join(process.cwd(), 'public', relativePath);
          await writeFile(fullPath, buffer);
          paths[key] = relativePath;
        } else if (key === 'kartuSiswa') {
          // Kartu Siswa cukup simpan teks penanda (tidak disimpan fisik di server)
          paths[key] = '/uploads/pendaftaran/kartu-siswa-terunggah.png';
        } else {
          // Bukti follow IG dan Tiktok cukup simpan teks penanda (menghemat penyimpanan server)
          paths[key] = '/uploads/pendaftaran/bukti-follow-terunggah.png';
        }
      }
    }

    // Simpan data pendaftaran ke database
    const [hasilDb] = await db.query(
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

    const idBaru = hasilDb.insertId;

    // Ambil nama lomba untuk dikirim ke Google Sheets
    const [lombaRow] = await db.query('SELECT nama FROM lomba_dashboard WHERE id = ?', [data.lomba_id]);
    const namaLomba = lombaRow.length > 0 ? lombaRow[0].nama : 'Lainnya';

    // Kirim data ke Google Sheets secara real-time
    const dataSpreadsheet = {
      id: idBaru,
      lomba_id: data.lomba_id,
      lomba: namaLomba,
      tim: data.nama_tim,
      peserta1: data.nama_peserta1,
      peserta2: data.nama_peserta2,
      peserta3: data.nama_peserta3,
      whatsapp: data.whatsapp,
      jenjang: data.jenjang,
      instansi: data.asal_instansi,
      status: 'Belum Terverifikasi'
    };

    // Kirim secara async di background
    kirimKeSpreadsheet(dataSpreadsheet).catch(err => console.error("Gagal sinkronisasi otomatis ke Google Sheets:", err));

    // Respons sukses
    return new Response(JSON.stringify({ pesan: "Pendaftaran berhasil!" }), { status: 201 });

  } catch (error) {
    console.error("Error Pendaftaran:", error);
    return new Response(JSON.stringify({ pesan: "Gagal memproses pendaftaran" }), { status: 500 });
  }
}
