'use client';
import { useState, useEffect } from 'react';

// Custom Hook untuk mengatur status Sidebar Admin (Auto-hide di HP & Tablet)
const useSidebarAdmin = () => {
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useState(true);

  useEffect(() => {
    const aturSidebar = () => {
      if (window.innerWidth < 1024) {
        setApakahSidebarTerbuka(false);
      } else {
        setApakahSidebarTerbuka(true);
      }
    };
    aturSidebar();
    window.addEventListener('resize', aturSidebar);
    return () => window.removeEventListener('resize', aturSidebar);
  }, []);

  return [apakahSidebarTerbuka, setApakahSidebarTerbuka];
};

export default useSidebarAdmin;
