import { hubungkanDB } from './db';

// Helper untuk mengirim data ke Google Spreadsheet menggunakan Webhook
export async function kirimKeSpreadsheet(dataPendaftaran) {
  const urlWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim() || "https://script.google.com/macros/s/AKfycbyc_ajX05xnOq6hJAdCyWuDCEQ9Ciw9zR2tcqzncawGOv_NDKiGjpXhLIeMKGWUVIZ2Rw/exec";
  if (!urlWebhook) {
    console.warn("Peringatan: GOOGLE_SHEETS_WEBHOOK_URL belum dikonfigurasi di .env.local");
    return false;
  }

  try {
    const db = await hubungkanDB();
    const [lombaRow] = await db.query('SELECT nama, tim FROM lomba_dashboard WHERE id = ?', [dataPendaftaran.lombaId || dataPendaftaran.lomba_id]);

    const namaLomba = lombaRow.length > 0 ? lombaRow[0].nama : 'Lainnya';
    const kuotaTim = lombaRow.length > 0 ? lombaRow[0].tim : '';
    const timStr = (kuotaTim || '').toLowerCase();

    const apakahSolo = timStr.includes('1') && !timStr.includes('2') && !timStr.includes('3') && !timStr.includes('-');
    const apakahKelompokMaks3 = timStr.includes('3');

    const dataKirim = {
      aksi: 'tambah',
      id: dataPendaftaran.id,
      tanggal: dataPendaftaran.tanggal || new Date().toLocaleDateString('id-ID'),
      lomba: namaLomba,
      tim: dataPendaftaran.tim,
      peserta1: dataPendaftaran.peserta1,
      peserta2: dataPendaftaran.peserta2 || '-',
      peserta3: dataPendaftaran.peserta3 || '-',
      whatsapp: dataPendaftaran.whatsapp,
      jenjang: dataPendaftaran.jenjang,
      instansi: dataPendaftaran.instansi,
      status: dataPendaftaran.status || 'Belum Terverifikasi',
      apakahSolo,
      apakahKelompokMaks3
    };

    const opsi = {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataKirim)
    };

    const respon = await fetch(urlWebhook, opsi);
    if (!respon.ok) {
      throw new Error(`HTTP error! status: ${respon.status}`);
    }

    const teksRespon = await respon.text();
    let hasil = {};
    try {
      hasil = JSON.parse(teksRespon);
    } catch {
      // Jika Google Apps Script merespon HTML 200 OK
      return true;
    }
    return hasil.status === 'sukses';
  } catch (kesalahan) {
    console.error("Gagal mengirim data ke Google Sheets:", kesalahan.message || kesalahan);
    return false;
  }
}

// Fungsi untuk mensinkronisasikan seluruh data pendaftaran dari database ke Google Sheets
export async function sinkronisasiSemuaPendaftaran() {
  const urlWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim() || "https://script.google.com/macros/s/AKfycbyc_ajX05xnOq6hJAdCyWuDCEQ9Ciw9zR2tcqzncawGOv_NDKiGjpXhLIeMKGWUVIZ2Rw/exec";
  if (!urlWebhook) {
    console.warn("Peringatan: GOOGLE_SHEETS_WEBHOOK_URL belum dikonfigurasi di .env.local");
    return false;
  }

  try {
    const db = await hubungkanDB();

    // Ambil data pendaftaran beserta nama lomba dan kuota tim
    const [barisData] = await db.query(`
      SELECT p.*, l.nama AS nama_lomba, l.tim AS kuota_tim
      FROM pendaftaran p 
      LEFT JOIN lomba_dashboard l ON p.lomba_id = l.id 
      ORDER BY p.id ASC
    `);

    // Ambil daftar seluruh lomba untuk membuat sheet dan header meskipun datanya kosong
    const [semuaLomba] = await db.query('SELECT nama, tim FROM lomba_dashboard');
    const daftarLombaTerformat = semuaLomba.map(l => {
      const timStr = (l.tim || '').toLowerCase();
      const apakahSolo = timStr.includes('1') && !timStr.includes('2') && !timStr.includes('3') && !timStr.includes('-');
      const apakahKelompokMaks3 = timStr.includes('3');
      return {
        nama: l.nama,
        apakahSolo,
        apakahKelompokMaks3
      };
    });

    // Mapping data pendaftaran ke format yang akan dikirim ke Google Sheets
    const daftarTerformat = barisData.map(p => {
      const timStr = (p.kuota_tim || '').toLowerCase();
      const apakahSolo = timStr.includes('1') && !timStr.includes('2') && !timStr.includes('3') && !timStr.includes('-');
      const apakahKelompokMaks3 = timStr.includes('3');

      // Daftar Data
      return {
        id: p.id,
        tanggal: new Date(p.tanggal_pendaftaran).toLocaleDateString('id-ID'),
        lomba: p.nama_lomba || 'Lainnya',
        tim: p.nama_tim,
        peserta1: p.nama_peserta1,
        peserta2: p.nama_peserta2 || '-',
        peserta3: p.nama_peserta3 || '-',
        whatsapp: p.whatsapp,
        jenjang: p.jenjang,
        instansi: p.asal_instansi,
        status: p.status_pendaftaran === 'success' ? 'Terverifikasi' :
          (p.status_pendaftaran === 'rejected' ? 'Ditolak' :
            (p.status_pendaftaran === 'refund' ? 'Refunded' : 'Belum Terverifikasi')),
        apakahSolo,
        apakahKelompokMaks3
      };
    });

    // Data untuk dikirim ke Google Sheets
    const dataKirim = {
      aksi: 'sinkronisasi',
      daftarLomba: daftarLombaTerformat,
      daftar: daftarTerformat
    };

    // Opsi Permintaan
    const opsi = {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataKirim)
    };

    // Kirim Data
    const respon = await fetch(urlWebhook, opsi);
    if (!respon.ok) {
      throw new Error(`HTTP error! status: ${respon.status}`);
    }

    const teksRespon = await respon.text();
    let hasil = {};
    try {
      hasil = JSON.parse(teksRespon);
    } catch {
      return true;
    }
    return hasil.status === 'sukses';
  } catch (kesalahan) {
    console.error("Gagal melakukan sinkronisasi massal ke Google Sheets:", kesalahan.message || kesalahan);
    return false;
  }
}
