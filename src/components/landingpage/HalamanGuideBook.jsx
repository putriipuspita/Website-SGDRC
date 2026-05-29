'use client';
import React, { useState, useEffect } from 'react';
import NavigasiUtama from './NavigasiUtama';
import KontakDanKaki from './beranda/KontakDanKaki';
import Link from 'next/link';

// Halaman Yang Menampilkan Seluruh Guide Book Perlombaan
const HalamanGuideBook = ({ dataAwal = [] }) => {
  const [daftarGuideBook, setDaftarGuideBook] = useState(dataAwal);

  useEffect(() => {
    // Jika Data Belum Tersedia (Ambil Dari API)
    if (daftarGuideBook.length === 0) {
      fetch('/api/guidebook')
        .then(res => res.json())
        .then(data => setDaftarGuideBook(data))
        .catch(err => console.error("Gagal ambil guidebook:", err));
    }
  }, [dataAwal]);

  return (
    // Container Utama Halaman Guide Book
    <div className="w-full min-h-screen bg-white overflow-x-hidden relative">

      {/* Navigasi Bar */}
      <NavigasiUtama />

      {/* Container Judul & Deskripsi */}
      <div className="pt-24 pb-10 px-4 text-center relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-wide uppercase mb-2">
          GUIDE BOOK
        </h1>
        <p className="text-slate-500 font-medium italic tracking-wide text-[12px] md:text-sm">
          Pelajari aturan dan teknis perlombaan sebelum mendaftar.
        </p>
      </div>

      {/* Container Daftar Guide Book  */}
      <div className="w-full px-4 md:px-16 pb-16 relative z-10">

        {/* Grid Kotak Guide Book */}
        <div className="w-full max-w-[1400px] mx-auto">

          {/* Kartu */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
            {daftarGuideBook.map((data) => (
              // Mengatur Warna Kotak Guide Book
              <div
                key={data.id}
                className={`group relative bg-white border-[2px] ${data.id % 2 !== 0 ? 'border-[#E40011]' : 'border-[#16B9FF]'} rounded-[18px] overflow-hidden transition-all duration-500 flex flex-col
                shadow-[0_15px_40px_-5px_rgba(0,0,0,0.1)]
                hover:shadow-[0_25px_50px_-12px_rgba(${data.id % 2 !== 0 ? '228,0,17,0.35' : '22,185,255,0.35'})] hover:-translate-y-2`}
              >

                {/* Foto Lomba */}
                <div className="h-40 md:h-44 overflow-hidden relative border-b border-slate-100">
                  <img
                    src={data.foto || '/aset/logo/placeholder.png'}
                    alt={data.judul}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 opacity-90 group-hover:opacity-100"
                  />
                </div>

                {/* Judul Lomba*/}
                <div className={`${data.id % 2 !== 0 ? 'bg-[#E40011]' : 'bg-[#16B9FF]'} py-2 px-5 flex items-center justify-center border-b border-white/10`}>
                  <h3 className="text-white font-black text-[13px] md:text-[15px] uppercase tracking-wide text-center leading-tight">
                    {data.judul}
                  </h3>
                </div>

                {/* Deksripsi */}
                <div className="pt-4 px-5 md:px-6 pb-5 flex flex-col items-start text-left bg-white flex-grow z-20">
                  <p className="text-slate-600 text-[11px] md:text-[12px] font-normal mb-5 leading-[1.7] text-justify flex-grow">
                    {data.deskripsi}
                  </p>

                  {/* Tombol Selengkapnya */}
                  <a
                    href={data.tautan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${data.id % 2 !== 0
                      ? 'bg-[#E40011] hover:bg-red-700 shadow-[0_4px_10px_rgba(228,0,17,0.2)] hover:shadow-[0_6px_15px_rgba(228,0,17,0.3)]'
                      : 'bg-[#16B9FF] hover:bg-[#0099DD] shadow-[0_4px_10px_rgba(22,185,255,0.2)] hover:shadow-[0_6px_15px_rgba(22,185,255,0.3)]'} 
                      text-white font-bold py-2.5 px-8 rounded-xl text-xs uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 mt-auto flex items-center justify-center gap-2 group/btn w-full`}
                  >
                    SELENGKAPNYA
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transform transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#0B255D] py-4 md:py-5 text-center border-t border-white/5 z-10 relative">
        <p className="text-[9px] text-white/40 tracking-wide font-medium">
          © 2026 Sunan Gunung Djati Robotic Competition. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default HalamanGuideBook;
