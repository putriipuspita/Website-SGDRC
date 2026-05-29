import pkg from '../../../lib/db.js';
const { hubungkanDB } = pkg;

async function cekSemuaTabel() {
  try {
    const db = await hubungkanDB();
    const [tables] = await db.query("SHOW TABLES");
    console.log("DAFTAR TABEL:", JSON.stringify(tables, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

cekSemuaTabel();
