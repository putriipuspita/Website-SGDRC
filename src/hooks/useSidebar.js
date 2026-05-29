'use client';
import { useState, useEffect } from 'react';

// Fungsi Buka Tutup Sidebar
const useSidebar = () => {

  // Fungsi Inisialisasi state sidebar dari localStorage
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        return false;
      }

      // Ambil Status Terakhir Kondisi Sidebar
      const tersimpan = localStorage.getItem('sidebarTerbuka');
      if (tersimpan !== null) {
        return JSON.parse(tersimpan);
      }
      return true;
    }
    return true;
  });

  // Simpan Status Sidebar Saat Berubah
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      localStorage.setItem('sidebarTerbuka', JSON.stringify(apakahSidebarTerbuka));
    }
  }, [apakahSidebarTerbuka]);

  return [apakahSidebarTerbuka, setApakahSidebarTerbuka];
};

export default useSidebar;
