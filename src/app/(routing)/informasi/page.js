import NavigasiUtama from '@/components/landingpage/NavigasiUtama';
import TampilanInformasi from '@/components/landingpage/TampilanInformasi';
import { hubungkanDB } from '@/lib/db';

// Nonaktifkan cache
export const revalidate = 0;

// Mengambil data informasi event dari database
async function ambilDataInformasi() {
  try {
    const db = await hubungkanDB();
    const [settings] = await db.query('SELECT * FROM pengaturan');
    const pengaturan = {};
    settings.forEach(row => pengaturan[row.nama_key] = row.nilai);

    // Data timeline
    let timelineList = [];
    if (pengaturan.timeline_list) {
      try {
        timelineList = JSON.parse(pengaturan.timeline_list);
      } catch (e) {
        timelineList = [];
      }
    }

    // Return data informasi
    return {
      poster: pengaturan.poster_utama || '',
      timeline: timelineList,
      judulEvent: pengaturan.judul_hero || `SGDRC ${new Date().getFullYear()}`
    };
  } catch (error) {
    console.error("Gagal ambil data informasi:", error);
    return { poster: '', timeline: [], judulEvent: `SGDRC ${new Date().getFullYear()}` };
  }
}

// Halaman informasi landing page
export default async function HalamanInformasiPublik() {
  const data = await ambilDataInformasi();

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden relative font-montserrat flex flex-col">
      {/* Navigasi */}
      <NavigasiUtama />

      {/* Konten */}
      <main className="w-full px-4 md:px-16 pt-16 md:pt-20 lg:pt-24 pb-10 md:pb-14 lg:pb-16 relative z-10 flex-grow">
        <div className="w-full max-w-[1400px] mx-auto">
          <TampilanInformasi data={data} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0B255D] py-4 md:py-5 text-center border-t border-white/5 z-10 relative">
        <p className="text-[10px] text-white/50 tracking-wide font-medium">
          © {new Date().getFullYear()} Sunan Gunung Djati Robotics Competition.
        </p>
      </footer>
    </div>
  );
}
