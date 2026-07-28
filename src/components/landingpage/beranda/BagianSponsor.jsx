"use client";
import { useState, useEffect } from "react";

// Komponen untuk menampilkan sponsor dan media partner
export default function BagianSponsor({ dataAwal = [] }) {
  // Menyimpan data sponsor yang akan ditampilkan
  const [sponsorUtama, setSponsorUtama] = useState(dataAwal);

  // Selalu fetch data sponsor terbaru dari API di client-side untuk menghindari caching Next.js di cPanel
  useEffect(() => {
    fetch("/api/sponsor?t=" + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSponsorUtama(data);
        }
      })
      .catch((err) => console.error("Gagal ambil sponsor:", err));
  }, []);

  // Jika tidak ada data sponsor, komponen tidak ditampilkan
  if (!sponsorUtama || sponsorUtama.length === 0) return null;

  return (
    // Bagian Sponsor & Media Partner
    <section
      id="sponsor"
      className="w-full bg-transparent py-6 md:py-10 px-4 md:px-16 relative flex flex-col items-center"
    >
      {/* Container Bagian Sponsor & Media Partner */}
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Judul */}
        <h2 className="text-center text-[28px] md:text-4xl font-bold tracking-tight text-slate-800 mb-6 w-full z-10 relative">
          SPONSOR & MEDIA PARTNER
        </h2>

        {/* Container Logo Sponsor*/}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 w-full mx-auto">
          {sponsorUtama.map((sponsor) => (
            <div
              key={sponsor.id}
              className="w-[140px] md:w-[160px] lg:w-[180px] h-20 md:h-20 lg:h-24 bg-white rounded-2xl border border-slate-300 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-center p-4 overflow-hidden cursor-pointer"
            >
              {/* Gambar Logo Sponsor */}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={sponsor.logo || sponsor.gambarLogo}
                  alt={sponsor.nama}
                  className="max-w-full max-h-full object-contain block mx-auto transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
