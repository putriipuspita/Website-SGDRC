'use client';
// Import Link, Navigasi dan Icon
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, ChevronDown, Settings, Award } from 'lucide-react';

// Import Utility
import { formatJudul } from '../../../lib/formatHelper';

// Komponen Utama Sidebar
const SidebarAdmin = ({ apakahSidebarTerbuka }) => {
  const lokasi = usePathname();
  const [apakahPesertaTerbuka, setApakahPesertaTerbuka] = useState(false);

  // Daftar Menu Dashboard
  const menuDashboard = [
    { nama: 'Dashboard', ikon: LayoutDashboard, jalur: '/admin/dashboard' },
  ];

  // Daftar Menu Lomba
  const [kategoriLomba, setKategoriLomba] = useState([]);

  // Ambil Data Lomba dari API
  React.useEffect(() => {
    fetch('/api/peserta/lomba')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Mapping Data Lomba
          const listDinamis = data.map(l => {
            const slug = (l.nama || l.judul || "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '');

            // Format Nama Lomba menggunakan formatJudul
            const namaFormat = formatJudul(l.nama || l.judul || "");

            // Return Data Lomba 
            return {
              nama: namaFormat,
              slug: slug
            };
          });

          // Simpan Ke State
          setKategoriLomba(listDinamis);
        }
      })
      .catch(err => console.error("Gagal mengambil daftar lomba di sidebar:", err));
  }, []);

  return (
    // Halaman Bagian Sidebar
    <aside className={`${apakahSidebarTerbuka ? 'w-56' : 'w-0'} bg-[#0B255D] flex flex-col fixed top-14 left-0 h-[calc(100vh-56px)] transition-all duration-500 ease-in-out z-50 overflow-y-auto scrollbar-hide border-r border-white/5`}>
      <nav className="flex flex-col justify-between h-full py-6 w-56 px-0">
        {/* Container Menu Sidebar */}
        <div>

          {/* Menu Dashboard */}
          {menuDashboard.map((item) => {
            const apakahAktif = lokasi === item.jalur;
            return (
              <div key={item.jalur} className="px-4 mb-1">
                {/* Link Menu */}
                <Link
                  href={item.jalur}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${apakahAktif
                    ? 'text-[#16B9FF] font-bold'
                    : 'text-white hover:bg-white/10'
                    }`}
                >
                  {/* Icon dan Nama */}
                  <item.ikon size={18} />
                  <span className="text-[13.5px] font-semibold tracking-wide">{item.nama}</span>
                </Link>
              </div>
            );
          })}

          {/* Container Menu Peserta */}
          <div className="flex flex-col mb-1">
            {/* Container Tombol Dropdown */}
            <div className="px-4">
              {/* Tombol Buka Tutup Dropdowns */}
              <button
                onClick={() => setApakahPesertaTerbuka(!apakahPesertaTerbuka)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${lokasi.includes('/admin/peserta')
                  ? 'text-[#16B9FF] font-bold'
                  : 'text-white hover:bg-white/10'
                  }`}
              >

                {/* Ikon dan Nama Menu Utama */}
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <span className="text-[13.5px] font-semibold tracking-wide">Peserta</span>
                </div>

                {/* Icon Panah Dropdown */}
                <ChevronDown size={14} className={`transition-transform duration-300 ${apakahPesertaTerbuka ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Container Dropdown Menu Peserta */}
            <div className={`overflow-hidden transition-all duration-500 ${apakahPesertaTerbuka ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col bg-[#103070] border-y border-white/5 shadow-inner mt-1">
                {kategoriLomba.map((lomba) => {
                  const jalur = `/admin/peserta/${lomba.slug}`;
                  const apakahAktif = lokasi === jalur;
                  return (
                    // Link
                    <Link
                      key={lomba.slug}
                      href={jalur}
                      className={`flex items-center gap-3 pl-14 pr-4 py-2 transition-all ${apakahAktif
                        ? 'text-[#16B9FF] font-bold bg-white/5 border-r-4 border-[#16B9FF]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {/* Nama Lomba */}
                      <span className="text-[11px] font-medium tracking-wide whitespace-nowrap">{lomba.nama}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu Pemenang */}
          <div className="px-4 mb-1">
            {/* Lin */}
            <Link
              href="/admin/pemenang"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${lokasi === '/admin/pemenang'
                ? 'text-[#16B9FF] font-bold'
                : 'text-white hover:bg-white/10'
                }`}
            >

              {/* Icon dan Nama Menu */}
              <Award size={18} />
              <span className="text-[13.5px] font-semibold tracking-wide">Pemenang</span>
            </Link>
          </div>

          {/* Menu Informasi */}
          <div className="px-4 mb-1">
            {/* Link */}
            <Link
              href="/admin/informasi"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${lokasi === '/admin/informasi'
                ? 'text-[#16B9FF] font-bold'
                : 'text-white hover:bg-white/10'
                }`}
            >

              {/* Icon dan Nama Menu */}
              <Settings size={18} />
              <span className="text-[13.5px] font-semibold tracking-wide">Informasi</span>
            </Link>
          </div>
        </div>

        {/* Container Tombol Keluar */}
        <div className="px-4 mt-auto pt-4 border-t border-white/10">
          {/* Button */}
          <button
            onClick={() => {
              localStorage.removeItem('token_sgdrc');
              localStorage.removeItem('user_sgdrc');
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-red-500 hover:bg-red-50/10 font-bold"
          >

            {/* Icon dan Nama Menu */}
            <LogOut size={18} />
            <span className="text-[13.5px] tracking-wide">Keluar</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
