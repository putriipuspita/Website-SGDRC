import NavigasiUtama from "@/components/landingpage/NavigasiUtama";
import BagianHero from "@/components/landingpage/beranda/BagianHero";
import BagianTentang from "@/components/landingpage/beranda/BagianTentang";
import DaftarLomba from "@/components/landingpage/beranda/DaftarLomba";
import GaleriDokumentasi from "@/components/landingpage/beranda/GaleriDokumentasi";
import BagianSponsor from "@/components/landingpage/beranda/BagianSponsor";
import KontakDanKaki from "@/components/landingpage/beranda/KontakDanKaki";
import { hubungkanDB } from "@/lib/db";

// Aktifkan Incremental Static Regeneration (ISR) - Halaman di-render statis & di-update setiap 60 detik
export const revalidate = 60;

// Fungsi Ambil Data Global (Server Side)
async function ambilDataLanding() {
  try {
    const db = await hubungkanDB();

    // Ambil Pengaturan
    const [settings] = await db.query("SELECT * FROM pengaturan");
    const pengaturan = {};
    settings.forEach((row) => (pengaturan[row.nama_key] = row.nilai));

    // Ambil Lomba
    const [lombaRows] = await db.query(
      "SELECT * FROM lomba_landing_page ORDER BY id ASC",
    );
    const dataLomba = lombaRows.map((l) => ({
      ...l,
      // Parse labels yang sekarang ada di kolom tunggal sebagai JSON
      label: l.labels ? JSON.parse(l.labels) : [],
    }));

    // Parse Sponsor dari Pengaturan
    let dataSponsor = [];
    if (pengaturan.sponsor_list) {
      try {
        const parsed = JSON.parse(pengaturan.sponsor_list);
        dataSponsor = parsed.map((sp, idx) => ({
          id: idx + 1,
          nama: sp.nama,
          gambarLogo: sp.logo,
        }));
      } catch (e) {
        console.error("Gagal parse sponsor server:", e);
      }
    } else {
      // Fallback ke tabel sponsor lama
      const [oldSponsors] = await db.query("SELECT * FROM sponsor");
      dataSponsor = oldSponsors.map((s) => ({
        id: s.id,
        nama: s.nama || s.judul || "",
        gambarLogo: s.gambarLogo || s.gambar || "",
      }));
    }

    return { pengaturan, dataLomba, dataSponsor };
  } catch (error) {
    console.error("Error Fetch Server:", error);
    return { pengaturan: {}, dataLomba: [], dataSponsor: [] };
  }
}

// Komponen Garis Pemisah
function GarisPemisah() {
  return <div className="w-full h-[1.3px] bg-slate-300 z-40 relative"></div>;
}

// Fungsi Utama Beranda
export default async function Beranda() {
  const data = await ambilDataLanding();

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden relative">
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-50"></div>

      <NavigasiUtama />

      <main>
        <BagianHero dataAwal={data.pengaturan} />
        <BagianTentang />
        <GarisPemisah />
        <DaftarLomba dataAwal={data.dataLomba} />
        <GarisPemisah />
        <GaleriDokumentasi />
        {data.dataSponsor.length > 0 && (
          <>
            <GarisPemisah />
            <BagianSponsor dataAwal={data.dataSponsor} />
          </>
        )}
        <GarisPemisah />
        <KontakDanKaki dataAwal={data.pengaturan} />
      </main>
    </div>
  );
}
