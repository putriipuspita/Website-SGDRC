'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { muatFontSertifikat, gambarTeksSertifikat } from '@/lib/pdfHelper';

// Fungsi cetak sertifikat
const CetakSertifikat = () => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const sudahProses = useRef(false);

  useEffect(() => {
    if (sudahProses.current) return;

    // Fungsi generate sertifikat
    const jalankanProses = async () => {
      try {
        const tersimpan = localStorage.getItem('dataSertifikat');
        if (!tersimpan) return;
        const ds = JSON.parse(tersimpan);

        // Ambil pengaturan dari admin
        const res = await fetch('/api/pengaturan', { cache: 'no-store' });
        const pengaturan = await res.json();

        // Tentukan template sertifikat
        const templateSrc = ds.jenis === 'JUARA' ? pengaturan.sertifikat_juara : pengaturan.sertifikat_peserta;

        // Buat gambar
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = templateSrc;

        // Fungsi load gambar
        img.onload = async () => {
          if (sudahProses.current) return;
          sudahProses.current = true;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          // Setup canvas
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Ambil konfigurasi template
          const configRaw = ds.jenis === 'JUARA' ? pengaturan.sertifikat_config_juara : pengaturan.sertifikat_config_peserta;
          const config = configRaw ? JSON.parse(configRaw) : { y_nomor: 33, y_nama: 48, y_status: 62, size_nomor: 11, size_nama: 32, size_status: 18, font_nama: 'Cinzel' };
          const selectedFont = config.font_nama || 'Cinzel';

          // Muat font dinamis menggunakan helper terpusat
          try {
            await muatFontSertifikat([selectedFont]);
          } catch (e) {
            console.error("Gagal load font:", e);
          }

          // Gambar teks ke canvas menggunakan helper terpusat
          gambarTeksSertifikat(ctx, img, config, {
            nama: ds.nama,
            namaLomba: ds.lomba,
            jenis: ds.jenis,
            peringkat: ds.peringkat,
            pengaturan: pengaturan,
            indexInTeam: ds.index || 0,
            globalStartIdx: ds.jenis === 'JUARA' ? (ds.global_start_idx_juara || 0) : (ds.global_start_idx_peserta || 0),
            isWinnerCert: ds.jenis === 'JUARA'
          });

          // Download sertifikat
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [img.width, img.height] });
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, img.width, img.height);
          pdf.save(`Sertifikat_${ds.nama.replace(/\s+/g, '_')}.pdf`);

          // Selesai
          setTimeout(() => {
            window.close();
            setTimeout(() => { window.location.href = '/peserta'; }, 500);
          }, 1000);
        };
      } catch (err) {
        setError("Gagal.");
      }
    };
    jalankanProses();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {!error ? (
        <>
          <Loader2 className="w-10 h-10 text-[#16B9FF] animate-spin mb-4" />
          <p className="text-[#0B255D] font-black text-[10px] uppercase tracking-widest animate-pulse">Sedang Mengunduh...</p>
        </>
      ) : (
        <p className="text-slate-400 text-xs">{error}</p>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CetakSertifikat;
