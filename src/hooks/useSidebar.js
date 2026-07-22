'use client';
import { useState, useEffect } from 'react';

// Fungsi Buka Tutup Sidebar
const useSidebar = (keyLocalStorage = 'sidebarTerbuka') => {
  // Fungsi Inisialisasi state sidebar dari localStorage (instan pada client)
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet) {
        return false;
      }
      if (keyLocalStorage) {
        const tersimpan = localStorage.getItem(keyLocalStorage);
        if (tersimpan !== null) {
          return JSON.parse(tersimpan);
        }
      }
      return true;
    }
    return true; // Server-side default
  });

  // Listener untuk resize layar (tutup di tablet/HP, sesuaikan di laptop)
  useEffect(() => {
    const aturSidebar = () => {
      if (window.innerWidth < 1024) {
        setApakahSidebarTerbuka(false);
      } else {
        if (keyLocalStorage) {
          const tersimpan = localStorage.getItem(keyLocalStorage);
          if (tersimpan !== null) {
            setApakahSidebarTerbuka(JSON.parse(tersimpan));
            return;
          }
        }
        setApakahSidebarTerbuka(true);
      }
    };
    window.addEventListener('resize', aturSidebar);
    return () => window.removeEventListener('resize', aturSidebar);
  }, [keyLocalStorage]);

  // Simpan Status Sidebar Saat Berubah di Laptop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && keyLocalStorage) {
      localStorage.setItem(keyLocalStorage, JSON.stringify(apakahSidebarTerbuka));
    }
  }, [apakahSidebarTerbuka, keyLocalStorage]);

  return [apakahSidebarTerbuka, setApakahSidebarTerbuka];
};

export default useSidebar;
