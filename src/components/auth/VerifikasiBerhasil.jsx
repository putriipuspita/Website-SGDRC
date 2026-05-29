'use client';
import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

// Halaman Verifikasi Berhasil
const VerifikasiBerhasil = () => {
  return (
    // Container Halaman Verifikasi Berhasil
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-montserrat">
      <div className="w-[310px] md:w-[450px] lg:w-[450px] xl:w-[310px] min-w-[310px] md:min-w-[450px] lg:min-w-[450px] xl:min-w-[310px] relative z-10 animate-fade-in my-auto">

        {/* Container Kotak */}
        <div className="bg-white rounded-[30px] p-6 pt-8 pb-10 md:p-10 md:pt-14 md:pb-16 lg:p-8 lg:pt-12 lg:pb-14 xl:p-6 xl:pt-8 xl:pb-10 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_20px_rgba(22,185,255,0.05)] border border-slate-200 text-center relative">
          {/* Container Logo */}
          <div className="relative flex justify-center mb-6 lg:mb-5 xl:mb-6">
            {/* Logo */}
            <div className="relative group bg-emerald-50 rounded-full p-4 shadow-[0_10px_25px_rgba(16,185,129,0.1)] border border-emerald-100">
              <CheckCircle2
                size={64}
                className="w-16 h-16 md:w-24 md:h-24 lg:w-[85px] lg:h-[85px] xl:w-16 xl:h-16 text-emerald-500 animate-float drop-shadow-sm"
              />
            </div>
          </div>

          {/* Judul */}
          <h1 className="text-slate-800 text-xl md:text-2xl lg:text-xl xl:text-xl font-black uppercase tracking-wider mb-2">
            VERIFIKASI BERHASIL
          </h1>

          {/* Deskripsi */}
          <div className="space-y-4 mb-8 md:mb-12 lg:mb-10 xl:mb-8">
            <p className="text-slate-500 text-[12px] md:text-[14px] lg:text-[13px] xl:text-[12px] font-medium leading-relaxed">
              Akun telah berhasil diverifikasi! <br /> Silakan login untuk melanjutkan <br /> pendaftaran lomba.
            </p>
          </div>

          {/* Tombol Login */}
          <Link
            href="/login"
            className="inline-block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 md:py-4 lg:py-3.5 xl:py-3 rounded-xl tracking-widest uppercase transition-all duration-300 shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] active:scale-[0.98] text-[12px] md:text-[14px] lg:text-[13px] xl:text-[12px]"
          >
            LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifikasiBerhasil;
