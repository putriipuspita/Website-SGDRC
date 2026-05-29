'use client';
import { useState, useEffect } from 'react';

/**
 * Custom hook untuk mengatur state sidebar + sinkronisasi localStorage
 * Menghapus ~25 baris kode duplikat dari 3 file halaman peserta
 * (Dashboard.jsx, DataPeserta.jsx, Sertifikat.jsx)
 *
 * @returns {[boolean, Function]} - [apakahSidebarTerbuka, setApakahSidebarTerbuka]
 */
const useSidebar = () => {
  // Inisialisasi state sidebar dari localStorage (atau default)
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
