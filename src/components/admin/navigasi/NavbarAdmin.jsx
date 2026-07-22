'use client';
// Impprt React, Route dan Icon
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

// Komponen Utama Halaman Navigasi
const NavbarAdmin = ({ apakahSidebarTerbuka, setApakahSidebarTerbuka }) => {
  const navigasi = useRouter();

  return (
    // Halaman Bagian Navigasi Admin
    <div className="flex h-14 items-center bg-[#0B255D] fixed top-0 left-0 right-0 z-[100] border-b border-white/5">
      <div className="flex items-center w-full h-full">

        {/* Container Logo dan Hamburger Menu */}
        <div suppressHydrationWarning className={`flex items-center px-8 relative h-full shrink-0 transition-all duration-300 ${apakahSidebarTerbuka ? 'w-56' : 'w-20'} border-b border-white/10`}>
          {/* Logo SGDRC */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer min-w-max">
            <h1 className="font-logo text-3xl italic tracking-[0.05rem] leading-none">
              <span className="text-[#E40011]">SGD</span>
              <span className="text-[#0B255D]" style={{ WebkitTextStroke: '0.8px rgba(255, 255, 255, 0.9)' }}>RC</span>
            </h1>
          </Link>

          {/* Tombol Hamburger Menu */}
          <button
            suppressHydrationWarning
            onClick={() => setApakahSidebarTerbuka(!apakahSidebarTerbuka)}
            className="absolute left-[205px] top-1/2 -translate-y-1/2 p-2 text-[#16B9FF] hover:text-[#00A3FF] transition-all z-[60]"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Container Nama Admin */}
        <div className="flex-1 flex items-center justify-end px-8 md:px-10">
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg shadow-sm">
              <p className="text-xs font-bold text-white leading-none">Admin SGDRC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarAdmin;
