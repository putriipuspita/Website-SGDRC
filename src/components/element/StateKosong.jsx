'use client';
import React from 'react';
import Link from 'next/link';

const StateKosong = ({ Ikon, judul, deskripsi, tombolTeks, tombolHref, className = "flex-1 flex flex-col items-center justify-center py-10" }) => {
  return (
    <div className={`${className} animate-in fade-in zoom-in duration-700`}>
      <div className="relative mb-8 mx-auto w-fit">
        {/* Lingkaran Berputar & Pendaran Cahaya */}
        <div className="absolute -inset-4 border border-[#16B9FF]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute -inset-8 border border-[#16B9FF]/10 rounded-full"></div>
        <div className="absolute -inset-12 bg-[#16B9FF]/5 rounded-full blur-3xl"></div>

        {/* Kotak Ikon */}
        <div className="relative w-32 h-32 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.06),0_0_20px_rgba(22,185,255,0.15)]">
          {Ikon && <Ikon size={56} className="text-[#16B9FF] drop-shadow-[0_0_15px_rgba(22,185,255,0.3)]" />}
        </div>
      </div>

      {/* Teks Deskripsi */}
      <div className="text-center">
        <h3 className="text-2xl font-black text-slate-800 tracking-normal mb-3 leading-tight uppercase">
          {judul}
        </h3>
        <p className="text-slate-500 text-[11.5px] font-bold tracking-wide leading-relaxed max-w-xs mx-auto opacity-90 mb-8">
          {deskripsi}
        </p>

        {/* Tombol */}
        {tombolTeks && tombolHref && (
          <Link
            href={tombolHref}
            className="inline-flex items-center justify-center px-10 py-3.5 bg-[#16B9FF] hover:bg-[#1299d4] text-white font-black rounded-xl transition-all active:scale-95 text-[10px] uppercase shadow-[0_10px_20px_rgba(22,185,255,0.2)]"
          >
            {tombolTeks}
          </Link>
        )}
      </div>
    </div>
  );
};

export default StateKosong;
