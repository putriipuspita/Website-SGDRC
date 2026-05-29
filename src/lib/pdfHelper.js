/**
 * Utilitas untuk menangani ekspor dokumen ke PDF (Kwitansi & Sertifikat)
 */

/**
 * Mengunduh kwitansi bukti pendaftaran peserta sebagai PDF
 * @param {Object} data - Objek data pendaftaran peserta
 * @param {Object} pengaturan - State pengaturan saat ini
 * @param {Function} dapatkanPengaturanBaru - Fungsi callback untuk mengambil pengaturan terbaru dari API
 */
export const unduhKwitansi = async (data, pengaturan, dapatkanPengaturanBaru) => {
  try {
    let settings = pengaturan;
    if (!settings || Object.keys(settings).length === 0) {
      settings = await dapatkanPengaturanBaru();
    }

    // Impor library secara dinamis agar halaman load awal lebih cepat
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // Jeda sejenak agar browser merender elemen tersembunyi
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const elemen = document.getElementById(`cetak-bukti-${data.id}`);
    if (!elemen) return;

    const canvas = await html2canvas(elemen, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    const namaDokumen = (data.tim || (data.peserta && data.peserta[0]) || 'Peserta').replace(/\s+/g, '_');
    pdf.save(`Bukti_Pendaftaran_${namaDokumen}.pdf`);
  } catch (err) {
    console.error("Gagal Unduh Bukti:", err);
    throw err;
  }
};

// ============================================================================
// SERTIFIKAT — Fungsi-fungsi yang dipakai di Sertifikat.jsx & ManajemenJuara.jsx
// ============================================================================

/**
 * Memuat font Montserrat & Cinzel serta font kustom lainnya ke browser untuk rendering Canvas
 * @param {Array<string>} customFonts - Daftar nama font Google kustom yang ingin dimuat
 */
export const muatFontSertifikat = async (customFonts = []) => {
  const fontsToLoad = [
    { name: 'Montserrat', url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf', weight: 'bold' },
    { name: 'Cinzel', url: 'https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-jHgTYo.ttf', weight: 'bold' }
  ];

  // Tambahkan font kustom jika belum ada di list default
  for (const fontName of customFonts) {
    if (fontName && fontName !== 'Montserrat' && fontName !== 'Cinzel') {
      try {
        const response = await fetch(`/api/font-proxy?font=${fontName.replace(/ /g, '+')}`);
        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            fontsToLoad.push({ name: fontName, url: data.url });
          }
        }
      } catch (e) {
        console.error("Gagal mendapatkan URL font:", fontName, e);
      }
    }
  }

  // Load semua font face ke document
  const loadPromises = fontsToLoad.map(async (fInfo) => {
    try {
      const scriptFonts = [
        'great vibes', 'alex brush', 'dancing script', 'pacifico', 'sacramento',
        'caveat', 'pinyon script', 'allura', 'parisienne', 'tangerine',
        'satisfy', 'cookie', 'kaushan script', 'courgette', 'lobster',
        'shadows into light', 'permanent marker', 'amatic sc', 'playball',
        'italianno', 'clicker script', 'rochester', 'petit formal script', 'qwigley'
      ];
      const isScript = scriptFonts.includes((fInfo.name || '').toLowerCase());
      const descriptor = isScript ? {} : { weight: fInfo.weight || 'bold' };

      const fontFace = new FontFace(fInfo.name, `url(${fInfo.url})`, descriptor);
      document.fonts.add(fontFace);
      await fontFace.load();

      // Bug Chrome Canvas: Font dinamis tidak akan ter-render di Canvas jika belum pernah
      // di-render di dalam DOM. Solusinya adalah membuat element dummy tersembunyi.
      const span = document.createElement('span');
      span.style.fontFamily = `"${fInfo.name}"`;
      span.style.fontWeight = isScript ? 'normal' : 'bold';
      span.style.position = 'absolute';
      span.style.visibility = 'hidden';
      span.innerText = 'font-loader';
      document.body.appendChild(span);

      // Paksa browser me-load glyphs font ke text engine
      await document.fonts.load(`${isScript ? 'normal' : 'bold'} 12px "${fInfo.name}"`);
      
      // Hapus element dummy setelah selesai load
      document.body.removeChild(span);
    } catch (err) {
      console.error("Gagal memuat font face:", fInfo.name, err);
    }
  });

  await Promise.all(loadPromises);
  await document.fonts.ready;

  // Jeda agar browser melakukan update font engine ke Canvas
  await new Promise(r => setTimeout(r, 150));
};

/**
 * Menggambar teks (nomor surat, nama, status) ke canvas sertifikat
 * Menghapus duplikasi `drawText` di ManajemenJuara.jsx & logika inline di Sertifikat.jsx
 *
 * @param {CanvasRenderingContext2D} ctx - Context canvas
 * @param {HTMLImageElement} img - Objek gambar template sertifikat
 * @param {Object} config - Konfigurasi posisi & ukuran teks
 * @param {Object} params - Parameter data sertifikat
 * @param {string} params.nama - Nama peserta
 * @param {string} params.namaLomba - Nama lomba
 * @param {string} params.jenis - 'PESERTA' atau 'JUARA'
 * @param {string|null} params.peringkat - Peringkat juara (jika juara)
 * @param {Object} params.pengaturan - Pengaturan admin
 * @param {number} params.indexInTeam - Index peserta dalam tim
 * @param {number} params.globalStartIdx - Global start index sertifikat
 * @param {boolean} params.isWinnerCert - Apakah sertifikat juara
 */
export const gambarTeksSertifikat = (ctx, img, config, params) => {
  const { nama, namaLomba, jenis, peringkat, pengaturan, indexInTeam, globalStartIdx, isWinnerCert } = params;

  const getFs = (s) => Math.round((s / 500) * img.height);
  const format = pengaturan.sertifikat_format_nomor || '[no]/SPH/PAN-SGDRC/XII/2024';
  const nomorMulaiPeserta = parseInt(pengaturan.sertifikat_nomor_mulai || '1');
  const nomorMulaiJuara = parseInt(pengaturan.sertifikat_nomor_mulai_juara || '1');
  const nomorMulai = isWinnerCert ? nomorMulaiJuara : nomorMulaiPeserta;

  const finalGlobalIndex = globalStartIdx + indexInTeam;
  const nomorSurat = format.replace('[no]', (nomorMulai + finalGlobalIndex).toString().padStart(4, '0'));

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000000';

  // Nomor Surat
  ctx.font = `${getFs(config.size_nomor)}px "Montserrat"`;
  ctx.fillText(`Nomor: ${nomorSurat}`, img.width / 2, img.height * (config.y_nomor / 100));

  // Nama (Menggunakan Font Dinamis)
  ctx.font = `bold ${getFs(config.size_nama)}px "${config.font_nama || 'Cinzel'}"`;
  ctx.fillText(nama.toUpperCase(), img.width / 2, img.height * (config.y_nama / 100));

  // Status
  if (jenis === 'PESERTA') {
    ctx.font = `bold ${getFs(config.size_status)}px "Montserrat"`;
    ctx.fillText(`PESERTA ${(namaLomba || "").toUpperCase()}`, img.width / 2, img.height * (config.y_status / 100));
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${getFs(config.size_status)}px "Montserrat"`;
    ctx.fillText((peringkat || 'JUARA').toUpperCase(), img.width / 2, img.height * (config.y_status / 100));
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${getFs(config.size_kategori || 13)}px "Montserrat"`;
    ctx.fillText(`KATEGORI ${(namaLomba || "").toUpperCase()}`, img.width / 2, img.height * ((config.y_kategori || 72) / 100));
  }
};

/**
 * Mengunduh sertifikat individu sebagai PDF (digunakan di halaman peserta)
 * Menghapus ~95 baris logika inline dari Sertifikat.jsx
 *
 * @param {Object} item - Data sertifikat (nama, lomba, jenis, peringkat, dll)
 */
export const unduhSertifikat = async (item) => {
  try {
    const { default: jsPDF } = await import('jspdf');

    // Ambil pengaturan admin
    const res = await fetch('/api/pengaturan', { cache: 'no-store' });
    const pengaturan = await res.json();

    const templateSrc = item.jenis === 'JUARA' ? pengaturan.sertifikat_juara : pengaturan.sertifikat_peserta;
    if (!templateSrc) return;

    // Buat Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = templateSrc;

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Ambil config template
      const c = item.jenis === 'JUARA'
        ? (pengaturan.sertifikat_config_juara ? JSON.parse(pengaturan.sertifikat_config_juara) : null)
        : (pengaturan.sertifikat_config_peserta ? JSON.parse(pengaturan.sertifikat_config_peserta) : null);
      const config = c || { y_nomor: 33, y_nama: 48, y_status: 62, size_nomor: 11, size_nama: 32, size_status: 18, font_nama: 'Cinzel' };

      // Muat font dengan font dinamis dari config
      await muatFontSertifikat([config.font_nama]);

      // Gambar teks ke canvas
      gambarTeksSertifikat(ctx, img, config, {
        nama: item.nama,
        namaLomba: item.lomba,
        jenis: item.jenis,
        peringkat: item.peringkat,
        pengaturan: pengaturan,
        indexInTeam: item.index,
        globalStartIdx: item.jenis === 'JUARA' ? item.global_start_idx_juara : item.global_start_idx_peserta,
        isWinnerCert: item.jenis === 'JUARA'
      });

      // Simpan PDF
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [img.width, img.height] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, img.width, img.height);
      pdf.save(`Sertifikat_${item.nama}.pdf`);
    };
  } catch (err) {
    console.error("Gagal Mengunduh Sertifikat:", err);
    throw err;
  }
};
