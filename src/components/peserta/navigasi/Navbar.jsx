'use client';
import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

// Navbar Halaman Peserta
const Navbar = ({
  apakahSidebarTerbuka,
  setApakahSidebarTerbuka,
  tampilkanHamburger = true,
  apakahBeku = false
}) => {

  // Menyimpan Nama Peserta
  const [namaUser, setNamaUser] = React.useState('');

  React.useEffect(() => {
    const userJson = localStorage.getItem('user_sgdrc');
    if (userJson) {
      try {
        // Menampilkan Nama Pengguna
        const user = JSON.parse(userJson);
        Promise.resolve().then(() => {
          setNamaUser(user.nama || 'Peserta');
        });
      } catch (e) {
        // Gunakan Default Jika Data Rusak
        Promise.resolve().then(() => {
          setNamaUser('Peserta');
        });
      }
    }
  }, []);

  return (
    // Bagian Halaman Navigasi Bar
    <div className="flex h-14 items-center bg-slate-50 sticky top-0 z-50">
      {/* Container Isi Navbar */}
      <div className={`flex items-center w-full h-full ${apakahBeku ? 'max-w-[1400px] mx-auto' : ''}`}>

        {/* Container Logo*/}
        <div className="w-52 px-8 flex items-center relative h-full shrink-0">
          <Link href="/" className="flex items-center gap-2 cursor-pointer min-w-max">
            <h1 className="font-logo text-2xl italic tracking-[0.05rem] leading-none">
              <span className="text-[#E40011]">SGD</span>
              <span className="text-[#0B255D]">RC</span>
            </h1>
          </Link>
        </div>

        {/* Tombol Hamburger Menu*/}
        {tampilkanHamburger && (
          <button
            suppressHydrationWarning
            onClick={() => setApakahSidebarTerbuka(!apakahSidebarTerbuka)}
            className="p-2 text-[#16B9FF] hover:text-[#00A3FF] transition-all z-[60] -ml-5"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Container Nama Pengguna */}
        <div className="flex-1 flex items-center justify-end px-10">
          <div className="text-right hidden sm:block bg-[#0B255D] border border-[#0B255D]/10 px-3 py-1.5 rounded-lg shadow-sm">
            <p className="text-xs font-bold text-white leading-none">{namaUser}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Navbar;
