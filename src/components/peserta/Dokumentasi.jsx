'use client';
import React, { useState, useEffect } from 'react';
import { ExternalLink, FolderOpen, Loader2 } from 'lucide-react';
import Navbar from './navigasi/Navbar';
import Sidebar from './navigasi/Sidebar';
import useSidebar from '../../hooks/useSidebar';
import StateKosong from '../element/StateKosong';

// Cache menyimpan fetch
let cacheDokumentasi = null;

// Cache global
const preloadedImagesCache = {};

// Komponen Dokumentasi
const Dokumentasi = () => {
  const [apakahProfilTerbuka, setApakahProfilTerbuka] = useState(false);
  const [apakahSidebarTerbuka, setApakahSidebarTerbuka] = useSidebar();

  // State Data Link Dokumentasi & Loading
  const [linkDrive, setLinkDrive] = useState(cacheDokumentasi?.linkDrive || '');
  const [semuaFoto, setSemuaFoto] = useState(cacheDokumentasi?.semuaFoto || []);
  const [sedangMemuat, setSedangMemuat] = useState(!cacheDokumentasi);

  // Ambil data pengaturan link dokumentasi dari API
  useEffect(() => {
    fetch('/api/pengaturan', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data) {
          let driveVal = '';
          let fotoVal = [];

          // Link Google Drive
          if (data.link_dokumentasi) {
            driveVal = data.link_dokumentasi;
          } else if (Array.isArray(data)) {
            const found = data.find(item => item.nama_key === 'link_dokumentasi' || item.nama === 'link_dokumentasi');
            if (found) driveVal = found.nilai || found.value;
          } else if (typeof data === 'object') {
            const val = data.link_dokumentasi || data.LINK_DOKUMENTASI;
            if (val) driveVal = val;
          }

          // List Foto Dokumentasi Custom
          if (data.foto_dokumentasi_list) {
            try {
              const listParsed = JSON.parse(data.foto_dokumentasi_list);
              if (Array.isArray(listParsed)) {
                fotoVal = listParsed.filter(Boolean);

                // Preload Gambar di Memori Browser
                fotoVal.forEach(url => {
                  if (!preloadedImagesCache[url]) {
                    const img = new Image();
                    img.src = url;
                    preloadedImagesCache[url] = img;
                  }
                });
              }
            } catch (err) {
              console.error("Gagal parse foto_dokumentasi_list:", err);
            }
          }

          // Update State
          setLinkDrive(driveVal);
          setSemuaFoto(fotoVal);

          // Simpan ke Cache
          cacheDokumentasi = { linkDrive: driveVal, semuaFoto: fotoVal };
        }
      })
      .catch(err => console.error("Gagal mengambil link dokumentasi:", err))
      .finally(() => {
        setSedangMemuat(false);
      });
  }, []);

  return (
    <div className="h-screen bg-slate-50 text-slate-800 font-montserrat flex flex-col overflow-hidden relative">

      {/* Navigasi */}
      <Navbar
        apakahSidebarTerbuka={apakahSidebarTerbuka}
        setApakahSidebarTerbuka={setApakahSidebarTerbuka}
        apakahProfilTerbuka={apakahProfilTerbuka}
        setApakahProfilTerbuka={setApakahProfilTerbuka}
      />

      {/* Garis Pembatas */}
      <div className="w-full h-[1px] bg-[#16B9FF] shadow-[0_2px_8px_rgba(22,185,255,0.1)] relative z-[70]"></div>

      {/* Container Utama */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar apakahSidebarTerbuka={apakahSidebarTerbuka} />

        {/* Area Konten Utama */}
        <div className="flex-1 bg-slate-50 overflow-y-auto peserta-scrollbar px-6 md:px-10 py-8 flex flex-col border-l border-solid border-[#16B9FF] shadow-[-2px_0_8px_rgba(22,185,255,0.1)] relative z-20">
          <div className="w-full flex-1 flex flex-col">

            {/* Tampilan Ketika Memuat */}
            {sedangMemuat ? (
              <div className="flex-grow flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-[#16B9FF] animate-spin mb-4" />
                <p className="text-slate-400 font-bold tracking-normal text-[10px]">Memuat Dokumentasi...</p>
              </div>
            ) : (!linkDrive && semuaFoto.length === 0) ? (
              // Tampilan Ketika Tidak Ada Data
              <div className="flex-1 flex flex-col">

                {/* Judul & Deskripsi Halaman */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-in slide-in-from-left duration-700">
                  <div className="text-left border-l-4 border-[#E40011] pl-6">
                    <h1 className="text-xl font-black mb-1 tracking-normal text-slate-800 uppercase leading-relaxed md:leading-tight">Dokumentasi Kegiatan</h1>
                    <p className="text-slate-500 text-[9.5px] font-bold tracking-normal uppercase leading-relaxed">Kumpulan Momen SGDRC {new Date().getFullYear()}</p>
                  </div>
                </div>

                {/* Konten State Kosong */}
                <div className="flex-grow flex flex-col items-center justify-center py-12">
                  <StateKosong
                    Ikon={FolderOpen}
                    judul="Belum Ada Dokumentasi"
                    deskripsi="Dokumentasi kegiatan SGD RC 2026 akan diunggah oleh admin setelah seluruh rangkaian acara selesai."
                    className="flex flex-col items-center justify-center p-4 text-center max-w-md"
                  />
                </div>
              </div>
            ) : (
              // Tampilan Ketika Ada Data
              <div className="w-full flex-1 flex flex-col gap-5 min-h-0 justify-between">
                {/* Container Banner */}
                <div className="w-full bg-[#0B255D] text-white rounded-xl p-4 md:p-5 shadow-md border border-white/10 relative overflow-hidden shrink-0 animate-in slide-in-from-top duration-700">
                  {/* Efek Glow di Latar Belakang */}
                  <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#16B9FF] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                  <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-y-3 md:items-center lg:gap-4">
                    {/* Header: Judul */}
                    <div className="flex flex-col items-center md:items-start lg:items-start justify-center md:justify-start md:col-start-1 md:row-start-1">
                      <h2 className="text-[25px] md:text-[28px] lg:text-[22px] font-black uppercase tracking-normal text-white leading-none">
                        DOKUMENTASI
                      </h2>
                    </div>

                    {/* Deskripsi Singkat */}
                    <p className="text-white/70 text-[10.5px] md:text-[11.5px] lg:text-[11px] font-medium leading-relaxed max-w-[650px] lg:max-w-[500px] text-center md:text-left md:col-span-2 md:col-start-1 md:row-start-2 lg:flex-1 lg:mx-6">
                      Seluruh foto dan video kegiatan SGD RC 2026 telah dikumpulkan dalam satu folder Google Drive resmi panitia. Silakan klik tombol di samping untuk membukanya.
                    </p>

                    {/* Tombol Aksi */}
                    <div className="w-full md:w-auto flex justify-center md:justify-end md:col-start-2 md:row-start-1 lg:shrink-0">
                      <a
                        href={linkDrive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3.5 lg:py-3 bg-[#0066da] hover:bg-[#005bbf] text-white rounded-xl font-black text-[11px] lg:text-[10px] uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        BUKA DOKUMENTASI
                      </a>
                    </div>
                  </div>
                </div>

                {/* Container Foto*/}
                <div className="bg-white rounded-2xl border border-slate-200 p-3 md:p-4 shadow-sm w-full flex-1 flex flex-col min-h-0 animate-in zoom-in-95 duration-500">
                  <div className="flex-1 min-h-0">
                    <GridPhotoCards photos={semuaFoto} />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// Cache global
const listFotoTerload = new Set();

// Sub-komponen untuk menampilkan kartu foto tunggal
const PhotoCard = ({ src, idx }) => {
  // Inisialisasi state selesai dimuat
  const [apakahSelesaiDimuat, setApakahSelesaiDimuat] = useState(listFotoTerload.has(src));

  const tanganiSelesaiMuat = () => {
    listFotoTerload.add(src);
    setApakahSelesaiDimuat(true);
  };

  return (
    <div
      className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm hover:scale-[1.03] transition-all duration-300 transform origin-center flex flex-col relative overflow-hidden"
    >
      <div className="rounded-lg overflow-hidden bg-slate-50 relative w-full h-auto">
        {/* Efek Shimmer */}
        {!apakahSelesaiDimuat && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center aspect-[4/3]">
            {/* Animasi shimmer */}
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] absolute inset-0"></div>
          </div>
        )}
        <img
          src={src}
          alt={`SGDRC-Dokumentasi-${idx}`}
          className={`w-full h-auto block transition-opacity duration-700 ${apakahSelesaiDimuat ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={tanganiSelesaiMuat}
          decoding="async"
        />
      </div>

      {/* Gaya Animasi Shimmer */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-150%); }
            50% { transform: translateX(-60%); }
            100% { transform: translateX(150%); }
          }
        `
      }} />
    </div>
  );
};

// Komponen Helper untuk render grid Photo Card
const GridPhotoCards = ({ photos }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {photos.map((src, idx) => (
        <PhotoCard key={idx} src={src} idx={idx} />
      ))}
    </div>
  );
};

export default Dokumentasi;
