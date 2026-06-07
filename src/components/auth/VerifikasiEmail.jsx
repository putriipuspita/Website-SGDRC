'use client';
import React from 'react';
import Link from 'next/link';

// Halaman Verifikasi Email
const VerifikasiEmail = () => {
  return (
    // Container Halaman Verifikasi Email
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-montserrat">
      <div className="w-[310px] md:w-[450px] lg:w-[450px] min-[1200px]:w-[310px] min-w-[310px] md:min-w-[450px] lg:min-w-[450px] min-[1200px]:min-w-[310px] relative z-10 animate-fade-in my-auto">

        {/* Container Kotak */}
        <div className="bg-white rounded-[30px] p-6 pt-8 pb-10 md:p-10 md:pt-14 md:pb-16 lg:p-8 lg:pt-12 lg:pb-14 min-[1200px]:p-6 min-[1200px]:pt-8 min-[1200px]:pb-10 shadow-[0_20px_50px_rgba(0,0,0,0.05),0_0_20px_rgba(22,185,255,0.05)] border border-slate-200 text-center relative">

          {/* Container Logo */}
          <div className="relative flex justify-center mb-6 lg:mb-5 min-[1200px]:mb-6">
            {/* Logo */}
            <div className="relative group bg-white rounded-full p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-slate-100">
              <img
                src="/aset/icon/email.png"
                alt="Verifikasi Email"
                className="w-16 h-16 md:w-24 md:h-24 lg:w-[85px] lg:h-[85px] min-[1200px]:w-16 min-[1200px]:h-16 object-contain animate-float drop-shadow-sm"
              />
            </div>
          </div>

          {/* Judul */}
          <h1 className="text-slate-800 text-xl md:text-2xl lg:text-xl min-[1200px]:text-xl font-black uppercase tracking-wider mb-2">
            VERIFIKASI EMAIL
          </h1>

          {/* Deskripsi */}
          <div className="space-y-4 mb-8 md:mb-12 lg:mb-10 min-[1200px]:mb-8">
            <p className="text-slate-500 text-[12px] md:text-[14px] lg:text-[13px] min-[1200px]:text-[12px] font-medium leading-relaxed">
              Kami telah mengirimkan link verifikasi <br /> ke email. Silahkan cek inbox <br /> atau folder spam.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifikasiEmail;
