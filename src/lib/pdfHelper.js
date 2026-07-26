// Fungsi unduh kwitansi
export const unduhKwitansi = async (data, pengaturan, dapatkanPengaturanBaru) => {
  try {
    let settings = pengaturan;
    if (!settings || Object.keys(settings).length === 0) {
      settings = await dapatkanPengaturanBaru();
    }

    // Impor library
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // Jeda
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ambil element bukti pendaftaran
    const elemen = document.getElementById(`cetak-bukti-${data.id}`);
    if (!elemen) return;

    // Ubah elemen HTML menjadi canvas
    const canvas = await html2canvas(elemen, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    // Ubah canvas menjadi gambar dan pdf
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Hitung ukuran pdf
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Tambahkan gambar ke pdf dan Simpan PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    const namaDokumen = (data.tim || (data.peserta && data.peserta[0]) || 'Peserta').replace(/\s+/g, '_');
    pdf.save(`Bukti_Pendaftaran_${namaDokumen}.pdf`);

  } catch (err) {
    console.error("Gagal Unduh Bukti:", err);
    throw err;
  }
};

// Fungsi Sertifikat
export const muatFontSertifikat = async (customFonts = []) => {
  // Font Default
  const fontsToLoad = [
    { name: 'Montserrat', url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf', weight: 'bold' },
    { name: 'Cinzel', url: 'https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-jHgTYo.ttf', weight: 'bold' }
  ];

  // Tambahkan font kustom
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

  // Load semua font 
  const loadPromises = fontsToLoad.map(async (fInfo) => {
    try {
      const scriptFonts = [
        'great vibes', 'alex brush', 'dancing script', 'pacifico', 'sacramento',
        'caveat', 'pinyon script', 'allura', 'parisienne', 'tangerine',
        'satisfy', 'cookie', 'kaushan script', 'courgette', 'lobster',
        'shadows into light', 'permanent marker', 'amatic sc', 'playball',
        'italianno', 'clicker script', 'rochester', 'petit formal script', 'qwigley'
      ];

      // Cek jenis font
      const isScript = scriptFonts.includes((fInfo.name || '').toLowerCase());
      const descriptor = isScript ? {} : { weight: fInfo.weight || 'bold' };

      // Buat font face
      const fontFace = new FontFace(fInfo.name, `url(${fInfo.url})`, descriptor);
      document.fonts.add(fontFace);
      await fontFace.load();

      // Buat elemen dummy agar font ter-render di canvas
      const span = document.createElement('span');
      span.style.fontFamily = `"${fInfo.name}"`;
      span.style.fontWeight = isScript ? 'normal' : 'bold';
      span.style.position = 'absolute';
      span.style.visibility = 'hidden';
      span.innerText = 'font-loader';
      document.body.appendChild(span);

      // Paksa browser memuat font
      await document.fonts.load(`${isScript ? 'normal' : 'bold'} 12px "${fInfo.name}"`);

      // Hapus element dummy setelah selesai load
      document.body.removeChild(span);
    } catch (err) {
      console.error("Gagal memuat font face:", fInfo.name, err);
    }
  });

  // Tunggu semua font selesai dimuat
  await Promise.all(loadPromises);
  await document.fonts.ready;

  // Jeda agar font siap dipakai canvas
  await new Promise(r => setTimeout(r, 150));
};

// Fungsi gambar teks sertifikat
export const gambarTeksSertifikat = (ctx, img, config, params) => {
  const { nama, namaLomba, jenis, peringkat, pengaturan, indexInTeam, globalStartIdx, isWinnerCert } = params;

  // Hitung ukuran font
  const getFs = (s) => Math.round((s / 500) * img.height);

  // Tentukan format nomor sertifikat
  const format = pengaturan.sertifikat_format_nomor || '[no]/SPH/PAN-SGDRC/XII/2024';
  const nomorMulaiPeserta = parseInt(pengaturan.sertifikat_nomor_mulai || '1');
  const nomorMulaiJuara = parseInt(pengaturan.sertifikat_nomor_mulai_juara || '1');
  const nomorMulai = isWinnerCert ? nomorMulaiJuara : nomorMulaiPeserta;

  // Hitung nomor surat
  const finalGlobalIndex = globalStartIdx + indexInTeam;
  const nomorSurat = format.replace('[no]', (nomorMulai + finalGlobalIndex).toString().padStart(4, '0'));

  // Pengaturan dasar teks
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000000';

  // Teks nomor surat
  ctx.font = `${getFs(config.size_nomor)}px "Montserrat"`;
  ctx.fillText(`Nomor: ${nomorSurat}`, img.width / 2, img.height * (config.y_nomor / 100));

  // Nama (Dibuat fleksibel menyesuaikan lebar garis secara dinamis dalam 1 baris)
  const fontSizeNamaOriginal = getFs(config.size_nama);
  let fontSizeNama = fontSizeNamaOriginal;
  ctx.font = `bold ${fontSizeNama}px "${config.font_nama || 'Cinzel'}"`;

  const nameUpper = (nama || "").toUpperCase();
  const maxLebarGaris = img.width * 0.66; // Batas lebar garis horizontal
  const maxLebarKertas = img.width * 0.82; // Batas aman maksimal agar tidak meluber keluar kertas (82% lebar sertifikat)

  // Lapis 1: Kecilkan font maksimal 4px agar pas dengan garis horizontal
  const minFontSizeEstetika = Math.max(fontSizeNamaOriginal - 4, 10);
  let lebarNama = ctx.measureText(nameUpper).width;
  while (lebarNama > maxLebarGaris && fontSizeNama > minFontSizeEstetika) {
    fontSizeNama -= 0.5;
    ctx.font = `bold ${fontSizeNama}px "${config.font_nama || 'Cinzel'}"`;
    lebarNama = ctx.measureText(nameUpper).width;
  }

  // Lapis 2: Jika masih meluber melebihi batas kertas, kecilkan lebih jauh tanpa batasan 4px demi keamanan
  while (lebarNama > maxLebarKertas && fontSizeNama > 8) {
    fontSizeNama -= 0.5;
    ctx.font = `bold ${fontSizeNama}px "${config.font_nama || 'Cinzel'}"`;
    lebarNama = ctx.measureText(nameUpper).width;
  }

  // Koreksi posisi Y agar bagian bawah nama tetap sejajar di atas garis (tidak melayang ke atas)
  const offset = fontSizeNamaOriginal - fontSizeNama;
  const startY = (img.height * (config.y_nama / 100)) + offset;
  ctx.fillText(nameUpper, img.width / 2, startY);

  // Teks status sertifikat
  if (jenis === 'PESERTA') {
    ctx.font = `bold ${getFs(config.size_status)}px "Montserrat"`;
    ctx.fillText(`PESERTA ${(namaLomba || "").toUpperCase()}`, img.width / 2, img.height * (config.y_status / 100));
  }
  // Teks status juara
  else {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${getFs(config.size_status)}px "Montserrat"`;
    ctx.fillText((peringkat || 'JUARA').toUpperCase(), img.width / 2, img.height * (config.y_status / 100));
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${getFs(config.size_kategori || 13)}px "Montserrat"`;
    ctx.fillText(`KATEGORI ${(namaLomba || "").toUpperCase()}`, img.width / 2, img.height * ((config.y_kategori || 72) / 100));
  }
};

// Fungsi Unduh Sertifikat
export const unduhSertifikat = async (item) => {
  try {
    const { default: jsPDF } = await import('jspdf');

    // Ambil pengaturan admin
    const res = await fetch('/api/pengaturan', { cache: 'no-store' });
    const pengaturan = await res.json();

    // Tentukan template sertifikat
    const templateSrc = item.jenis === 'JUARA' ? pengaturan.sertifikat_juara : pengaturan.sertifikat_peserta;
    if (!templateSrc) return;

    // Buat canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Buat gambar
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

      // Konfigurasi dea
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
