'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UserCircle, FileBadge, LogOut, Camera } from 'lucide-react';

// Sidebar Halaman Peserta
const Sidebar = ({ apakahSidebarTerbuka }) => {
  const lokasi = usePathname();
  const navigasi = useRouter();

  // Daftar Menu Yang Ditampilkan
  const daftarMenu = [
    { nama: 'Dashboard', ikon: LayoutDashboard, jalur: '/peserta/dashboard' },
    { nama: 'Data Peserta', ikon: UserCircle, jalur: '/peserta/data' },
    { nama: 'Sertifikat', ikon: FileBadge, jalur: '/peserta/sertifikat' },
    { nama: 'Dokumentasi', ikon: Camera, jalur: '/peserta/dokumentasi' },
  ];

  // Fungsi Keluar
  const tanganiKeluar = () => {
    localStorage.removeItem('token_sgdrc');
    localStorage.removeItem('user_sgdrc');
    navigasi.push('/login');
  };

  return (
    // Bagian Sidebar Peserta
    <aside
      suppressHydrationWarning
      className={`
    ${apakahSidebarTerbuka
          ? 'w-52 z-[60] sm:z-0' :
          'w-0 invisible pointer-events-none z-[60] sm:z-0'
        } 
    bg-slate-50 flex flex-col fixed sm:relative top-14 sm:top-0 
    h-[calc(100vh-3.5rem)] sm:h-full 
    transition-all duration-500 ease-in-out overflow-hidden`}>

      {/* Container Menu Navigasi */}
      <nav className="px-4 py-8 relative z-10 w-52 flex flex-col justify-between h-full border-r border-slate-100">

        {/* Container Daftar Menu */}
        <div className="space-y-1.5">
          {daftarMenu.map((data) => {
            // Menentukan Apakah Menu Aktif
            const apakahAktif = lokasi === data.jalur;
            return (
              <Link
                key={data.jalur}
                href={data.jalur}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${apakahAktif
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                  : 'text-slate-950 hover:bg-slate-50 hover:text-slate-950'
                  }`}
              >

                {/* Icon Menu */}
                <data.ikon size={18} />

                {/* Nama Menu */}
                <span className="text-sm tracking-wide">{data.nama}</span>
              </Link>
            );
          })}
        </div>

        {/* Container Tombol Keluar */}
        <div className="pt-4 border-t border-slate-200 mt-auto">
          <button
            onClick={tanganiKeluar}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-red-500 hover:bg-red-50 font-bold"
          >
            <LogOut size={18} />
            <span className="text-sm tracking-wide">Keluar</span>
          </button>
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;
