'use client';
import React, { useState } from 'react';
import NavbarAdmin from '@/components/admin/navigasi/NavbarAdmin';
import SidebarAdmin from '@/components/admin/navigasi/SidebarAdmin';
import Informasi from '@/components/admin/informasi/Informasi';

export default function HalamanInformasi() {
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useState(true);
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-montserrat flex flex-col overflow-hidden">
      <NavbarAdmin
        apakahSidebarTerbuka={apakahSidebarTerbuka}
        setApakahSidebarTerbuka={setApakahSidebarTerbuka}
        apakahProfilTerbuka={apakahProfilTerbuka}
        setApakahProfilTerbuka={setApakahProfilTerbuka}
      />

      <div className="flex flex-1 pt-14">
        <SidebarAdmin apakahSidebarTerbuka={apakahSidebarTerbuka} />

        <main className={`flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-6 scrollbar-hide transition-all duration-500 ${apakahSidebarTerbuka ? 'md:ml-56' : 'ml-0'}`}>
          <div className="max-w-[1400px] mx-auto">
            <Informasi />
          </div>
        </main>
      </div>
    </div>
  );
}
