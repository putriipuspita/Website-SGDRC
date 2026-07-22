import HalamanGuideBook from '@/components/landingpage/HalamanGuideBook';
import { hubungkanDB } from '@/lib/db';

export const revalidate = 60;

// Fungsi ambil data langsung dari server
async function ambilDataGuidebook() {
  try {
    const db = await hubungkanDB();
    const [rows] = await db.query('SELECT * FROM guidebook');
    return JSON.parse(JSON.stringify(rows));
  } catch (error) {
    console.error("Gagal ambil data server:", error);
    return [];
  }
}

// Halaman GuideBook
export default async function Page() {
  const dataAwal = await ambilDataGuidebook();

  return <HalamanGuideBook dataAwal={dataAwal} />;
}
