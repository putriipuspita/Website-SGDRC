import pkg from '../../../lib/db.js';
const { hubungkanDB } = pkg;

async function buatTabelBank() {
  try {
    const db = await hubungkanDB();
    
    // 1. Buat tabel rekening_pembayaran jika belum ada
    await db.query(`
      CREATE TABLE IF NOT EXISTS rekening_pembayaran (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_bank VARCHAR(100),
        nomor_rekening VARCHAR(50),
        atas_nama VARCHAR(100),
        aktif BOOLEAN DEFAULT TRUE
      )
    `);
    console.log("Tabel rekening_pembayaran berhasil dibuat/dicek.");

    // 2. Ambil data lama dari pengaturan untuk migrasi
    const [baris] = await db.query("SELECT * FROM pengaturan WHERE nama_key IN ('bank_nama', 'bank_rekening', 'bank_atas_nama')");
    
    if (baris.length > 0) {
      const dataLama = {};
      baris.forEach(item => { dataLama[item.nama_key] = item.nilai; });
      
      // 3. Masukkan ke tabel baru jika tabel baru masih kosong
      const [cekIsi] = await db.query("SELECT id FROM rekening_pembayaran LIMIT 1");
      if (cekIsi.length === 0) {
        await db.query(
          "INSERT INTO rekening_pembayaran (nama_bank, nomor_rekening, atas_nama) VALUES (?, ?, ?)",
          [dataLama.bank_nama || '', dataLama.bank_rekening || '', dataLama.bank_atas_nama || '']
        );
        console.log("Data bank berhasil dimigrasi ke tabel baru.");
      }
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

buatTabelBank();
