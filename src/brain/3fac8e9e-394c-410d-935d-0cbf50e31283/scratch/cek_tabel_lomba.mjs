import pkg from '../../../lib/db.js';
const { hubungkanDB } = pkg;

async function cekTabelLengkap() {
  try {
    const db = await hubungkanDB();
    
    // Cek kolom tabel lomba
    const [kolomLomba] = await db.query("SHOW COLUMNS FROM lomba");
    console.log("KOLOM TABEL LOMBA:", JSON.stringify(kolomLomba, null, 2));
    
    // Cek kolom tabel lomba_kategori
    const [kolomKat] = await db.query("SHOW COLUMNS FROM lomba_kategori");
    console.log("KOLOM TABEL LOMBA_KATEGORI:", JSON.stringify(kolomKat, null, 2));
    
    // Cek isi data lomba untuk referensi
    const [dataLomba] = await db.query("SELECT * FROM lomba LIMIT 1");
    console.log("CONTOH DATA LOMBA:", JSON.stringify(dataLomba, null, 2));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

cekTabelLengkap();
