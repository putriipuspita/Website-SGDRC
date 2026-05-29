// Galeri Dokumentasi
export default function GaleriDokumentasi() {
  // Simpan foto
  const galeriAsli = [
    "/aset/dokumentasi/IMG_0077.JPG",
    "/aset/dokumentasi/IMG_0090.JPG",
    "/aset/dokumentasi/IMG_5693.JPG",
    "/aset/dokumentasi/IMG_5713.JPG",
    "/aset/dokumentasi/IMG_5714.JPG",
    "/aset/dokumentasi/IMG_5890.JPG",
    "/aset/dokumentasi/LNS00702.JPG",
    "/aset/dokumentasi/LNS00712.JPG",
    "/aset/dokumentasi/LNS00866.JPG"
  ];
  const galeriGanda = [...galeriAsli, ...galeriAsli];

  return (
    // Bagian Galeri Dokumentasi
    <section id="dokumentasi" className="w-full bg-transparent py-6 md:py-10 px-4 md:px-16 relative overflow-hidden flex flex-col items-center">
      {/* Container Galeri Dokumentasi */}
      <div className="w-full max-w-[1400px] mx-auto">

        {/* Judul*/}
        <h2 className="text-center text-[26px] md:text-4xl font-bold tracking-wide text-slate-800 mb-5 md:mb-8 w-full z-10 relative">
          DOKUMENTASI
        </h2>

        {/* Container Foto Dokumentasi */}
        <div className="w-full flex overflow-hidden py-4">
          {/* Roda Slide Otomatis Bebas Geser (Marquee) */}
          <div className="flex gap-4 md:gap-8 animate-marquee min-w-max hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
            {galeriGanda.map((foto, indeks) => (

              // Kartu Dokumentasi
              <div
                key={indeks}
                className="w-[85vw] md:w-[380px] lg:w-[400px] h-[200px] md:h-[230px] lg:h-[220px] bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all overflow-hidden relative group"
              >

                {/* Foto Dokumentasi */}
                <img
                  src={foto}
                  alt={`Dokumentasi SGDRC ${indeks}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
