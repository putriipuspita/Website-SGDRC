'use client';
import { useState, useEffect, useRef } from 'react';

// Galeri Dokumentasi
export default function GaleriDokumentasi() {
  // State untuk menyimpan daftar foto secara dinamis
  const [daftarFoto, setDaftarFoto] = useState([]);

  // Ref untuk kontrol animasi
  const refKontainer = useRef(null);
  const refPosisiScroll = useRef(0);
  const refFrameAnimasi = useRef(null);
  const refApakahJeda = useRef(false);
  const refLebarSetengah = useRef(0);
  const refWaktuTerakhir = useRef(0);

  // Kecepatan scroll
  const KECEPATAN = 120;

  // Mengambil daftar foto dari API otomatis saat halaman dimuat
  useEffect(() => {
    fetch('/api/dokumentasi?t=' + Date.now(), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDaftarFoto(data);
        }
      })
      .catch(err => console.error("Gagal memuat galeri otomatis:", err));
  }, []);

  // Fallback default jika API belum memberikan data
  const galeriAsli = daftarFoto.length > 0 ? daftarFoto : [
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

  // Hitung lebar separuh galeri saat komponen dimuat atau ukuran berubah
  useEffect(() => {
    const kontainer = refKontainer.current;
    if (!kontainer) return;

    const hitungLebar = () => {
      refLebarSetengah.current = kontainer.scrollWidth / 2;
    };

    hitungLebar();

    const observer = new ResizeObserver(hitungLebar);
    observer.observe(kontainer);
    return () => observer.disconnect();
  }, [daftarFoto]);

  // Animasi utama 
  useEffect(() => {
    const animasikan = (stempelWaktu) => {
      const kontainer = refKontainer.current;
      if (!kontainer) {
        refFrameAnimasi.current = requestAnimationFrame(animasikan);
        return;
      }

      // Inisialisasi waktu pertama kali
      if (refWaktuTerakhir.current === 0) {
        refWaktuTerakhir.current = stempelWaktu;
        refFrameAnimasi.current = requestAnimationFrame(animasikan);
        return;
      }

      // Hitung delta time
      const selisihWaktu = Math.min((stempelWaktu - refWaktuTerakhir.current) / 1000, 0.1);
      refWaktuTerakhir.current = stempelWaktu;

      if (!refApakahJeda.current) {
        // Gerakkan berdasarkan waktu
        refPosisiScroll.current += KECEPATAN * selisihWaktu;

        // Reset posisi
        if (refLebarSetengah.current > 0 && refPosisiScroll.current >= refLebarSetengah.current) {
          refPosisiScroll.current -= refLebarSetengah.current;
        }

        // Bulatkan ke pixel
        const posisi = Math.round(refPosisiScroll.current);
        kontainer.style.transform = 'translate3d(-' + posisi + 'px, 0, 0)';
      }

      refFrameAnimasi.current = requestAnimationFrame(animasikan);
    };

    refWaktuTerakhir.current = 0;
    refPosisiScroll.current = 0;
    refFrameAnimasi.current = requestAnimationFrame(animasikan);

    return () => {
      if (refFrameAnimasi.current) {
        cancelAnimationFrame(refFrameAnimasi.current);
      }
    };
  }, [daftarFoto]);

  // Tangani pause saat hover
  const tanganiKursorMasuk = () => { refApakahJeda.current = true; };
  const tanganiKursorKeluar = () => {
    refApakahJeda.current = false;
    refWaktuTerakhir.current = 0;
  };

  return (
    // Bagian Galeri Dokumentasi
    <section id="dokumentasi" className="w-full bg-transparent py-6 md:py-10 px-4 md:px-16 relative overflow-hidden flex flex-col items-center">
      {/* Container Galeri Dokumentasi */}
      <div className="w-full max-w-[1400px] mx-auto">

        {/* Judul*/}
        <h2 className="text-center text-[28px] md:text-4xl font-bold tracking-tight text-slate-800 mb-5 md:mb-8 w-full z-10 relative">
          DOKUMENTASI
        </h2>

        {/* Container Foto Dokumentasi */}
        <div className="w-full overflow-hidden py-4">
          {/* Roda Slide Otomatis */}
          <div
            ref={refKontainer}
            className="flex gap-4 md:gap-8 min-w-max cursor-grab active:cursor-grabbing"
            style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}
            onMouseEnter={tanganiKursorMasuk}
            onMouseLeave={tanganiKursorKeluar}
          >
            {galeriGanda.map((foto, indeks) => (

              // Kartu Dokumentasi
              <div
                key={indeks}
                className="w-[85vw] md:w-[380px] lg:w-[400px] h-[200px] md:h-[230px] lg:h-[220px] bg-slate-950 rounded-2xl border border-slate-200 shadow-md overflow-hidden relative flex-shrink-0"
                style={{ contain: 'layout style paint' }}
              >

                {/* Foto Dokumentasi */}
                <img
                  src={foto}
                  alt={`Dokumentasi SGDRC ${indeks}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  draggable="false"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
