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
export const muatFontSertifikat = async (customFonts = [], apakahTebal = false, apakahMiring = false) => {
  // Font Default
  const fontsToLoad = [
    { name: 'Montserrat', url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf', weight: 'bold' }
  ];

  // Tambahkan font kustom
  for (const fontName of customFonts) {
    if (fontName && fontName !== 'Montserrat') {
      try {
        const response = await fetch(`/api/font-proxy?font=${fontName.replace(/ /g, '+')}&bold=${apakahTebal}&italic=${apakahMiring}`);
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
      // Atur descriptor FontFace agar mengenali weight & style yang tepat
      // Atur descriptor FontFace agar mengenali weight & style yang tepat
      const descriptor = (fInfo.name === 'Montserrat')
        ? { weight: 'bold' }
        : {
          weight: apakahTebal ? 'bold' : 'normal',
          style: apakahMiring ? 'italic' : 'normal'
        };

      // Buat font face
      const fontFace = new FontFace(fInfo.name, `url(${fInfo.url})`, descriptor);
      document.fonts.add(fontFace);
      await fontFace.load();

      // Buat elemen dummy agar font ter-render di canvas
      const span = document.createElement('span');
      span.style.fontFamily = `"${fInfo.name}"`;
      span.style.fontWeight = fInfo.name === 'Montserrat' || apakahTebal ? 'bold' : 'normal';
      span.style.fontStyle = apakahMiring ? 'italic' : 'normal';
      span.style.position = 'absolute';
      span.style.visibility = 'hidden';
      span.innerText = 'font-loader';
      document.body.appendChild(span);

      // Paksa browser memuat font
      await document.fonts.load(`${apakahMiring ? 'italic' : 'normal'} ${fInfo.name === 'Montserrat' || apakahTebal ? 'bold' : 'normal'} 12px "${fInfo.name}"`);

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

  // Nama
  const fontSizeNamaOriginal = getFs(config.size_nama);
  let fontSizeNama = fontSizeNamaOriginal;

  // Mengatur gaya font berdasarkan konfigurasi
  const gayaTebal = config.apakah_tebal ? 'bold ' : '';
  const gayaMiring = config.apakah_miring ? 'italic ' : '';
  const gayaFont = `${gayaMiring}${gayaTebal}`;
  ctx.font = `${gayaFont}${fontSizeNama}px "${config.font_nama || 'Cinzel'}"`;

  // Format Nama
  const namaBersih = (nama || "").trim().replace(/\s+/g, ' ');
  let nameFormatted = namaBersih.toUpperCase();
  if (config.format_huruf === 'lowercase') {
    nameFormatted = namaBersih.toLowerCase();
  } else if (config.format_huruf === 'capitalize') {
    nameFormatted = namaBersih.split(' ').map(kata => kata.charAt(0).toUpperCase() + kata.slice(1).toLowerCase()).join(' ');
  }

  // Lebar Garis
  const maxLebarGaris = img.width * 0.66;
  const maxLebarKertas = img.width * 0.82;

  // Ukuran Font Nama
  const minFontSizeEstetika = Math.max(fontSizeNamaOriginal - 4, 10);
  let lebarNama = ctx.measureText(nameFormatted).width;
  while (lebarNama > maxLebarGaris && fontSizeNama > minFontSizeEstetika) {
    fontSizeNama -= 0.5;
    ctx.font = `${gayaFont}${fontSizeNama}px "${config.font_nama || 'Cinzel'}"`;
    lebarNama = ctx.measureText(nameFormatted).width;
  }

  // Batas Maksimal Kertas
  while (lebarNama > maxLebarKertas && fontSizeNama > 8) {
    fontSizeNama -= 0.5;
    ctx.font = `${gayaFont}${fontSizeNama}px "${config.font_nama || 'Cinzel'}"`;
    lebarNama = ctx.measureText(nameFormatted).width;
  }

  // Posisi X Nama
  const isNamaPanjang = lebarNama > maxLebarGaris || fontSizeNama < fontSizeNamaOriginal;
  const targetXNama = isNamaPanjang ? img.width * 0.48 : img.width / 2;

  // Posisi Y Nama
  const offset = fontSizeNamaOriginal - fontSizeNama;
  const startY = (img.height * (config.y_nama / 100)) + offset;
  ctx.fillText(nameFormatted, targetXNama, startY);

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
  }

  // Teks Kategori Juara (Hanya jika sertifikat juara)
  if (jenis === 'JUARA') {
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
