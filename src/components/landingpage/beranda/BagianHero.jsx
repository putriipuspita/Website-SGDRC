'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Section Hero
export default function BagianHero({ dataAwal = {} }) {

  // Fungsi hitung sisa waktu awal untuk mencegah kedipan 00:00:00
  const hitungSisaWaktu = (target) => {
    if (!target) return { hari: 0, jam: 0, menit: 0, detik: 0 };
    const sekarang = new Date().getTime();
    const selisih = target - sekarang;
    if (selisih <= 0) return { hari: 0, jam: 0, menit: 0, detik: 0 };
    return {
      hari: Math.floor(selisih / (1000 * 60 * 60 * 24)),
      jam: Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      menit: Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60)),
      detik: Math.floor((selisih % (1000 * 60)) / 1000)
    };
  };

  // Logika Waktu Hidup (State Waktu)
  const [tanggalTarget, setTanggalTarget] = useState(() => {
    const tgl = dataAwal.tanggal_countdown || dataAwal.tanggal_event;
    return tgl ? new Date(tgl).getTime() : null;
  });
  const [waktu, setWaktu] = useState(() => hitungSisaWaktu(tanggalTarget));
  const [pengaturan, setPengaturan] = useState(dataAwal);

  // Ambil Tanggal dari Database jika belum ada dataAwal
  useEffect(() => {
    if (!dataAwal.tanggal_countdown) {
      fetch('/api/pengaturan', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          setPengaturan(data);
          const tgl = data.tanggal_countdown || data.tanggal_event;
          if (tgl) {
            const target = new Date(tgl).getTime();
            setTanggalTarget(target);
            setWaktu(hitungSisaWaktu(target));
          }
        })
        .catch(err => console.error("Gagal ambil pengaturan:", err));
    }
  }, [dataAwal]);

  // Fungsi Detak Jam
  useEffect(() => {
    if (!tanggalTarget) return;

    // Detak Jam
    const interval = setInterval(() => {
      const sekarang = new Date().getTime();
      const selisih = tanggalTarget - sekarang;

      // Logika Detik
      if (selisih > 0) {
        setWaktu({
          hari: Math.floor(selisih / (1000 * 60 * 60 * 24)),
          jam: Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          menit: Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60)),
          detik: Math.floor((selisih % (1000 * 60)) / 1000)
        });
      } else {
        // Jika Waktu Habis
        setWaktu({ hari: 0, jam: 0, menit: 0, detik: 0 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tanggalTarget]);

  // Bagian Hero
  return (
    <div className="relative w-full bg-[#103070] bg-[radial-gradient(circle_at_center,rgba(22,185,255,0.1),transparent_70%)]">

      {/* Efek Latar Belakang */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden"></div>

      {/* Bagian Robot */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
        {/* Container Robot */}
        <div className="relative w-full max-w-[1380px] h-full">
          {/* Robot Merah (Kiri) */}
          <div className="absolute left-[-54px] sm:left-[-50px] md:left-[-70px] lg:left-[-60px] top-[102px] sm:top-[65px] md:top-[70px] w-[135px] sm:w-[220px] md:w-[220px] lg:w-[350px] opacity-40 sm:opacity-95" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
            <img src="/aset/logo/robot-merah.webp" alt="Robot Guard" className="w-full h-auto brightness-[0.85] contrast-[1.1]" />
          </div>

          {/* Robot Biru (Kanan) */}
          <div className="absolute right-[-54px] sm:right-[-50px] md:right-[-70px] lg:left-auto lg:right-[-60px] top-[102px] sm:top-[65px] md:top-[70px] w-[135px] sm:w-[220px] md:w-[220px] lg:w-[350px] opacity-40 sm:opacity-95" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
            <img src="/aset/logo/robot-biru.webp" alt="Robot Guard" className="w-full h-auto brightness-[0.85] contrast-[1.1]" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="beranda" className="relative w-full max-w-[1400px] mx-auto flex flex-col items-center justify-center pt-[66px] md:pt-24 pb-[65px] md:pb-16 lg:pb-28 z-10 px-1 sm:px-4 md:px-16">

        {/* Bagian Isi Hero */}
        <div className="w-full max-w-[1400px] mx-auto flex flex-col items-center relative">
          {/* Container Isi Hero */}
          <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl px-1 sm:px-4 translate-y-0">

            {/* Judul dan Sub Judul */}
            <h2 className="text-[28px] sm:text-[34px] md:text-[42px] lg:text-[48px] lg:landscape:text-[58px] xl:text-[58px] font-bold tracking-tighter sm:tracking-tight text-white mb-1 leading-tight uppercase">
              SUNAN GUNUNG DJATI
            </h2>
            <h3 className="text-[19.5px] sm:text-[25px] md:text-[30px] lg:text-[35px] lg:landscape:text-[42px] xl:text-[42px] font-semibold tracking-tighter sm:tracking-tight text-white mb-0 leading-tight uppercase">
              ROBOTICS COMPETITION
            </h3>

            {/* Singkatan Judul */}
            <div className="font-logo text-[3.6rem] sm:text-[4.5rem] md:text-[5.8rem] lg:text-[7.0rem] italic tracking-tight mb-1 drop-shadow-lg text-center -mt-1 md:-mt-4">
              {/* Jika Judul Hero Tersedia Dari Database/Pengaturan Admin */}
              {pengaturan.judul_hero ? (
                <>
                  {/* 3 karakter pertama diberi warna merah */}
                  <span className="text-[#E40011]">
                    {pengaturan.judul_hero.substring(0, 3)}
                  </span>

                  {/* Sisa karakter berikutnya berwarna biru */}
                  <span className="text-[#0B255D]" style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.9)' }}>
                    {pengaturan.judul_hero.substring(3)}
                  </span>
                </>
              ) : (

                // Jika Tidak Ada Data Di Database (Tampilan Default)
                <>
                  <span className="text-[#E40011]">SGD</span>
                  <span className="text-[#0B255D]" style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.9)' }}>RC</span>
                  {' '}
                  <span className="text-[#0B255D]" style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.9)' }}>{new Date().getFullYear()}</span>
                </>
              )}
            </div>

            {/* Deskripsi Tema */}
            <p className="hidden md:block max-w-md lg:max-w-[420px] lg:landscape:max-w-2xl text-[10px] md:text-sm lg:text-base text-white/80 font-medium mb-6 md:mb-8 lg:mb-12 leading-relaxed px-4">
              {pengaturan.deskripsi_hero || '“Beyond Competition : With Small Action, Make Your Creation Become A Champion”'}
            </p>

            {/* Container Tombol Daftar Dan Login */}
            <div className="flex flex-row gap-3 md:gap-6 justify-center md:hidden lg:flex mt-1 mb-1">
              {/* Tombol Daftar */}
              <Link
                href="/register"
                className="bg-[#E40011] hover:bg-[#c4000e] text-white font-bold py-1.5 md:py-2 px-5 md:px-6 text-[10px] md:text-[13px] rounded-lg md:rounded-lg shadow-[0_0_15px_rgba(228,0,17,0.5)] transition-all duration-300 transform hover:-translate-y-1 text-center uppercase tracking-wide"
              >
                DAFTAR
              </Link>

              {/* Tombol Login */}
              <Link
                href="/login"
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-bold py-1.5 md:py-2 px-6 md:px-7 text-[10px] md:text-[13px] rounded-lg md:rounded-lg transition-all duration-300 transform hover:-translate-y-1 text-center uppercase tracking-wide"
              >
                LOGIN
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CountDown Section */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-50 w-full flex justify-center px-4">
        {/* Container CountDown */}
        <div className="bg-[#0B255D] border border-white/20 rounded-2xl py-3 md:py-5 px-3 md:px-10 flex items-center justify-center gap-1.5 md:gap-10 max-w-[800px] w-full shadow-sm">

          {/* Hari */}
          <div className="flex flex-col items-center flex-1 relative z-10">
            <span suppressHydrationWarning={true} className="text-[1.55rem] md:text-[2.8rem] font-black text-white leading-none">{waktu.hari}</span>
            <span className="text-[8.5px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] text-[#16B9FF] mt-1 md:mt-2 drop-shadow-[0_0_5px_rgba(22,185,255,0.3)]">HARI</span>
          </div>

          {/* Garis Pembatas */}
          <div className="w-[1.5px] h-8 md:h-14 bg-[#16B9FF]/40 rounded-full"></div>

          {/* Jam */}
          <div className="flex flex-col items-center flex-1 relative z-10">
            <span suppressHydrationWarning={true} className="text-[1.55rem] md:text-[2.8rem] font-black text-white leading-none">{waktu.jam.toString().padStart(2, '0')}</span>
            <span className="text-[8.5px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] text-[#16B9FF] mt-1 md:mt-2 drop-shadow-[0_0_5px_rgba(22,185,255,0.3)]">JAM</span>
          </div>

          {/* Garis Pembatas */}
          <div className="w-[1.5px] h-8 md:h-14 bg-[#16B9FF]/40 rounded-full"></div>

          {/* Menit */}
          <div className="flex flex-col items-center flex-1 relative z-10">
            <span suppressHydrationWarning={true} className="text-[1.55rem] md:text-[2.8rem] font-black text-white leading-none">{waktu.menit.toString().padStart(2, '0')}</span>
            <span className="text-[8.5px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] text-[#16B9FF] mt-1 md:mt-2 drop-shadow-[0_0_5px_rgba(22,185,255,0.3)]">MENIT</span>
          </div>

          {/* Garis Pembatas */}
          <div className="w-[1.5px] h-8 md:h-14 bg-[#16B9FF]/40 rounded-full"></div>

          {/* Detik */}
          <div className="flex flex-col items-center flex-1 relative z-10">
            <span suppressHydrationWarning={true} className="text-[1.55rem] md:text-[2.8rem] font-black text-[#E40011] leading-none drop-shadow-[0_4px_12px_rgba(228,0,17,0.3)]">{waktu.detik.toString().padStart(2, '0')}</span>
            <span className="text-[8.5px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] text-[#E40011] mt-1 md:mt-2">DETIK</span>
          </div>

        </div>
      </div>
    </div>
  );
}
