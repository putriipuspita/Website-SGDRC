'use client';
import React, { useState, useEffect } from 'react';
import NavbarAdmin from '@/components/admin/navigasi/NavbarAdmin';
import SidebarAdmin from '@/components/admin/navigasi/SidebarAdmin';
import Informasi from '@/components/admin/informasi/Informasi';
import useSidebar from '@/hooks/useSidebar';

// Halaman utama menu informasi
export default function HalamanInformasi() {
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar('sidebarAdmin');
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);



  return (
    <div className="h-screen bg-[#F8FAFC] font-montserrat flex flex-col overflow-hidden">
      {/* Navbar Admin */}
      <NavbarAdmin
        apakahSidebarTerbuka={apakahSidebarTerbuka}
        setApakahSidebarTerbuka={setApakahSidebarTerbuka}
        apakahProfilTerbuka={apakahProfilTerbuka}
        setApakahProfilTerbuka={setApakahProfilTerbuka}
      />

      {/* Sidebar */}
      <div className="flex flex-1 pt-14 overflow-hidden">
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Konten */}
        <main suppressHydrationWarning className={`flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-6 peserta-scrollbar transition-all duration-500 ${apakahSidebarTerbuka ? 'lg:ml-56' : 'ml-0'}`}>
          <div className="max-w-[1400px] mx-auto">
            <Informasi />
          </div>
        </main>
      </div>
    </div>
  );
}
