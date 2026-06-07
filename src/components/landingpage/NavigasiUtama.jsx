'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// Navigasi Bar
export default function NavigasiUtama() {
  const jalur = usePathname();
  const [apakahMenuTerbuka, setApakahMenuTerbuka] = useState(false);

  // Fungsi tutup menu saat link diklik
  const tutupMenu = () => setApakahMenuTerbuka(false);

  // Daftar Menu Navigasi
  const daftarMenu = [
    { label: 'BERANDA', href: '/', id: 'beranda', tipe: 'link' },
    { label: 'TENTANG', href: '/#tentang', id: 'tentang', tipe: 'anchor' },
    { label: 'DOKUMENTASI', href: '/#dokumentasi', id: 'dokumentasi', tipe: 'anchor' },
    { label: 'KONTAK', href: '/#kontak', id: 'kontak', tipe: 'anchor' },
    { label: 'GUIDEBOOK', href: '/guidebook', id: 'guidebook', tipe: 'link' },
    { label: 'INFORMASI', href: '/informasi', id: 'informasi', tipe: 'link' }
  ];

  return (
    // Navigasi Bar
    <nav className="w-full h-[48px] md:h-[56px] flex justify-center border-b border-white/10 fixed top-0 z-[110] transition-colors duration-300 bg-[#0B255D] shadow-lg px-4 md:px-6 lg:px-16">

      {/* Kontainer */}
      <div className="max-w-[1400px] flex items-center justify-between relative w-full">

        {/* Logo */}
        <Link href="/" onClick={tutupMenu} className="flex items-center gap-2 cursor-pointer z-20">
          <h1 className="font-logo text-[18px] md:text-[30px] italic tracking-[0.05rem]">
            <span className="text-[#E40011]">SGD</span>
            <span className="text-[#0B255D]" style={{ WebkitTextStroke: '0.8px rgba(255, 255, 255, 0.9)' }}>RC</span>
          </h1>
        </Link>

        {/* Menu Desktop & Ipad */}
        <ul className="hidden md:flex items-center md:gap-2.5 lg:gap-8 md:text-[8px] lg:text-[10.3px] font-bold md:tracking-normal lg:tracking-[0.1em] absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          {daftarMenu.map((menu, idx) => {
            // Menentukan Menu Aktif
            const aktif = jalur === menu.href;
            if (menu.tipe === 'link') {
              return (
                <li key={idx}>
                  {/* Link Menu */}
                  <Link
                    href={menu.href}
                    onClick={() => {
                      if (menu.href === '/' && jalur === '/') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`${aktif ? 'text-white' : 'text-white/70'} hover:text-white transition-colors uppercase`}
                  >
                    {menu.label}
                  </Link>
                </li>
              );
            }
            return (
              <li key={idx}>
                {/* Anchor Menu */}
                <a
                  href={menu.href}
                  onClick={(acara) => {
                    if (typeof window !== 'undefined' && window.location.pathname === '/') {
                      acara.preventDefault();
                      document.getElementById(menu.id)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-white/70 hover:text-white transition-colors uppercase"
                >
                  {menu.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Kontainer Kanan (Tombol & Hamburger) */}
        <div className="flex items-center gap-2 md:gap-4 z-20">

          {/* Tombol Login & Daftar (Tampilan Tablet iPad Air & Mini) */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            <Link
              href="/login"
              className="border border-white/20 hover:bg-white/10 text-white font-bold py-1.5 px-3 rounded-md text-[9px] uppercase items-center whitespace-nowrap transition-all"
            >
              LOGIN
            </Link>
            <Link
              href="/register"
              className="bg-[#E40011] hover:bg-red-700 text-white font-bold py-1.5 px-3.5 rounded-md text-[9px] uppercase items-center whitespace-nowrap transition-all shadow-md hover:shadow-lg"
            >
              DAFTAR
            </Link>
          </div>

          {/* Tombol Daftar Lomba Asli (Tampilan Laptop & iPad Pro) */}
          <Link
            href="/register"
            className="bg-[#E40011] hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-all lg:flex hidden text-[10px] uppercase items-center whitespace-nowrap shadow-md hover:shadow-lg"
          >
            DAFTAR LOMBA
          </Link>

          {/* Hamburger Menu (Tampilan HP) */}
          <button
            onClick={() => setApakahMenuTerbuka(!apakahMenuTerbuka)}
            className="md:hidden text-white p-2 focus:outline-none transition-transform active:scale-90"
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} className="text-white" />
          </button>
        </div>

        {/* Kotak Hamburger Menu */}
        <div
          className={`md:hidden fixed inset-0 top-[48px] md:top-[56px] bg-black/30 transition-opacity duration-300 z-[10] ${apakahMenuTerbuka ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
          onClick={tutupMenu}
        ></div>

        {/* Kontainer Sidebar (Tampilan HP) */}
        <div className={`md:hidden fixed top-[48px] md:top-[56px] left-0 w-full overflow-hidden z-[100] transition-all duration-300 ${apakahMenuTerbuka ? 'h-fit' : 'h-0'}`}>

          {/* Sidebar Container */}
          <div className={`
            w-full bg-[#0B255D] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-in-out border-b border-white/10
            ${apakahMenuTerbuka ? 'translate-y-0' : '-translate-y-full'}
          `}>

            {/* List Menu di dalam Sidebar */}
            <ul className="flex flex-col items-start px-6 py-6 gap-5 text-[11px] font-medium tracking-[0.2em] text-white uppercase">
              {daftarMenu.map((menu, idx) => {
                if (menu.tipe === 'link') {
                  return (
                    <li key={idx}>
                      <Link href={menu.href} onClick={tutupMenu} className="hover:text-[#E40011] transition-colors">{menu.label}</Link>
                    </li>
                  );
                }
                return (
                  <li key={idx}>
                    <a href={menu.href} onClick={tutupMenu} className="hover:text-[#E40011] transition-colors">{menu.label}</a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
