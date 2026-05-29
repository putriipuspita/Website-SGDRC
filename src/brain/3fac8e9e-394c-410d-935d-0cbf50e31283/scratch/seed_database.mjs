import mysql from 'mysql2/promise';

async function seed() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_sgdrc'
  });

  console.log("Menyambungkan ke database...");

  const keysPenting = {
    deskripsi_hero: '“Beyond Competition : With Small Action, Make Your Creation Become A Champion”',
    tanggal_event: '2026-08-15 08:00:00',
    bank_nama: 'Bank BSI (Bank Syariah Indonesia)',
    bank_rekening: '1234567890',
    bank_atas_nama: 'SGD RC 2026',
    wa_link_umum: 'https://wa.me/628123456789'
  };

  for (const [key, nilai] of Object.entries(keysPenting)) {
    const [rows] = await db.query('SELECT id FROM pengaturan WHERE nama_key = ?', [key]);
    if (rows.length > 0) {
      console.log(`Mengupdate ${key}...`);
      await db.query('UPDATE pengaturan SET nilai = ? WHERE nama_key = ?', [nilai, key]);
    } else {
      console.log(`Memasukkan ${key}...`);
      await db.query('INSERT INTO pengaturan (nama_key, nilai) VALUES (?, ?)', [key, nilai]);
    }
  }

  console.log("Berhasil menyelaraskan data database!");
  await db.end();
}

seed().catch(err => console.error("Gagal seed database:", err));
