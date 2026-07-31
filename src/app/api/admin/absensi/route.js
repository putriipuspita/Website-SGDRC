import { hubungkanDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifikasiAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Fungsi memastikan kolom status_kehadiran & waktu_kehadiran ada di tabel
async function pastikanKolomKehadiranAda(db) {
  try {
    await db.query(`
      ALTER TABLE pendaftaran 
      ADD COLUMN status_kehadiran enum('belum_hadir','hadir') DEFAULT 'belum_hadir',
      ADD COLUMN waktu_kehadiran datetime DEFAULT NULL
    `);
  } catch (err) {
    // Abaikan jika kolom sudah ada
  }
}

// Mendapatkan data pendaftaran terverifikasi beserta statistik absensi
export async function GET(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    // Pastikan skema kolom kehadiran tersedia di database
    await pastikanKolomKehadiranAda(db);

    // Ambil daftar seluruh lomba untuk tab filter
    const [semuaLombaRows] = await db.query('SELECT id, nama, tim FROM lomba_dashboard ORDER BY id ASC');

    // Ambil data pendaftaran yang berstatus success
    const [barisData] = await db.query(`
      SELECT 
        p.id,
        p.lomba_id,
        l.nama AS nama_lomba,
        l.tim AS kuota_tim,
        p.nama_tim,
        p.nama_peserta1,
        p.nama_peserta2,
        p.nama_peserta3,
        p.asal_instansi,
        p.status_kehadiran,
        p.waktu_kehadiran
      FROM pendaftaran p
      LEFT JOIN lomba_dashboard l ON p.lomba_id = l.id
      WHERE p.status_pendaftaran = 'success'
      ORDER BY p.id DESC
    `);

    const tahunSekarang = new Date().getFullYear();

    // Format data absensi
    const daftarAbsensi = barisData.map(p => {
      const timStr = (p.kuota_tim || '').toLowerCase();
      const apakahIndividu = timStr.includes('1') && !timStr.includes('2') && !timStr.includes('3') && !timStr.includes('-');

      return {
        id: p.id,
        idPendaftaran: `REG-SGDRC-${tahunSekarang}-${String(p.id).padStart(4, '0')}`,
        lombaId: p.lomba_id,
        namaLomba: p.nama_lomba || 'Lainnya',
        apakahIndividu,
        namaTim: p.nama_tim || '',
        peserta1: p.nama_peserta1 || '',
        peserta2: p.nama_peserta2 || '',
        peserta3: p.nama_peserta3 || '',
        asalInstansi: p.asal_instansi || '',
        statusKehadiran: p.status_kehadiran || 'belum_hadir',
        waktuKehadiran: p.waktu_kehadiran
      };
    });

    const daftarLomba = semuaLombaRows.map(l => ({ id: l.id, nama: l.nama, tim: l.tim }));

    return NextResponse.json({
      absensi: daftarAbsensi,
      daftarLomba: daftarLomba
    });
  } catch (err) {
    console.error('Error GET Absensi:', err);
    return NextResponse.json({ error: 'Gagal mengambil data absensi: ' + err.message }, { status: 500 });
  }
}

// Memproses absensi (scan QR Code atau klik manual)
export async function POST(req) {
  try {
    const { db, error } = await verifikasiAdmin(req);
    if (error) return error;

    await pastikanKolomKehadiranAda(db);

    const body = await req.json();
    const { idPendaftaran, id, aksi, statusKehadiran } = body;

    let targetId = id;

    // Jika dipanggil via scan QR Code yang berisi string nomor registrasi (misal: 'REG-SGDRC-2026-0015')
    if (idPendaftaran && !targetId) {
      // Ambil bagian angka paling belakang setelah dash (misal: '0015' -> 15)
      const bagian = idPendaftaran.split('-');
      const bagianTerakhir = bagian[bagian.length - 1];
      const angkaParsed = parseInt(bagianTerakhir, 10);
      
      if (!isNaN(angkaParsed) && angkaParsed > 0) {
        targetId = angkaParsed;
      } else {
        const hanyaAngka = parseInt(idPendaftaran.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(hanyaAngka)) targetId = hanyaAngka;
      }
    }

    if (!targetId) {
      return NextResponse.json({ error: 'ID Pendaftaran tidak valid' }, { status: 400 });
    }

    const [targetPendaftaran] = await db.query(
      `SELECT p.id, p.nama_tim, p.nama_peserta1, p.status_kehadiran, l.nama AS nama_lomba 
       FROM pendaftaran p 
       LEFT JOIN lomba_dashboard l ON p.lomba_id = l.id 
       WHERE p.id = ? AND (LOWER(p.status_pendaftaran) IN ('success', 'terverifikasi', 'approved', 'berhasil', 'sudah bayar') OR p.status_pendaftaran IS NULL)`,
      [targetId]
    );

    if (targetPendaftaran.length === 0) {
      return NextResponse.json({ error: 'Data pendaftaran terverifikasi tidak ditemukan' }, { status: 404 });
    }

    const dataTarget = targetPendaftaran[0];

    // Tentukan status kehadiran baru
    let statusBaru = 'hadir';
    let waktuBaru = new Date();

    if (aksi === 'toggle' || statusKehadiran) {
      statusBaru = statusKehadiran || (dataTarget.status_kehadiran === 'hadir' ? 'belum_hadir' : 'hadir');
      waktuBaru = statusBaru === 'hadir' ? new Date() : null;
    }

    // Update database kehadiran
    await db.query(
      'UPDATE pendaftaran SET status_kehadiran = ?, waktu_kehadiran = ? WHERE id = ?',
      [statusBaru, waktuBaru, dataTarget.id]
    );

    return NextResponse.json({
      sukses: true,
      pesan: statusBaru === 'hadir' ? 'Berhasil menandai kehadiran' : 'Berhasil membatalkan kehadiran',
      data: {
        id: dataTarget.id,
        idPendaftaran: `SGDRC-${String(dataTarget.id).padStart(4, '0')}`,
        namaTim: dataTarget.nama_tim || dataTarget.nama_peserta1,
        namaLomba: dataTarget.nama_lomba,
        statusKehadiran: statusBaru,
        waktuKehadiran: waktuBaru
      }
    });

  } catch (err) {
    console.error('Error POST Absensi:', err);
    return NextResponse.json({ error: 'Gagal memproses absensi: ' + err.message }, { status: 500 });
  }
}
