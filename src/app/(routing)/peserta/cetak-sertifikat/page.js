'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

async function getGoogleFontUrl(fontFamily) {
  try {
    const response = await fetch(`/api/font-proxy?font=${fontFamily.replace(/ /g, '+')}`);
    if (response.ok) {
      const data = await response.json();
      return data.url;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function loadFontBuffer(name, url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const fontFace = new FontFace(name, buffer);
  await fontFace.load();
  document.fonts.add(fontFace);
  return fontFace;
}

const CetakSertifikat = () => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const sudahProses = useRef(false);

  useEffect(() => {
    if (sudahProses.current) return;

    const jalankanProses = async () => {
      try {
        const tersimpan = localStorage.getItem('dataSertifikat');
        if (!tersimpan) return;
        const ds = JSON.parse(tersimpan);

        const res = await fetch('/api/pengaturan', { cache: 'no-store' });
        const pengaturan = await res.json();

        const templateSrc = ds.jenis === 'JUARA' ? pengaturan.sertifikat_juara : pengaturan.sertifikat_peserta;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = templateSrc;

        img.onload = async () => {
          if (sudahProses.current) return;
          sudahProses.current = true;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const configRaw = ds.jenis === 'JUARA' ? pengaturan.sertifikat_config_juara : pengaturan.sertifikat_config_peserta;
          const config = configRaw ? JSON.parse(configRaw) : { y_nomor: 33, y_nama: 48, y_status: 62, size_nomor: 11, size_nama: 32, size_status: 18 };
          const selectedFont = config.font_nama || 'Cinzel';

          // Font fail-safe dengan fetch ArrayBuffer
          let fontNameToUse = selectedFont;
          try {
            await loadFontBuffer('Montserrat', 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2');
            
            const dynamicFontUrl = await getGoogleFontUrl(selectedFont);
            if (dynamicFontUrl) {
              await loadFontBuffer(selectedFont, dynamicFontUrl);
            } else {
              await loadFontBuffer('Cinzel', 'https://fonts.gstatic.com/s/cinzel/v23/8vIQ7W07mIn9Y368.woff2');
              fontNameToUse = 'Cinzel';
            }
          } catch (e) {
            console.error("Gagal load font:", e);
            try {
              await loadFontBuffer('Cinzel', 'https://fonts.gstatic.com/s/cinzel/v23/8vIQ7W07mIn9Y368.woff2');
            } catch (err) {}
            fontNameToUse = 'Cinzel';
          }

          // Beri jeda 150ms agar browser melakukan update font engine ke Canvas secara sempurna
          await new Promise(r => setTimeout(r, 150));

          const format = pengaturan.sertifikat_format_nomor || '[no]/SPH/PAN-SGDRC/XII/2024';
          const nomorMulaiPeserta = parseInt(pengaturan.sertifikat_nomor_mulai || '1');
          const nomorMulaiJuara = parseInt(pengaturan.sertifikat_nomor_mulai_juara || '1');
          const nomorMulai = ds.jenis === 'JUARA' ? nomorMulaiJuara : nomorMulaiPeserta;
          const nomorSurat = format.replace('[no]', (nomorMulai + (ds.index || 0)).toString().padStart(3, '0'));

          const getFs = (s) => Math.round((s / 500) * img.height);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#000000';

          ctx.font = `${getFs(config.size_nomor)}px Montserrat`;
          ctx.fillText(`Nomor: ${nomorSurat}`, img.width / 2, img.height * (config.y_nomor / 100));

          ctx.font = `bold ${getFs(config.size_nama)}px ${fontNameToUse}`;
          ctx.fillText(ds.nama.toUpperCase(), img.width / 2, img.height * (config.y_nama / 100));

          if (ds.jenis === 'PESERTA') {
            ctx.font = `bold ${getFs(config.size_status)}px Montserrat`;
            ctx.fillText(`PESERTA ${ds.lomba.toUpperCase()}`, img.width / 2, img.height * (config.y_status / 100));
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${getFs(config.size_status)}px Montserrat`;
            ctx.fillText(ds.peringkat?.toUpperCase() || 'JUARA', img.width / 2, img.height * (config.y_status / 100));
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${getFs(config.size_kategori || 13)}px Montserrat`;
            ctx.fillText(`KATEGORI ${ds.lomba.toUpperCase()}`, img.width / 2, img.height * ((config.y_kategori || 72) / 100));
          }

          // DOWNLOAD LANGSUNG
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [img.width, img.height] });
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, img.width, img.height);
          pdf.save(`Sertifikat_${ds.nama.replace(/\s+/g, '_')}.pdf`);

          // Selesai, tutup tab atau kembali setelah 1 detik
          setTimeout(() => {
            window.close();
            // Jika window.close gagal (karena bukan dibuka via script), kembali ke dashboard
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
