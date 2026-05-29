import pkg from '../../../lib/db.js';
const { hubungkanDB } = pkg;

async function ambilSponsorLama() {
  try {
    const db = await hubungkanDB();
    const [rows] = await db.query("SELECT * FROM sponsor");
    console.log("DATA SPONSOR LAMA:", JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

ambilSponsorLama();
