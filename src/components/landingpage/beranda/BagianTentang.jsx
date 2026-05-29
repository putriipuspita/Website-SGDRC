'use client';
import { useState, useEffect } from 'react';

// Atur Logo
export default function BagianTentang({ dataAwal = {} }) {
  const [logoPath, setLogoPath] = useState(dataAwal.path_logo_sgdrc || '/aset/logo/logo.jpg');

  useEffect(() => {
    if (!dataAwal.path_logo_sgdrc) {
      fetch('/api/pengaturan')
        .then(res => res.json())
        .then(data => {
          if (data.path_logo_sgdrc) {
            setLogoPath(data.path_logo_sgdrc);
          }
        })
        .catch(err => console.error("Gagal ambil logo:", err));
    }
  }, [dataAwal]);

  return (

    // Bagian Tentang
    <section id="tentang" className="w-full bg-transparent pt-16 md:pt-24 pb-10 px-4 md:px-16 flex flex-col items-center">

      {/* Container Tentang */}
      <div className="w-full max-w-[1400px] mx-auto">

        {/* Judul */}
        <h2 className="text-[26px] md:text-4xl font-bold tracking-wide text-slate-800 uppercase text-center w-full z-10 relative mb-6">
          TENTANG SGDRC
        </h2>

        {/* Container Deskripsi dan Logo */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-[60px] w-full">

          {/* Container Deskripsi */}
          <div className="w-full lg:w-[75%]">
            <p className="text-slate-700 leading-[2.2em] lg:leading-[2em] text-[14px] lg:text-[15.5px] text-justify indent-[30px] md:indent-[50px] lg:-mt-3">
              Sunan Gunung Djati Robotic Competition (SGD RC) merupakan ajang kompetisi robotika tingkat nasional yang menjadi wadah bagi generasi muda Indonesia untuk mengembangkan kreativitas, inovasi, serta kemampuan di bidang teknologi dan robotika.
              Kompetisi ini menghadirkan berbagai kategori lomba yang dapat diikuti oleh peserta dari berbagai jenjang pendidikan, mulai dari Taman Kanak-Kanak (TK), Sekolah Dasar (SD), Sekolah Menengah Pertama (SMP), Sekolah Menengah Atas(SMA), hingga Mahasiswa.
              <strong>Kegiatan ini telah terkurasi oleh Pusat Prestasi Nasional (Puspresnas) di bawah naungan Kemendikbudristek</strong> sehingga pelaksanaannya mengacu pada standar kompetisi nasional yang mendukung pengembangan prestasi, karakter, serta daya saing peserta di tingkat yang lebih tinggi.
            </p>
          </div>

          {/* Container Logo */}
          <div className="w-full lg:w-[25%] flex justify-center lg:justify-end flex-shrink-0 lg:-translate-y-8">
            {/* Logo */}
            <div className="relative w-48 h-48 md:w-60 md:h-60 aspect-square rounded-full border-[2.5px] border-slate-200 shadow-xl overflow-hidden flex items-center justify-center bg-white hover:shadow-2xl transition-all flex-shrink-0 hover:-translate-y-2">
              <img src={logoPath} alt="Logo Besar SGDRC" className="w-[96%] h-[96%] object-contain lg:w-full lg:h-full lg:object-cover mix-blend-multiply scale-[1] lg:-translate-y-[5px]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
